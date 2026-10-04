import type {
  R3ComponentMetadata,
  R3DirectiveMetadata,
  R3TemplateDependency,
  SelectorMatcher,
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
import { angularCompilerPromise } from '../util';
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

/** `R3TemplateDependencyKind.NgModule`，compiler 没有把这个枚举导出到运行时 */
const R3_TEMPLATE_DEPENDENCY_KIND_NG_MODULE = 2;

/** `R3TemplateDependencyKind.Pipe`，同上 */
const R3_TEMPLATE_DEPENDENCY_KIND_PIPE = 1;

/**
 * 管道依赖不进指令匹配表。
 *
 * 管道没有 `selector`，也不产生任何 host 事件/属性绑定 —— 它是纯值变换，
 * 结果在 AST 遍历（`BindingPipe`）里就地算完塞进数据，与「元素上挂了
 * 什么指令」无关。混进来的只有坏处：
 *
 * - `CssSelector.parse(undefined)` 会把 `undefined` 当标签名注册出一个假选择器；
 * - 库元数据缺失诊断会把 AsyncPipe / UpperCasePipe 这类误报成
 *   「不会生成 host 绑定」，把真问题淹掉。
 */
function isPipeDependency(dep: { kind?: unknown }): boolean {
  return dep.kind === R3_TEMPLATE_DEPENDENCY_KIND_PIPE;
}

/**
 * ngtsc 的 `ClassPropertyMapping` 转成 R3 的绑定名数组。
 *
 * R3 的 `inputs` / `outputs` 是模板上能看到的绑定名（`string[]`），而 ngtsc 的
 * `DirectiveMeta` 用的是 `ClassPropertyMapping`，绑定名存在 `reverseMap` 的 key 里。
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
 * 模板解析错误必须在这里拦下来。
 *
 * Angular 把模板解析错误放进 `meta.template.errors`，**不会**自己抛。
 * 本构建器直接拿 `template.nodes` 产 wxml，错误被忽略的后果是：
 * 节点树为空 → wxml 只剩一个空 `<block wx:if="{{hasLoad}}"></block>`，
 * 构建**静默成功**，页面白屏，日志里一个字都不提。
 *
 * 典型触发：模板正文里写了裸的 `{`（Angular 会当 ICU 消息解析），
 * 比如 `import { ... } from 'x'` 这种示例文案。
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
          `${path.normalize(fileName)}#${classDeclaration.name?.getText() ?? '?'}`,
        );
        this.resolvedDataGroup.style.set(
          makeComponentKey(
            path.normalize(fileName),
            classDeclaration.name?.getText() ?? '',
          ),
          this.resolveStyleUrls(
            fileName,
            classDeclaration.name?.getText() ?? '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (trait as any)?.analysis?.styleUrls,
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
    const { SelectorMatcher, CssSelector } = await angularCompilerPromise;

    // wxs 改写必须赶在任何模板 walk 之前跑完。
    // walk 阶段读到的表达式和最终 emit 用的必须是同一份，
    // 否则下标和 wxml 会对不上。
    // 同时把每个组件用到的模块记下来，驱动后续 .wxs 产物落盘。
    const wxsModules = new Map<string, WxsDeclaration[]>();
    for (const [classDeclaration, meta] of this.componentMap) {
      const componentSourceFile = path.normalize(
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
       * 就地产出「给 Angular 编译的那份模板」。
       *
       * 必须紧跟在 wxs 改写后面：此时 AST 已带枝叶数组，一次走树同时喂给
       * wxml 和 Angular 两侧，不存在第二个真相源。
       * 只按内容登记（`file.fileName` 为 null）。
       */
      if (declarations.length && typeof template?.content === 'string') {
        recordStrippedTemplate(
          template.content,
          stripWxsFromAst(
            template.nodes ?? [],
            template.content,
            componentSourceFile,
          ),
        );
      }
      if (declarations.length) {
        wxsModules.set(componentKey, declarations);
      }
    }

    for (const [classDeclaration, meta] of this.componentMap) {
      const fileName = path.normalize(
        classDeclaration.getSourceFile().fileName,
      );
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

      // 同源记录：此刻组件身份（componentKey）与生成的 wxml 同时已知，
      // 配对关系是权威的。供「节点下标两端等价性」测试按组件精确比对，
      // 避免事后从制品反推配对（会被 code-splitting 打败）。
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
   * 取得组件模板可用的**指令**列表（管道被剔除，见 `isPipeDependency`）。
   *
   * standalone 组件的 `imports` 允许直接引入 NgModule，此时 `meta.declarations` 里会出现
   * `R3TemplateDependencyKind.NgModule`（值为 2）的项。它只带一个指向模块标识符的
   * `type.node`，没有普通依赖上的 `ref.node`，直接拿去查元数据会炸。
   *
   * 这里改用 Angular 自己的 `TypeCheckScope` 拿扁平化之后的作用域（模块会被展开成它
   * 导出的指令），非 standalone 组件保持原样。
   */
  private resolveTemplateDeclarations(
    classDeclaration: ts.ClassDeclaration,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meta: R3ComponentMetadata<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    const rawDeclarations = meta.declarations as unknown;
    if (!Array.isArray(rawDeclarations)) {
      // `meta.declarations` 缺失 = 这个组件的 Angular 分析根本没跑成
      // （典型诱因：上游还有编译错误，比如 standalone 指令被 NgModule
      // declarations；或者组件 meta 因错被降级）。
      // 以前这里直接 `declarations.some(...)`，抛出来的是
      // “Cannot read properties of undefined (reading 'some')”，
      // 看不出是哪个组件、为什么，排查成本极高。改成带身份的报错。
      throw new Error(
        `[mini-program-compiler] 组件 ${
          classDeclaration.name?.getText() ?? '?'
        }（${path.normalize(
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
    // TypeCheckScope 里是 ngtsc 的 DirectiveMeta / PipeMeta，而下游
    // `ComponentContext` 读的是 R3 的 `R3DirectiveDependencyMetadata`，
    // 两边字段名不一致（主要是 `importedFile`），这里对齐成 R3 的形状。
    // 只取 scope.directives：scope.pipes 里的 PipeMeta 没有 selector，
    // 进匹配表只会注册出假选择器，并污染库元数据缺失诊断。
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
            // 事件下推在 walk 阶段发生，而事件不改写（没 plan 可挂），
            // 所以识别集合要从改写阶段带到 walk 阶段
            ctx.declaredWxsModules = getDeclaredWxs(sourceFile);
            /**
             * 给分析侧留一份解析用的原文，用来数 `i18n-*` 属性占的声明槽。
             * 必须是 Angular **解析用的那一份**：元素的 `sourceSpan` 是相对它算的。
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
    return path.normalize(path.resolve(path.dirname(componentPath), styleUrl));
  }
  /**
   * 把 `@Component.styleUrls` 解析成绝对路径，逐个验文件在不在。
   *
   * 缺文件必须在这当场抛。`@angular/build` 的 compiler host 在
   * `resourceNameToFileName` 里 `fileExists` 为 false 时直接 `return null`，
   * ngtsc 就把这条样式整个跳过：不报 diagnostic、不生成 ɵcmp、退出码 0。
   * 表现是构建全绿，运行时才在小程序里报
   * `needs to be compiled using the JIT compiler`。
   *
   * 和 `assertTemplateParsed` 同一层、同一个理由：Angular 把错误放进数据
   * 而不抛，本构建器就在消费这份数据的这一层拦下来。
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
        `组件 ${className}（${path.normalize(componentPath)}）的 styleUrls 指向的文件不存在：\n` +
          missing.map((url) => `  - ${url}`).join('\n'),
      );
    }
    return list.map((item) =>
      this.resolveStyleUrl(componentPath, String(item?.url)),
    );
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

    /**
     * 唯一来源：库构建产出的 sidecar（`<库根>/mp-library-meta.json`）。
     *
     * 不做任何版本兼容 —— 旧版把 `declare const X_Listeners` 内联在 d.ts
     * 里的格式已废弃，不再读。
     */
    const lookup = lookupLibraryMeta(sourceFile.fileName, className);
    if (lookup.record) {
      return {
        isComponent: false,
        listeners: safeStringList(lookup.record.listeners),
        properties: safeStringList(lookup.record.properties),
      };
    }

    // 查不到：**不再静默返回空数组而不留痕迹**。
    // 旧行为在这里直接 `{listeners: []}` 覆盖掉 host.listeners，
    // wxml 一个事件绑定都没有且零报错。现在登记下来，
    // 由构建器在每轮结束时打汇总日志。
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
