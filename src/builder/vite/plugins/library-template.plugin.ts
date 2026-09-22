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

/** rollup 不接受以 / 开头的 fileName，devkit 的 join/normalize 会带前导斜杠 */
function toRollupFileName(p: string) {
  return normalize(p)
    .replace(/^([/\\])+/, '')
    .replace(/^\.\//, '');
}

export interface LibraryTemplatePluginOptions {
  buildPlatform: BuildPlatform;
  templateScope: LibraryTemplateScopeService;
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
    emit: (fileName: string, source: string) => void
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
      transformLibraryComponent(code, id, emit);
      // 只读不改动模块代码
      return null;
    },
  };
}
