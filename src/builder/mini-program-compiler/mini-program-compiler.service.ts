import { CssSelector, SelectorMatcher } from '@angular/compiler';
import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
  R3TemplateDependency,
} from '@angular/compiler';
import type { NgtscProgram } from '@angular/compiler-cli';
import type { NgCompiler } from '@angular/compiler-cli/src/ngtsc/core';
import type {
  ClassRecord,
  TraitCompiler,
} from '@angular/compiler-cli/src/ngtsc/transform';
import * as fs from 'fs';
import path from 'path';
import { Injector } from 'static-injector';
import ts, { ClassDeclaration } from 'typescript';
import { recordLibraryMetaMiss } from '../library/library-meta-diagnostics';
import { lookupLibraryMeta } from '../library/library-meta-reader';
import {
  LibraryComponentMetaRecord,
  safeStringList,
} from '../library/library-meta-schema';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { pathKey, toNativePath } from '../util/path';
import {
  recordStrippedTemplate,
  stripWxsFromAst,
} from '../wxs/wxs-angular-strip';
import type { WxsDeclaration } from '../wxs/wxs-declare';
import { getDeclaredWxs, rewriteWxsTemplates } from '../wxs/wxs-rewrite';
import { ComponentCompilerService } from './component-compiler.service';
import { recordGeneratedWxml } from './manifest-registry';
import { MetaCollection } from './meta-collection';
import { ComponentContext } from './parse-node';
import {
  ComponentMetaFromLibrary,
  DirectiveMetaFromLibrary,
  InlineStyleSource,
  MetaFromLibrary,
  ResolvedDataGroup,
  UseComponent,
  makeComponentKey,
} from './type';

/**
 * `meta.template` 的运行时形状。
 *
 * 公开声明只写了 `nodes` / `ngContentSelectors` / `preserveWhitespaces`，但 ngtsc
 * 实际塞进来的是模板解析结果本身：还带着原文 `content`（`file.fileName` 是 `null`，
 * 只能按内容登记）与解析 `errors`（见 `assertTemplateParsed`）。
 */
type ComponentTemplateMeta = NonNullable<
  R3ComponentMetadata<R3TemplateDependency>['template']
> & {
  /** 模板原文，与磁盘上的 .html 逐字节相同 */
  content?: string;
  /** 模板解析错误，Angular 不会自己抛，见 `assertTemplateParsed` */
  errors?: unknown[];
};

/**
 * inline `template` 的坐标平移量。
 *
 * ngtsc 解析 inline 模板时把整棵 AST 的 `sourceSpan` 平移到宿主 .ts 文件坐标系
 * （平移量 = 反引号后一位）；`templateUrl` 那条路不平移。两者下 `meta.template.content`
 * 都是模板文本本身，不同坐标系下拿 span 去切 `content` 会全部越界，
 * `slice` 把越界钳成「追加到末尾」，不报错但改写全跑到尾部。
 *
 * 判定只看装饰器写了 `template` 还是 `templateUrl`。返回 `0` = 无需平移。
 */
function inlineTemplateSpanBase(classDeclaration: ClassDeclaration): number {
  for (const dec of ts.getDecorators(classDeclaration) ?? []) {
    const expr = dec.expression;
    if (!ts.isCallExpression(expr) || expr.arguments.length !== 1) {
      continue;
    }
    const arg = expr.arguments[0];
    if (!ts.isObjectLiteralExpression(arg)) {
      continue;
    }
    const sf = classDeclaration.getSourceFile();
    for (const prop of arg.properties) {
      if (!ts.isPropertyAssignment(prop) || !prop.name) {
        continue;
      }
      const name = prop.name.getText();
      if (name === 'templateUrl') {
        // 两种都写了时 ngtsc 以 templateUrl 为准，这里跟着它走
        return 0;
      }
      if (
        name === 'template' &&
        (ts.isStringLiteral(prop.initializer) ||
          ts.isNoSubstitutionTemplateLiteral(prop.initializer))
      ) {
        return prop.initializer.getStart(sf) + 1;
      }
    }
  }
  return 0;
}

/** 把「可能是 undefined / null / 非数组」的 ngtsc 字段归一成字符串数组。 */
function toStringList(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * 从装饰器里直接读出 `styles: [...]` 的字面量原文。
 * 库构建的预处理器会把 `analysis.inlineStyles` 置空，装饰器 AST 才是没被动过的原文。
 * 只认字面量：`styles: [someVar]` 求不出值，只能放弃。
 */
function decoratorInlineStyles(classDeclaration: ClassDeclaration): string[] {
  const list: string[] = [];
  for (const dec of ts.getDecorators(classDeclaration) ?? []) {
    const expr = dec.expression;
    if (!ts.isCallExpression(expr) || expr.arguments.length !== 1) {
      continue;
    }
    const arg = expr.arguments[0];
    if (!ts.isObjectLiteralExpression(arg)) {
      continue;
    }
    for (const prop of arg.properties) {
      if (
        !ts.isPropertyAssignment(prop) ||
        !prop.name ||
        prop.name.getText() !== 'styles'
      ) {
        continue;
      }
      // `.text` 是扫描器已经反转义过的值，`'a\nb'` 拿到的就是带真换行的串
      const items = ts.isArrayLiteralExpression(prop.initializer)
        ? prop.initializer.elements
        : [prop.initializer];
      for (const item of items) {
        if (
          ts.isStringLiteral(item) ||
          ts.isNoSubstitutionTemplateLiteral(item)
        ) {
          list.push(item.text);
        }
      }
    }
  }
  return list;
}

/** `R3TemplateDependencyKind.NgModule`，compiler 没有把这个枚举导出到运行时 */
const R3_TEMPLATE_DEPENDENCY_KIND_NG_MODULE = 2;

/** `R3TemplateDependencyKind.Pipe`，同上 */
const R3_TEMPLATE_DEPENDENCY_KIND_PIPE = 1;

/**
 * 管道依赖不进指令匹配表。管道没有 selector，也不产生 host 绑定，混进来只会
 * 注册出假选择器，并污染库元数据缺失诊断。
 */
function isPipeDependency(dep: { kind?: unknown }): boolean {
  return dep.kind === R3_TEMPLATE_DEPENDENCY_KIND_PIPE;
}

/**
 * ngtsc 的 `ClassPropertyMapping` 转成 R3 的绑定名数组（绑定名存在 `reverseMap` 的 key 里）。
 */
function toBindingNameList(
  mapping: unknown,
  reverseKey: 'reverseMap',
): string[] {
  if (mapping == null) {
    return [];
  }
  if (Array.isArray(mapping)) {
    return mapping as string[];
  }
  const reverseMap = (
    mapping as unknown as {
      [reverseKey]?: Map<string, unknown>;
    }
  )[reverseKey];
  if (reverseMap instanceof Map) {
    return [...reverseMap.keys()];
  }
  return Object.keys(mapping as Record<string, unknown>);
}

/**
 * 模板解析错误必须在这里拦下来。Angular 只把它放进 `meta.template.errors`，不会自己抛，
 * 忽略的后果是节点树为空、构建静默成功、页面白屏。
 * 典型触发：模板正文里写了裸的 `{`（会被当 ICU 消息解析）。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertTemplateParsed(meta: any, where: string): void {
  const errors = meta?.template?.errors;
  if (!Array.isArray(errors) || errors.length === 0) {
    return;
  }
  const detail = errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => {
      const msg = e?.message ?? String(e);
      const span = e?.span ?? e?.errorSpan;
      const at = span?.start
        ? ` (行 ${span.start.line + 1} 列 ${span.start.col + 1})`
        : '';
      return `    - ${msg}${at}`;
    })
    .join('\n');
  throw new Error(
    `模板解析失败：${where}\n${detail}\n` +
      `  提示：模板正文里的裸「{」/「}」会被 Angular 当 ICU 消息解析，` +
      `要当字面量请写 {{ '{' }} 或 HTML 实体 &#123;。`,
  );
}

export class MiniProgramCompilerService {
  private ngCompiler!: NgCompiler;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private componentMap = new Map<ClassDeclaration, R3ComponentMetadata<any>>();
  private directiveMap = new Map<ClassDeclaration, R3DirectiveMetadata>();
  private resolvedDataGroup: ResolvedDataGroup = {
    style: new Map<string, string[]>(),
    inlineStyle: new Map<string, InlineStyleSource[]>(),
    outputContent: new Map<string, string>(),
    wxsModules: new Map<string, WxsDeclaration[]>(),
    useComponentPath: new Map<
      string,
      {
        localPath: UseComponent[];
        libraryPath: UseComponent[];
      }
    >(),
    otherMetaCollectionGroup: {},
  };
  constructor(
    private ngTscProgram: NgtscProgram,
    private injector: Injector,
    private buildPlatform: BuildPlatform,
  ) {}
  init() {
    this.ngCompiler = this.ngTscProgram.compiler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traitCompiler: TraitCompiler = (this.ngCompiler as any).compilation
      .traitCompiler;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes = (traitCompiler as any).classes as Map<
      ts.ClassDeclaration,
      ClassRecord
    >;
    for (const [classDeclaration, classRecord] of classes) {
      const fileName = classDeclaration.getSourceFile().fileName;
      const componentTraits = classRecord.traits.filter(
        (trait) => trait.handler.name === 'ComponentDecoratorHandler',
      );
      if (componentTraits.length > 1) {
        throw new Error('组件装饰器异常');
      }
      componentTraits.forEach((trait) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meta: R3ComponentMetadata<any> = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).analysis?.meta,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trait as any).resolution,
        };
        assertTemplateParsed(
          meta,
          makeComponentKey(fileName, classDeclaration.name?.getText() ?? '?'),
        );
        const componentKey = makeComponentKey(
          fileName,
          classDeclaration.name?.getText() ?? '',
        );
        this.resolvedDataGroup.style.set(
          componentKey,
          this.resolveStyleUrls(
            fileName,
            classDeclaration.name?.getText() ?? '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (trait as any)?.analysis?.styleUrls,
          ),
        );
        this.resolvedDataGroup.inlineStyle.set(
          componentKey,
          this.resolveInlineStyles(
            fileName,
            classDeclaration.name?.getText() ?? '',
            classDeclaration,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (trait as any)?.analysis?.inlineStyles,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (trait as any)?.analysis?.template?.styles,
          ),
        );
        this.componentMap.set(
          ts.getOriginalNode(classDeclaration) as ts.ClassDeclaration,
          meta,
        );
      });
      const directiveTraits = classRecord.traits.filter(
        (trait) => trait.handler.name === 'DirectiveDecoratorHandler',
      );
      if (directiveTraits.length > 1) {
        throw new Error('指令装饰器异常');
      }
      directiveTraits.forEach((trait) => {
        this.directiveMap.set(
          ts.getOriginalNode(classDeclaration) as ts.ClassDeclaration,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (trait as any).analysis?.meta,
        );
      });
    }
  }

  async exportComponentBuildMetaMap() {
    // wxs 改写必须赶在任何模板 walk 之前跑完，walk 读到的表达式与 emit 用的必须是同一份。
    // 同时记下每个组件用到的模块，驱动后续 .wxs 产物落盘
    const wxsModules = new Map<string, WxsDeclaration[]>();
    for (const [classDeclaration, meta] of this.componentMap) {
      const componentSourceFile = pathKey(
        classDeclaration.getSourceFile().fileName,
      );
      const componentKey = makeComponentKey(
        componentSourceFile,
        classDeclaration.name?.getText() ?? '',
      );
      const template = meta.template as ComponentTemplateMeta | undefined;
      const { declarations } = await rewriteWxsTemplates(
        template?.nodes ?? [],
        // 记下源文件：walk 阶段的事件下推要靠它反查声明集合
        componentSourceFile,
      );
      /**
       * 就地产出「给 Angular 编译的那份模板」，必须紧跟在 wxs 改写后面：
       * 一次走树同时喂给 wxml 和 Angular 两侧，不存在第二个真相源。
       * inline 模板的 span 被 ngtsc 平到了 .ts 坐标系，得把平移量递下去。
       */
      if (declarations.length && typeof template?.content === 'string') {
        recordStrippedTemplate(
          template.content,
          stripWxsFromAst(
            template.nodes ?? [],
            template.content,
            componentSourceFile,
            [],
            inlineTemplateSpanBase(classDeclaration),
          ),
        );
      }
      if (declarations.length) {
        wxsModules.set(componentKey, declarations);
      }
    }

    for (const [classDeclaration, meta] of this.componentMap) {
      const fileName = pathKey(classDeclaration.getSourceFile().fileName);
      let directiveMatcher: SelectorMatcher | undefined;
      const declarations = this.resolveTemplateDeclarations(
        classDeclaration,
        meta,
      );
      if (declarations.length > 0) {
        const matcher = new SelectorMatcher();
        for (const directive of declarations) {
          const selector = directive.selector;
          const directiveClassDeclaration = ts.getOriginalNode(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (directive as any).ref.node,
          ) as ts.ClassDeclaration;
          const directiveMeta = this.directiveMap.get(
            directiveClassDeclaration,
          );
          const componentMeta = this.componentMap.get(
            directiveClassDeclaration,
          );
          let libraryMeta: MetaFromLibrary | undefined;
          if (directive.isComponent) {
            libraryMeta = this.getLibraryComponentMeta(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (directive as any).ref.node,
            );
          }
          if (!directive.isComponent && !directiveMeta) {
            libraryMeta = this.getLibraryDirectiveMeta(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (directive as any).ref.node,
            );
          }
          matcher.addSelectables(CssSelector.parse(selector), {
            directive,
            directiveMeta,
            componentMeta,
            libraryMeta,
          });
        }
        directiveMatcher = matcher;
      }
      const componentBuildMeta = this.buildComponentMeta(
        directiveMatcher,
        meta,
        fileName,
      );
      const componentKey = makeComponentKey(
        fileName,
        classDeclaration.name?.getText() ?? '',
      );
      this.resolvedDataGroup.outputContent.set(
        componentKey,
        componentBuildMeta.content,
      );

      // 同源记录：此刻组件身份与生成的 wxml 同时已知，配对关系是权威的，
      // 供「节点下标两端等价性」测试按组件精确比对
      recordGeneratedWxml(
        componentKey,
        classDeclaration.name?.getText() ?? '',
        fileName,
        componentBuildMeta.content,
      );

      this.resolvedDataGroup.useComponentPath.set(
        componentKey,
        componentBuildMeta.useComponentPath,
      );
      for (const key in componentBuildMeta.otherMetaGroup) {
        if (
          Object.prototype.hasOwnProperty.call(
            componentBuildMeta.otherMetaGroup,
            key,
          )
        ) {
          const element = componentBuildMeta.otherMetaGroup[key];
          this.resolvedDataGroup.otherMetaCollectionGroup[key] =
            this.resolvedDataGroup.otherMetaCollectionGroup[key] ||
            new MetaCollection();
          this.resolvedDataGroup.otherMetaCollectionGroup[key].merge(element);
        }
      }
    }

    this.resolvedDataGroup.useComponentPath.forEach((value, key) => {
      value.libraryPath = Array.from(new Set(value.libraryPath));
      value.localPath = Array.from(new Set(value.localPath));
    });

    this.resolvedDataGroup.wxsModules = wxsModules;

    return this.resolvedDataGroup;
  }

  /**
   * 取得组件模板可用的指令列表（管道被剔除，见 `isPipeDependency`）。
   * standalone 组件的 `imports` 允许直接引入 NgModule，那种项只带 `type.node`，
   * 没有 `ref.node`，直接查元数据会炸。这里用 `TypeCheckScope` 拿扁平化后的作用域。
   */
  private resolveTemplateDeclarations(
    classDeclaration: ts.ClassDeclaration,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: R3ComponentMetadata<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    const rawDeclarations = meta.declarations as unknown;
    if (!Array.isArray(rawDeclarations)) {
      // `meta.declarations` 缺失 = 这个组件的 Angular 分析根本没跑成（典型诱因：上游还有编译错误）。
      // 报错必须带组件身份，否则只能看到一个 undefined 属性访问
      throw new Error(
        `[mini-program-compiler] 组件 ${
          classDeclaration.name?.getText() ?? '?'
        }（${toNativePath(
          classDeclaration.getSourceFile().fileName,
        )}）的 meta.declarations 缺失，Angular 组件分析未完成。` +
          `这通常是上游编译错误的连带结果，先把真正的报错修掉再来。`,
      );
    }
    const declarations = rawDeclarations as unknown[] as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const importsNgModule = declarations.some(
      (item) => item.kind === R3_TEMPLATE_DEPENDENCY_KIND_NG_MODULE,
    );
    if (!importsNgModule) {
      return declarations.filter((item) => !isPipeDependency(item));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scopeRegistry = (this.ngCompiler as any).compilation
      .typeCheckScopeRegistry;
    const scope = scopeRegistry.getTypeCheckScope({
      node: classDeclaration,
    } as never);
    // TypeCheckScope 里是 ngtsc 的 DirectiveMeta，下游读的是 R3 的形状，这里对齐字段名。
    // 只取 scope.directives：PipeMeta 没有 selector，进匹配表只会注册出假选择器
    return [...scope.directives].map((dep) => {
      const node = dep.ref.node as ts.ClassDeclaration;
      return {
        ...dep,
        isComponent: (dep as { isComponent?: boolean }).isComponent ?? false,
        importedFile: node.getSourceFile(),
        inputs: toBindingNameList(
          (dep as { inputs?: unknown }).inputs,
          'reverseMap',
        ),
        outputs: toBindingNameList(
          (dep as { outputs?: unknown }).outputs,
          'reverseMap',
        ),
      };
    });
  }

  private buildComponentMeta(
    directiveMatcher: SelectorMatcher | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentMeta: R3ComponentMetadata<any>,
    sourceFile?: string,
  ) {
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: ComponentCompilerService },
        { provide: COMPONENT_META, useValue: componentMeta },
        {
          provide: ComponentContext,
          useFactory: () => {
            const ctx = new ComponentContext(directiveMatcher);
            // 事件下推在 walk 阶段发生，而事件不改写，所以识别集合要从改写阶段带到 walk 阶段
            ctx.declaredWxsModules = getDeclaredWxs(sourceFile);
            /**
             * 给分析侧留一份解析用的原文，用来数 `i18n-*` 属性占的声明槽。
             * 必须是 Angular 解析用的那一份：元素的 `sourceSpan` 是相对它算的。
             */
            ctx.templateText = (
              componentMeta.template as ComponentTemplateMeta | undefined
            )?.content;
            return ctx;
          },
        },
      ],
    });
    const instance = injector.get(ComponentCompilerService);
    return instance.compile();
  }
  private resolveStyleUrl(componentPath: string, styleUrl: string) {
    // 结果直接给 fs 用，要的是可用路径而不是身份令牌
    return toNativePath(path.resolve(path.dirname(componentPath), styleUrl));
  }
  /**
   * 把 `@Component.styleUrls` 解析成绝对路径，逐个验文件在不在。
   * 缺文件必须当场抛：Angular 的 compiler host 在 `fileExists` 为 false 时直接返回 null，
   * 不报 diagnostic、退出码 0，要到运行时才报 `needs to be compiled using the JIT compiler`。
   */
  private resolveStyleUrls(
    componentPath: string,
    className: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawStyleUrls: any,
  ): string[] {
    const list: { url?: unknown }[] = Array.isArray(rawStyleUrls)
      ? rawStyleUrls
      : [];
    const missing = list
      .map((item) => item?.url)
      .filter(
        (url): url is string => typeof url === 'string' && url.startsWith('.'),
      )
      .filter(
        (url) => !fs.existsSync(this.resolveStyleUrl(componentPath, url)),
      );
    if (missing.length) {
      throw new Error(
        `组件 ${className}（${toNativePath(componentPath)}）的 styleUrls 指向的文件不存在：\n` +
          missing.map((url) => `  - ${url}`).join('\n'),
      );
    }
    return list.map((item) =>
      this.resolveStyleUrl(componentPath, String(item?.url)),
    );
  }
  /**
   * 收集组件的内联样式。三个源按原文去重后合并：
   *   1. 装饰器 AST 里的 `styles: [...]` 字面量（两边都可靠）
   *   2. `analysis.inlineStyles`（ngtsc 求过值，能接住非字面量写法）
   *   3. `analysis.template.styles`（模板里的 `<style>` 块）
   * 这里只拿原文，编译在消费侧。
   */
  private resolveInlineStyles(
    componentPath: string,
    className: string,
    classDeclaration: ClassDeclaration,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawInlineStyles: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawTemplateStyles: any,
  ): InlineStyleSource[] {
    const texts = [
      ...decoratorInlineStyles(classDeclaration),
      ...toStringList(rawInlineStyles),
      ...toStringList(rawTemplateStyles),
    ];
    const seen = new Set<string>();
    const list: InlineStyleSource[] = [];
    for (const text of texts) {
      if (!text.trim() || seen.has(text)) {
        continue;
      }
      seen.add(text);
      list.push({
        text,
        // 留在组件目录里，但带上类名 + 下标，同文件多组件 / 多条样式不会互盖
        key: path.join(
          path.dirname(componentPath),
          `${className}.${list.length}.inline`,
        ),
      });
    }
    return list;
  }
  getDirectiveMap() {
    return this.directiveMap;
  }
  getComponentMap() {
    return this.componentMap;
  }
  private getLibraryDirectiveMeta(
    classDeclaration: ts.ClassDeclaration,
  ): DirectiveMetaFromLibrary | undefined {
    const className = classDeclaration.name?.getText();
    if (!className) {
      return undefined;
    }
    const sourceFile = classDeclaration.getSourceFile();

    /** 唯一来源：库构建产出的 sidecar（`<库根>/mp-library-meta.json`）。 */
    const lookup = lookupLibraryMeta(sourceFile.fileName, className);
    if (lookup.record) {
      return {
        isComponent: false,
        listeners: safeStringList(lookup.record.listeners),
        properties: safeStringList(lookup.record.properties),
      };
    }

    // 查不到不能静默返回空数组，登记下来由构建器在每轮结束时打汇总日志
    recordLibraryMetaMiss({
      className,
      sourceFile: sourceFile.fileName,
      reason: lookup.entry ? 'sidecar-missing-class' : 'no-sidecar',
    });
    return {
      isComponent: false,
      listeners: [],
      properties: [],
    };
  }
  private getLibraryComponentMeta(
    classDeclaration: ts.ClassDeclaration,
  ): ComponentMetaFromLibrary | undefined {
    const className = classDeclaration.name?.getText();
    if (!className) {
      return undefined;
    }
    const lookup = lookupLibraryMeta(
      classDeclaration.getSourceFile().fileName,
      className,
    );
    if (lookup.kind !== 'component' || !lookup.record) {
      return undefined;
    }
    const record = lookup.record as LibraryComponentMetaRecord;
    return {
      exportPath: record.outputPath,
      listeners: safeStringList(record.listeners),
      properties: safeStringList(record.properties),
      isComponent: true,
    };
  }
}
