import type { BuilderContext } from '@angular-devkit/architect';
import {
  AssetPattern,
  BrowserBuilderOptions,
} from '@angular-devkit/build-angular';
import type { Path } from '@angular-devkit/core';
import { getSystemPath, normalize, resolve } from '@angular-devkit/core';
import * as path from 'path';
import { filter } from 'rxjs/operators';
import { Injectable, Injector } from 'static-injector';
import * as webpack from 'webpack';
import { DefinePlugin } from 'webpack';
import { BootstrapAssetsPlugin } from 'webpack-bootstrap-assets-plugin';
import { LIBRARY_OUTPUT_PATH } from './const';
import { LibraryTemplateScopeService } from './html/library-template-scope.service';
import { BuildPlatform } from './platform/platform';
import type { PlatformType } from './platform/platform';
import { DynamicLibraryComponentEntryPlugin } from './plugin/dynamic-library-entry.plugin';
import { DynamicWatchEntryPlugin } from './plugin/dynamic-watch-entry.plugin';
import { ExportMiniProgramAssetsPlugin } from './plugin/export-mini-program-assets.plugin';
import { TS_CONFIG_TOKEN } from './token/project.token';
import type { PagePattern } from './type';

type OptimizationOptions = NonNullable<webpack.Configuration['optimization']>;
type OptimizationSplitChunksOptions = Exclude<
  OptimizationOptions['splitChunks'],
  false | undefined
>;
type OptimizationSplitChunksCacheGroup = Exclude<
  NonNullable<OptimizationSplitChunksOptions['cacheGroups']>[''],
  false | string | Function | RegExp
>;
@Injectable()
export class WebpackConfigurationChange {
  exportMiniProgramAssetsPluginInstance!: ExportMiniProgramAssetsPlugin;
  private buildPlatform!: BuildPlatform;
  private entryList!: PagePattern[];
  constructor(
    private options: BrowserBuilderOptions & {
      pages: AssetPattern[];
      components: AssetPattern[];
      platform: PlatformType;
    },
    private context: BuilderContext,
    private config: webpack.Configuration,
    private injector: Injector
  ) {}
  init() {
    this.injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: ExportMiniProgramAssetsPlugin },
        { provide: LibraryTemplateScopeService },
        {
          provide: TS_CONFIG_TOKEN,
          useValue: path.resolve(
            this.context.workspaceRoot,
            this.options.tsConfig
          ),
        },
        {
          provide: DynamicWatchEntryPlugin,
          deps: [BuildPlatform],
          useFactory: (buildPlatform: BuildPlatform) => {
            return new DynamicWatchEntryPlugin(
              {
                pages: this.options.pages,
                components: this.options.components,
                workspaceRoot: normalize(this.context.workspaceRoot),
                context: this.context,
                config: this.config,
              },
              buildPlatform
            );
          },
        },
        { provide: DynamicLibraryComponentEntryPlugin },
      ],
    });
    this.buildPlatform = this.injector.get(BuildPlatform);
    this.buildPlatform.fileExtname.config =
      this.buildPlatform.fileExtname.config || '.json';
    this.config.output!.globalObject = this.buildPlatform.globalObject;
  }
  async change() {
    this.buildPlatformCompatible();
    this.exportAssets();
    await this.pageHandle();
    this.addLoader();
    this.globalVariableChange();
    this.changeStylesExportSuffix();
    this.config.plugins?.push(
      this.injector.get(DynamicLibraryComponentEntryPlugin)
    );
    this.config.plugins?.push(
      new webpack.NormalModuleReplacementPlugin(
        /^angular-miniprogram\/platform\/wx$/,
        `angular-miniprogram/platform/${this.buildPlatform.packageName}`
      )
    );
  }
  private buildPlatformCompatible() {
    if (this.buildPlatform.packageName == 'zfb') {
      this.config.resolve?.conditionNames?.shift();
      this.config.resolve?.mainFields?.shift();
    }
  }
  private async pageHandle() {
    const dynamicWatchEntryInstance = this.injector.get(
      DynamicWatchEntryPlugin
    );
    await dynamicWatchEntryInstance.init();
    dynamicWatchEntryInstance.entryPattern$
      .pipe(filter((item) => !!item))
      .subscribe((result) => {
        this.entryList = [...result!.pageList, ...result!.componentList];
        this.exportMiniProgramAssetsPluginInstance.setEntry(
          result!.pageList,
          result!.componentList
        );
      });
    this.config.plugins?.push(dynamicWatchEntryInstance);
    // 出口
    const oldFileName = this.config.output!.filename as string;
    this.config.output!.filename = (chunkData) => {
      const page = this.entryList.find(
        (item) => item.entryName === chunkData.chunk!.name
      );
      if (page) {
        return page.outputFiles.logic;
      }
      return oldFileName;
    };
    // 共享依赖
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldChunks = (this.config.optimization!.splitChunks as any).cacheGroups
      .defaultVendors.chunks;
    (
      (
        this.config.optimization!
          .splitChunks! as unknown as OptimizationSplitChunksOptions
      ).cacheGroups!.defaultVendors as OptimizationSplitChunksCacheGroup
    ).chunks = (chunk) => {
      if (
        this.entryList.find((item) => item.entryName === chunk.name) ||
        chunk.name.startsWith(`${LIBRARY_OUTPUT_PATH}/`)
      ) {
        return true;
      }
      return oldChunks(chunk);
    };
    ((this.config.optimization!.splitChunks as OptimizationSplitChunksOptions)
      .cacheGroups!['moduleChunks'] as OptimizationSplitChunksCacheGroup) = {
      test: (module: webpack.NormalModule) => {
        const name = module.nameForCondition();
        return (
          (name &&
            name.endsWith('.ts') &&
            !/[\\/]node_modules[\\/]/.test(name)) ||
          name?.includes('angular-miniprogram\\dist')
        );
      },
      minChunks: 2,
      minSize: 0,
      name: 'module-chunk',
      chunks: 'all',
    };
    // 出口保留必要加载
    const assetsPlugin = new BootstrapAssetsPlugin();
    assetsPlugin.hooks.removeChunk.tap('pageHandle', (chunk) => {
      if (
        this.entryList.some((page) => page.entryName === chunk.name) ||
        [...chunk.files].some((file) =>
          file.endsWith(this.buildPlatform.fileExtname.style)
        ) ||
        chunk.name.startsWith(`${LIBRARY_OUTPUT_PATH}/`)
      ) {
        return true;
      }
      return false;
    });
    assetsPlugin.hooks.emitAssets.tap('pageHandle', (object, json) => {
      return {
        'app.js':
          this.buildPlatform.importTemplate +
          json.scripts.map((item) => `require('./${item.src}')`).join(';'),
      };
    });
    this.config.plugins!.push(assetsPlugin);
  }
  private exportAssets() {
    this.exportMiniProgramAssetsPluginInstance = this.injector.get(
      ExportMiniProgramAssetsPlugin
    );
    this.config.plugins!.unshift(this.exportMiniProgramAssetsPluginInstance);
  }

  private addLoader() {
    this.config.module!.rules!.unshift({
      test: /\.ts$/,
      loader: require.resolve(
        path.join(__dirname, './loader/component-template.loader')
      ),
    });
    this.config.module?.rules?.unshift({
      test: /\.mjs$/,
      loader: require.resolve(path.join(__dirname, './loader/library.loader')),
    });
    this.config.module?.rules?.unshift({
      test: /\.mjs$/,
      loader: require.resolve(
        path.join(__dirname, './loader/library-template.loader')
      ),
    });
  }
  private globalVariableChange() {
    const defineObject: Record<string, string> = {
      global: `${this.buildPlatform.globalObject}.__global`,
      window: `${this.buildPlatform.globalVariablePrefix}`,
      globalThis: `${this.buildPlatform.globalVariablePrefix}`,
      Zone: `${this.buildPlatform.globalVariablePrefix}.Zone`,
      setTimeout: `${this.buildPlatform.globalVariablePrefix}.setTimeout`,
      clearTimeout: `${this.buildPlatform.globalVariablePrefix}.clearTimeout`,
      setInterval: `${this.buildPlatform.globalVariablePrefix}.setInterval`,
      clearInterval: `${this.buildPlatform.globalVariablePrefix}.clearInterval`,
      setImmediate: `${this.buildPlatform.globalVariablePrefix}.setImmediate`,
      clearImmediate: `${this.buildPlatform.globalVariablePrefix}.clearImmediate`,
      Promise: `${this.buildPlatform.globalVariablePrefix}.Promise`,
      Reflect: `${this.buildPlatform.globalVariablePrefix}.Reflect`,
      requestAnimationFrame: `${this.buildPlatform.globalVariablePrefix}.requestAnimationFrame`,
      cancelAnimationFrame: `${this.buildPlatform.globalVariablePrefix}.cancelAnimationFrame`,
      performance: `${this.buildPlatform.globalVariablePrefix}.performance`,
      navigator: `${this.buildPlatform.globalVariablePrefix}.navigator`,
      wx: this.buildPlatform.globalObject,
    };
    if (this.config.mode === 'development') {
      defineObject[
        'ngDevMode'
      ] = `${this.buildPlatform.globalObject}.__global.ngDevMode`;
    }
    this.config.plugins!.push(new DefinePlugin(defineObject));
  }
  private changeStylesExportSuffix() {
    const index = this.config.plugins!.findIndex(
      (plugin) =>
        Object.getPrototypeOf(plugin).constructor.name ===
        'MiniCssExtractPlugin'
    );
    if (index > -1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pluginInstance = this.config.plugins![index] as any;
      const pluginPrototype = Object.getPrototypeOf(pluginInstance);
      this.config.plugins?.splice(
        index,
        1,
        new pluginPrototype.constructor({
          filename: (pluginInstance.options.filename as string).replace(
            /\.css$/,
            this.buildPlatform.fileExtname.style
          ),
        })
      );
    } else {
      throw new Error('没有找到MiniCssExtractPlugin插件,无法修改生成style');
    }
  }
}
