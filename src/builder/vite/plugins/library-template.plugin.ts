import { dirname, join, normalize, strings } from '@angular-devkit/core';
import { createCssSelectorForTs } from 'cyia-code-util';
import ts from 'typescript';
import type { Plugin } from 'vite';
import type {
  LibraryTemplateScopeService,
  ExtraTemplateData as ScopeExtraTemplateData,
} from '../../application/library-template-scope.service';
import type { LibraryTemplateLiteralConvertOptions } from '../../application/type';
import {
  GLOBAL_TEMPLATE_SUFFIX,
  LIBRARY_COMPONENT_METADATA_SUFFIX,
  LIBRARY_OUTPUT_ROOTDIR,
} from '../../library';
import type {
  ExportLibraryComponentMeta,
  ExtraTemplateData,
} from '../../library/type';
import { BuildPlatform } from '../../platform/platform';
import { libraryTemplateScopeName, literalResolve } from '../../util';
import { toPosixPath } from '../../util/asset-path';

/**
 * 产物路径归一：正斜杠 + 剥前导 `/`。
 *
 * devkit 的 join/normalize 会带前导斜杠，rollup 的 emitFile 不接受；
 * 而 Windows 下若混进反斜杠，会污染 app.js 的 require 字面量
 * （`\c` 之类无效转义被吃掉）。统一走 toPosixPath。
 */
function toRollupFileName(p: string) {
  return toPosixPath(normalize(p) as string);
}

export interface LibraryTemplatePluginOptions {
  buildPlatform: BuildPlatform;
  templateScope: LibraryTemplateScopeService;
}

/**
 * 虚拟 entry 模块前缀。
 *
 * 对应 webpack 的 `dynamic://__license/<id>.ts`。`\0` 是 rollup 约定的
 * 「虚拟模块」标记，防止和其他插件/文件系统路径撞车。
 */
const LIBRARY_ENTRY_VIRTUAL = '\0mp-library-entry:';

/**
 * library 组件的 JS entry。
 *
 * webpack 侧是 DynamicLibraryComponentEntryPlugin 用 finishMake + addEntry
 * 做的；Vite/Rollup 的等价物是 emitFile({ type: 'chunk' })：
 * 给一个模块 id，rollup 会把它当成一个独立 entry 打出来。
 *
 * 产物必须是 `library/<libraryPath>.js`，内容就是把组件注册进小程序侧：
 *
 *   import * as amp from 'angular-miniprogram';
 *   import * as lib from '<库源文件>';
 *   amp.componentRegistry(lib.<ClassName>);
 *
 * 小程序自定义组件必须在其路径下有 .js 才能被运行时加载，
 * 少了这个产物组件就是空的。
 */
function libraryEntryModuleSource(meta: {
  className: string;
  importPath: string;
}): string {
  return (
    `import * as amp from 'angular-miniprogram';\n` +
    `import * as lib from ${JSON.stringify(meta.importPath)};\n` +
    `amp.componentRegistry(lib.${meta.className});\n`
  );
}

/**
 * 把 webpack 的 library.loader + library-template.loader 合成一个 Vite transform。
 *
 * 两个 loader 都是纯源码分析（CSS selector 抓元数据变量）+ emitFile + 注册 scope，
 * 没有真正依赖 webpack runtime，替换点只有：
 *   - this.emitFile(name, src)      -> this.emitFile({ type: 'asset', ... })
 *   - this._compilation[Symbol]     -> 闭包直接持有 scope service
 *   - this.resourcePath / context   -> 模块 id
 */
export function libraryTemplatePlugin(
  options: LibraryTemplatePluginOptions
): Plugin {
  const { buildPlatform, templateScope } = options;
  const fileExtname = buildPlatform.fileExtname;
  /**
   * 已发现的 library 组件，按 meta.id 去重。
   * transform 会被多次调用（同文件多组件 / 重复访问），靠 Map 保证
   * 每个组件只 emit 一个 entry chunk。
   */
  const libraryEntries = new Map<
    string,
    { className: string; importPath: string; libraryPath: string }
  >();
  const convertOptions: LibraryTemplateLiteralConvertOptions = {
    directivePrefix: buildPlatform.templateTransform.getData().directivePrefix,
    eventListConvert: buildPlatform.templateTransform.eventListConvert,
    templateInterpolation:
      buildPlatform.templateTransform.templateInterpolation,
    fileExtname,
  };

  /** library.loader 的部分 */
  const transformLibraryComponent = (
    code: string,
    id: string,
    emit: (fileName: string, source: string) => void,
    emitChunk: (fileName: string, moduleId: string) => void
  ) => {
    const selector = createCssSelectorForTs(code);
    const list = selector.queryAll(
      `PropertyAccessExpression[name=ɵɵdefineComponent]~SyntaxList ObjectLiteralExpression PropertyAssignment[name=type]::initializer`
    );
    if (!list.length) {
      return;
    }
    const scopeLibraryObj: Record<string, ScopeExtraTemplateData[]> = {};
    const metaList: (ExportLibraryComponentMeta & {
      importPath: string;
    })[] = [];

    for (const element of list as ts.BinaryExpression[]) {
      const componentName = element.getText();
      const extraNode = selector.queryOne(
        `VariableDeclaration[name="${componentName}_${LIBRARY_COMPONENT_METADATA_SUFFIX}"]`
      ) as ts.VariableDeclaration | undefined;
      if (!extraNode) {
        continue;
      }
      const meta: ExportLibraryComponentMeta = literalResolve(
        extraNode.initializer!.getText()
      );
      metaList.push({ ...meta, importPath: id });
    }

    if (!metaList.length) {
      return;
    }

    // loader 里每解析到一个组件，会把「已收集的全部组件」重跑一遍 emit，
    // 这里保持同样的遍历语义（同名文件内多组件时行为一致）
    for (const item of metaList) {
      if (
        item.id &&
        item.className &&
        item.libraryPath &&
        !libraryEntries.has(item.id)
      ) {
        const meta = {
          className: item.className,
          importPath: item.importPath,
          libraryPath: item.libraryPath,
        };
        libraryEntries.set(item.id, meta);
        // emitFile({type:'chunk'}) 只能在 build 阶段钩子里调（transform 可以，
        // generateBundle 不行），所以发现即 emit。
        emitChunk(
          toRollupFileName(
            join(normalize(LIBRARY_OUTPUT_ROOTDIR), item.libraryPath + '.js')
          ),
          LIBRARY_ENTRY_VIRTUAL + item.id
        );
      }
      const globalTemplatePath = join(
        normalize('/library-template'),
        strings.classify(item.moduleId) + fileExtname.contentTemplate
      );
      const LIBRARY_SCOPE_ID = libraryTemplateScopeName(item.moduleId);
      const configPath = join(
        normalize(LIBRARY_OUTPUT_ROOTDIR),
        item.libraryPath + fileExtname.config
      );
      const arr = scopeLibraryObj[LIBRARY_SCOPE_ID] || [];
      arr.push({
        configPath,
        useComponents: item.useComponents,
        templateList: [],
        templatePath: globalTemplatePath,
      });
      scopeLibraryObj[LIBRARY_SCOPE_ID] = arr;

      emit(
        toRollupFileName(
          join(
            normalize(LIBRARY_OUTPUT_ROOTDIR),
            item.libraryPath + fileExtname.content
          )
        ),
        `<import src="${globalTemplatePath}"/>` +
          literalResolve(`\`${item.content}\``, convertOptions)
      );

      if (item.contentTemplate) {
        emit(
          toRollupFileName(
            join(
              normalize(LIBRARY_OUTPUT_ROOTDIR),
              dirname(normalize(item.libraryPath)),
              'template' + fileExtname.contentTemplate
            )
          ),
          `<import src="${globalTemplatePath}"/>` +
            literalResolve(`\`${item.contentTemplate}\``, convertOptions)
        );
      }
      if (item.style) {
        emit(
          toRollupFileName(
            join(
              normalize(LIBRARY_OUTPUT_ROOTDIR),
              item.libraryPath + fileExtname.style
            )
          ),
          item.style
        );
      }
    }

    for (const [key, element] of Object.entries(scopeLibraryObj)) {
      templateScope.setScopeLibraryUseComponents(key, element);
    }
  };

  /** library-template.loader 的部分 */
  const transformGlobalTemplate = (
    code: string,
    emit: (fileName: string, source: string) => void
  ) => {
    const selector = createCssSelectorForTs(code);

    const selfTemplateNode = selector.queryOne(
      `VariableDeclaration[name="$self_${GLOBAL_TEMPLATE_SUFFIX}"]`
    ) as ts.VariableDeclaration | undefined;
    if (selfTemplateNode) {
      const config: ExtraTemplateData = literalResolve(
        selfTemplateNode.initializer!.getText()
      );
      emit(
        toRollupFileName(config.outputPath + fileExtname.contentTemplate),
        literalResolve<LibraryTemplateLiteralConvertOptions>(
          `\`${config.template}\``,
          convertOptions
        )
      );
    }

    const libraryTemplateNode = selector.queryOne(
      `VariableDeclaration[name="library_${GLOBAL_TEMPLATE_SUFFIX}"]`
    ) as ts.VariableDeclaration | undefined;
    if (libraryTemplateNode) {
      const config: Record<string, ExtraTemplateData> = literalResolve(
        libraryTemplateNode.initializer!.getText()
      );
      for (const [key, element] of Object.entries(config)) {
        templateScope.setScopeExtraUseComponents(key, {
          useComponents: element.useComponents!,
          templateList: [element.template],
        });
      }
    }
  };

  return {
    name: 'mini-program:library-template',
    resolveId(id: string) {
      // 虚拟 library entry 模块
      if (id.startsWith(LIBRARY_ENTRY_VIRTUAL)) {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (!id.startsWith(LIBRARY_ENTRY_VIRTUAL)) {
        return null;
      }
      const meta = libraryEntries.get(id.slice(LIBRARY_ENTRY_VIRTUAL.length));
      if (!meta) {
        // 找不到 meta 说明这个 id 没被收集到，给空模块而不是报错，
        // 避免一个组件解析失败把整个 build 带崩
        return '';
      }
      return libraryEntryModuleSource(meta);
    },
    transform(code: string, id: string) {
      // 两个 loader 原本都只作用在 .mjs 上
      if (!id.endsWith('.mjs')) {
        return null;
      }
      if (
        !code.includes('ɵɵdefineComponent') &&
        !code.includes(GLOBAL_TEMPLATE_SUFFIX)
      ) {
        return null;
      }
      const emit = (fileName: string, source: string) => {
        if (!fileName || fileName.startsWith('..')) {
          this.warn(`跳过无法归一化的库产物路径: ${fileName}`);
          return;
        }
        this.emitFile({ type: 'asset', fileName, source });
      };
      transformGlobalTemplate(code, emit);
      transformLibraryComponent(code, id, emit, (fileName, moduleId) =>
        this.emitFile({ type: 'chunk', fileName, id: moduleId })
      );
      // 只读不改动模块代码
      return null;
    },
  };
}
