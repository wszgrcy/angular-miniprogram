import type { BuilderContext } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import type { Path } from '@angular-devkit/core';
import * as path from 'path';
import type { Plugin } from 'vite';
import type { BuildPlatform, PlatformType } from '../platform/platform';
import { miniProgramComponentTransformPlugin } from '../vite/plugins/component-transform.plugin';
import { libraryTemplatePlugin } from '../vite/plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from '../vite/plugins/mini-program-assets.plugin';
import { platformFileResolvePlugin } from '../vite/plugins/platform-file-resolve.plugin';
import { requireContextShimPlugin } from '../vite/plugins/require-context-shim.plugin';
import { wxsStripPlugin } from '../vite/plugins/wxs-strip.plugin';
import { LibraryTemplateScopeService } from './library-template-scope.service';

export interface DiscoveredSpecEntry {
  /** 相对 sourceRoot、去扩展名，用作 rollup entry key */
  rel: string;
  abs: string;
}

export interface MiniProgramTestStackOptions {
  platform: PlatformType;
  buildPlatform: BuildPlatform;
  workspaceRoot: string;
  context: BuilderContext;
  tsConfig: string;
  pages: AssetPattern[];
  components: AssetPattern[];
  assets?: AssetPattern[];
  styles?: (string | { input: string })[];
  watch: boolean;
  /** 引导入口的 chunk 名 */
  bootstrapChunk: string;
  absoluteProjectRoot: Path;
  absoluteProjectSourceRoot: Path;
  entryPatterns: {
    pageList: unknown[];
    componentList: unknown[];
  };
  specFiles: DiscoveredSpecEntry[];
}

export interface MiniProgramTestStack {
  plugins: Plugin[];
  /** 与 analog 共享的 fileReplacements，wxs-strip 会就地 push */
  fileReplacements: Array<{ replace: string; with: string }>;
  templateScope: LibraryTemplateScopeService;
  /** 交给 analog 插件的构造参数 */
  angularOptions: {
    tsconfig: string;
    workspaceRoot: string;
    fastCompile: false;
    experimental: { useAngularCompilationAPI: true };
    fileReplacements: Array<{ replace: string; with: string }>;
  };
}

/**
 * 测试链路的插件栈。
 *
 * **顺序是硬约束，不是排版偏好**：
 *
 *  1. `platformFileResolve` 最先 —— `.wx.ts` 平台后缀要在解析阶段就选对文件。
 *  2. `miniProgramAssets` 必须早于 wxs-strip：分析层产出的模板 AST
 *     是「内联 wxs 从哪来」的唯一真相源，strip 只读不重新解析。
 *  3. `wxsStrip` 必须早于 analog：它往 `fileReplacements` 里 push 替换项，
 *     analog 建 Angular program 之后再 push 就晚了。
 *  4. `requireContextShim` 早于 analog：webpack 专有的 `require.context`
 *     要换成同步 require 映射，否则 spec 入口顶层直接 TypeError。
 *  5. `libraryTemplate` / `componentTransform` 收尾，处理库模板与组件产物。
 *
 * 顺序约束见下面各插件的注释，改动前先读。
 * 这套顺序约束一模一样；各写一份迟早会改漏一边。
 */
export function createMiniProgramTestStack(
  options: MiniProgramTestStackOptions,
): MiniProgramTestStack {
  const wxsAnalysisRef: {
    current: { wxsModules?: ReadonlyMap<string, unknown> } | null;
  } = { current: null };
  const fileReplacements: Array<{ replace: string; with: string }> = [];
  const templateScope = new LibraryTemplateScopeService();
  const allEntries = [
    ...options.entryPatterns.pageList,
    ...options.entryPatterns.componentList,
  ] as never;

  return {
    fileReplacements,
    templateScope,
    angularOptions: {
      tsconfig: options.tsConfig,
      workspaceRoot: options.workspaceRoot,
      fastCompile: false,
      experimental: { useAngularCompilationAPI: true },
      fileReplacements,
    },
    plugins: [
      platformFileResolvePlugin({ platform: options.platform }),
      miniProgramAssetsPlugin({
        tsConfig: options.tsConfig,
        workspaceRoot: options.workspaceRoot,
        buildPlatform: options.buildPlatform,
        entryPatterns: allEntries,
        context: options.context,
        watch: options.watch,
        templateScope,
        assets: options.assets,
        styles: options.styles,
        absoluteProjectRoot: options.absoluteProjectRoot,
        absoluteProjectSourceRoot: options.absoluteProjectSourceRoot,
        bootstrapChunk: options.bootstrapChunk,
        analysisRef: wxsAnalysisRef,
      }),
      wxsStripPlugin({
        workspaceRoot: options.workspaceRoot,
        cacheDir: path.resolve(options.workspaceRoot, '.ng-cache'),
        fileReplacements,
        analysisRef: wxsAnalysisRef,
        watch: false,
      }),
      requireContextShimPlugin(
        options.specFiles.map((f) => ({
          // webpack 的 context key 相对 context dir、带扩展名
          key: `./${f.rel}.ts`,
          // entry 用的 key 是 specs/<rel>，产物就是 specs/<rel>.js
          file: `specs/${f.rel}.js`,
        })),
      ),
      libraryTemplatePlugin({
        buildPlatform: options.buildPlatform,
        templateScope,
      }),
      miniProgramComponentTransformPlugin(),
    ],
  };
}
