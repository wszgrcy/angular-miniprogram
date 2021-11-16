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
import { ExportMiniProgramAssetsPluginSymbol } from '../const';
import { TemplateService } from '../html/template.service';
import { StyleHookData } from '../html/type';
import { ComponentTemplateLoaderContext } from '../loader/type';
import { BuildPlatform } from '../platform/platform';
import { PAGE_PATTERN_TOKEN, TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
import { PagePattern } from '../type';
import { NgComponentCssExtractPlugin } from './ng-component-css-extract.plugin';

export interface ExportMiniProgramAssetsPluginOptions {
  /** tsConfig配置路径 */
  tsConfig: string;
  buildPlatform: BuildPlatform;
}
@Injectable()
export class ExportMiniProgramAssetsPlugin {
  private pageList!: PagePattern[];
  private componentList!: PagePattern[];
  private system!: ts.System;
  // private program!: ts.Program;
  private compiler!: webpack.Compiler;
  private compilation!: webpack.Compilation;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private originInputFileSystemSync: { readFileSync: any; statSync: any } = {
    readFileSync: undefined,
    statSync: undefined,
  };
  private options: ExportMiniProgramAssetsPluginOptions;
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
      'ExportMiniProgramAssetsPlugin',
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
            {
              provide: PAGE_PATTERN_TOKEN,
              useValue: [...this.pageList, ...this.componentList],
            },
          ],
          parent: this.injector,
        });
        const templateService = injector.get(TemplateService);
        oldBuilder =
          templateService.getBuilder() as ts.EmitAndSemanticDiagnosticsBuilderProgram;
        const waitAnalyzeAsync = templateService.analyzeAsync();
        const styleChangeMap = templateService.removeStyle();
        this.hookFileSystemFile(styleChangeMap);

        const ngComponentCssExtractPlugin = new NgComponentCssExtractPlugin(
          styleChangeMap,
          resourceLoader
        );
        ngComponentCssExtractPlugin.apply(compilation);
        const buildTemplatePromise = this.buildTemplate(
          waitAnalyzeAsync,
          templateService
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compilation as any)[ExportMiniProgramAssetsPluginSymbol] = {
          metaMapPromise: buildTemplatePromise.then((item) => item.meta),
          buildPlatform: this.options.buildPlatform,
        } as ComponentTemplateLoaderContext;

        compilation.hooks.processAssets.tapAsync(
          'ExportMiniProgramAssetsPlugin',
          async (assets, cb) => {
            const componentBuildMetaMap = await (
              await buildTemplatePromise
            ).outputContent;

            componentBuildMetaMap.forEach((value, key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              compilation.assets[key] = new RawSource(value) as any;
            });

            cb();
          }
        );
        templateService.cleanDependencyFileCache();
      }
    );
  }

  private restore() {
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    ifs.readFileSync = this.originInputFileSystemSync.readFileSync;
    ifs.statSync = this.originInputFileSystemSync.statSync;
  }
  private hookFileSystemFile(map: Map<string, StyleHookData>) {
    const ifs = this.compiler.inputFileSystem as InputFileSystemSync;
    const oldReadFileSync = ifs.readFileSync;
    ifs.readFileSync = function (filePath: string) {
      const changeFile = map.get(path.normalize(filePath));
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
      const changeFile = map.get(path.normalize(filePath));
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
    const result = service.exportComponentBuildMetaMap();
    return result;
  }
}
