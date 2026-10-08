import type { BuilderContext } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import type { Path } from '@angular-devkit/core';
import * as path from 'path';
import type { Plugin } from 'vite';
import type { WxsAnalysisRef } from '../mini-program-compiler/type';
import type { BuildPlatform, PlatformType } from '../platform/platform';
import type { CopiedAsset } from '../vite/copy-assets';
import type { MpConfigBundle } from '../vite/mp-config';
import { miniProgramComponentTransformPlugin } from '../vite/plugins/component-transform.plugin';
import { entryBootstrapPlugin } from '../vite/plugins/entry-bootstrap.plugin';
import { libraryTemplatePlugin } from '../vite/plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from '../vite/plugins/mini-program-assets.plugin';
import { platformFileResolvePlugin } from '../vite/plugins/platform-file-resolve.plugin';
import { wxsStripPlugin } from '../vite/plugins/wxs-strip.plugin';
import { LibraryTemplateScopeService } from './library-template-scope.service';

export interface MiniProgramTestStackOptions {
  platform: PlatformType;
  buildPlatform: BuildPlatform;
  workspaceRoot: string;
  context: BuilderContext;
  tsConfig: string;
  pages: AssetPattern[];
  assets?: AssetPattern[];
  /** assets 展开结果 + 解析好的配置文件，与 application 链路同一套 */
  copiedAssets?: CopiedAsset[];
  mpConfigs?: MpConfigBundle;
  styles?: (string | { input: string })[];
  watch: boolean;
  /** 引导入口的 chunk 名 */
  bootstrapChunk: string;
  absoluteProjectRoot: Path;
  absoluteProjectSourceRoot: Path;
  entryPatterns: {
    pageList: unknown[];
    subPackageList?: unknown[];
    componentList: unknown[];
    tabbarList?: unknown[];
  };
}

export interface MiniProgramTestStack {
  /** analog 之前必须跑的：平台后缀解析、资源分析、wxs-strip */
  preAnalogPlugins: Plugin[];
  /** analog 之后跑的：库模板、组件产物 */
  postAnalogPlugins: Plugin[];
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
 * 测试链路的插件栈。顺序是硬约束，不是排版偏好：
 *
 *  1. `platformFileResolve` 最先 —— `.wx.ts` 平台后缀要在解析阶段就选对文件。
 *  2. `miniProgramAssets` 必须早于 wxs-strip：分析层产出的模板 AST 是「内联 wxs 从哪来」的唯一真相源。
 *  3. `wxsStrip` 必须早于 analog：它往 `fileReplacements` 里 push 替换项，analog 建 program 之后再 push 就晚了。
 *  4. `libraryTemplate` / `componentTransform` 收尾，处理库模板与组件产物。
 */
export function createMiniProgramTestStack(
  options: MiniProgramTestStackOptions,
): MiniProgramTestStack {
  const wxsAnalysisRef: {
    current: WxsAnalysisRef;
  } = { current: null };
  const fileReplacements: Array<{ replace: string; with: string }> = [];
  const templateScope = new LibraryTemplateScopeService();
  const allEntries = [
    ...options.entryPatterns.pageList,
    ...(options.entryPatterns.subPackageList ?? []),
    ...options.entryPatterns.componentList,
    ...(options.entryPatterns.tabbarList ?? []),
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
    preAnalogPlugins: [
      // 入口注册由构建器注入（虚拟入口模块），必须 enforce: 'pre'
      entryBootstrapPlugin({ entries: allEntries }),
      platformFileResolvePlugin({ platform: options.platform }),
      miniProgramAssetsPlugin({
        tsConfig: options.tsConfig,
        workspaceRoot: options.workspaceRoot,
        buildPlatform: options.buildPlatform,
        entryPatterns: allEntries,
        context: options.context,
        watch: options.watch,
        templateScope,
        assets: options.copiedAssets,
        mpConfigs: options.mpConfigs,
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
    ],
    postAnalogPlugins: [
      libraryTemplatePlugin({
        buildPlatform: options.buildPlatform,
        templateScope,
      }),
      miniProgramComponentTransformPlugin(),
    ],
  };
}
