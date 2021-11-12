import { normalizePath } from '@ngtools/webpack/src/ivy/paths';
import {
  InputFileSystemSync,
  createWebpackSystem,
} from '@ngtools/webpack/src/ivy/system';
import { WebpackResourceLoader } from '@ngtools/webpack/src/resource_loader';

import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts from 'typescript';
import * as webpack from 'webpack';

import { RawSource } from 'webpack-sources';
import { ExportWeiXinAssetsPluginSymbol } from '../const';
import { TemplateService } from '../html/template.service';
import { ComponentTemplateLoaderContext } from '../loader/type';
import { BuildPlatform } from '../platform/platform';
import { PlatformInfo } from '../platform/platform-info';

import { TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
import { PagePattern } from '../type';
import { NgComponentCssExtractPlugin } from './ng-component-css-extract.plugin';

export interface ExportWeiXinAssetsPluginOptions {
  /** tsConfig配置路径 */
  tsConfig: string;
  buildPlatform: PlatformInfo;
}
/** 导出微信的wxml与wxss */
@Injectable()
export class ExportWeiXinAssetsPlugin {
  private pageList!: PagePattern[];
  private componentList!: PagePattern[];
  private system!: ts.System;
  private WXMLMap = new Map<string, string>();
  // private program!: ts.Program;
  private compiler!: webpack.Compiler;
  private compilation!: webpack.Compilation;
  private changeFileMap = new Map<
    string,
    { sizeOffset: number; content: string }
  >();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private originInputFileSystemSync: { readFileSync: any; statSync: any } = {
    readFileSync: undefined,
    statSync: undefined,
  };
  private cleanDependencyFileCacheSet = new Set<string>();
  private options: ExportWeiXinAssetsPluginOptions;
  constructor(
    @Inject(TS_CONFIG_TOKEN) tsConfig: string,
    buildPlatform: BuildPlatform,
    private injector: Injector
  ) {
    this.options = {
      tsConfig: tsConfig,
      buildPlatform: buildPlatform,
    };
  }
  apply(compiler: webpack.Compiler) {
    this.compiler = compiler;
    const resourceLoader = new WebpackResourceLoader(compiler.watchMode);
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    this.originInputFileSystemSync.readFileSync = ifs.readFileSync;
    this.originInputFileSystemSync.statSync = ifs.statSync;
    let oldBuilder: ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined =
      undefined;

    compiler.hooks.thisCompilation.tap(
      'ExportWeiXinAssetsPlugin',
      (compilation) => {
        this.system = createWebpackSystem(
          compiler.inputFileSystem as InputFileSystemSync,
          normalizePath(compiler.context)
        );
        this.restore();
        this.compilation = compilation;

        const injector = Injector.create({
          providers: [
            { provide: TemplateService },
            { provide: WEBPACK_COMPILATION, useValue: compilation },
            { provide: WEBPACK_COMPILER, useValue: compiler },
            { provide: OLD_BUILDER, useValue: oldBuilder },
            {
              provide: TS_SYSTEM,
              useValue: this.system,
            },
          ],
          parent: this.injector,
        });
        const templateService = injector.get(TemplateService);
        templateService.setEntry(this.pageList, this.componentList);
        oldBuilder =
          templateService.getBuilder() as ts.EmitAndSemanticDiagnosticsBuilderProgram;
        const waitAnalyzeAsync = templateService.analyzeAsync();
        this.changeFileMap = templateService.removeStyle();
        const componentMetaMap = templateService.getComponentMetaMap();
        this.hookFileSystemFile();

        const ngComponentCssExtractPlugin = new NgComponentCssExtractPlugin(
          componentMetaMap,
          resourceLoader
        );
        ngComponentCssExtractPlugin.run(compilation);
        const buildTemplatePromise = this.buildTemplate(
          waitAnalyzeAsync,
          templateService
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compilation as any)[ExportWeiXinAssetsPluginSymbol] = {
          metaMapPromise: buildTemplatePromise.then((item) => item.metaMap),
          platformInfo: this.options.buildPlatform,
        } as ComponentTemplateLoaderContext;

        compilation.hooks.processAssets.tapAsync(
          'ExportWeiXinAssetsPlugin',
          async (assets, cb) => {
            this.WXMLMap = await buildTemplatePromise.then(
              (result) => result.WXMLMap
            );
            const cssMap = ngComponentCssExtractPlugin.getAllCss();
            for (const [key, value] of cssMap.entries()) {
              const entry = templateService.getModuleEntryFromCss(key);
              compilation.assets[entry!.outputWXSS] = new RawSource(
                await value
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any;
            }

            this.WXMLMap.forEach((value, key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              compilation.assets[key] = new RawSource(value) as any;
            });

            cb();
          }
        );
        this.cleanDependencyFileCacheSet.forEach((filePath) => {
          try {
            compiler.inputFileSystem.purge!(filePath);
          } catch (error) {}
        });
      }
    );
  }

  private restore() {
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    ifs.readFileSync = this.originInputFileSystemSync.readFileSync;
    ifs.statSync = this.originInputFileSystemSync.statSync;
    this.changeFileMap = new Map();
    this.cleanDependencyFileCacheSet = new Set();
  }
  private hookFileSystemFile() {
    const _this = this;
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    const oldReadFileSync = ifs.readFileSync;
    ifs.readFileSync = function (filePath: string) {
      const changeFile = _this.changeFileMap.get(path.normalize(filePath));
      if (changeFile) {
        return Buffer.from(changeFile.content);
      }
      return oldReadFileSync.call(this, filePath);
    };
    const oldStatSync = ifs.statSync;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ifs.statSync = function (filePath: string, ...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stat = (oldStatSync as any).apply(this, [filePath, ...args]);
      const changeFile = _this.changeFileMap.get(path.normalize(filePath));
      if (changeFile) {
        stat.size = stat.size - changeFile.sizeOffset;
      }
      return stat;
    };
  }
  public setEntry(pageList: PagePattern[], componentList: PagePattern[]) {
    this.pageList = pageList;
    this.componentList = componentList;
  }
  async buildTemplate(
    waitAnalyzeAsync: Promise<void>,
    service: TemplateService
  ) {
    await waitAnalyzeAsync;
    const result = service.buildTemplate();
    return result;
  }
}
