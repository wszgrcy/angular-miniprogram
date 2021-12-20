import { join, normalize } from '@angular-devkit/core';
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
import { ConcatSource, RawSource } from 'webpack-sources';
import {
  ExportMiniProgramAssetsPluginSymbol,
  InjectorSymbol,
  LIBRARY_OUTPUT_PATH,
} from '../const';
import { TemplateService } from '../html/template.service';
import type { StyleHookData } from '../html/type';
import type { ComponentTemplateLoaderContext } from '../loader/type';
import { BuildPlatform } from '../platform/platform';
import { PAGE_PATTERN_TOKEN, TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
import type { PagePattern } from '../type';

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
    private buildPlatform: BuildPlatform,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleAssets = new Map<string, any>();
    compiler.hooks.compilation.tap(
      'ExportMiniProgramAssetsPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          'ExportMiniProgramAssetsPlugin',
          () => {
            for (const stylePath in compilation.assets) {
              if (
                Object.prototype.hasOwnProperty.call(
                  compilation.assets,
                  stylePath
                )
              ) {
                const data = compilation.assets[stylePath];
                if (/\.(scss|css|sass|less|styl)$/.test(stylePath)) {
                  styleAssets.set(path.normalize(stylePath), data);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  compilation.assets[stylePath] = new RawSource(' ') as any;
                }
              }
            }
          }
        );
      }
    );
    compiler.hooks.thisCompilation.tap(
      'ExportMiniProgramAssetsPlugin',
      (compilation) => {
        this.system = createWebpackSystem(
          compiler.inputFileSystem as InputFileSystemSync,
          normalizePath(compiler.context)
        );
        this.restore();
        this.compilation = compilation;
        (this.compilation as any)[InjectorSymbol] = this.injector;
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
        const buildTemplatePromise = this.buildTemplate(
          waitAnalyzeAsync,
          templateService
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compilation as any)[ExportMiniProgramAssetsPluginSymbol] = {
          metaMapPromise: buildTemplatePromise.then((item) => item.meta),
          buildPlatform: this.options.buildPlatform,
          otherMetaGroupPromise: buildTemplatePromise.then(
            (item) => item.oterMetaCollectionGroup
          ),
          addLibraryExtraUseComponents: this.addLibraryExtraUseComponents,
          addExtraTemplateNameMapping: this.addExtraTemplateNameMapping,
        } as ComponentTemplateLoaderContext;

        compilation.hooks.processAssets.tapAsync(
          'ExportMiniProgramAssetsPlugin',
          async (assets, cb) => {
            const metaMap = await buildTemplatePromise;

            metaMap.outputContent.forEach((value, key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              compilation.assets[key] = new RawSource(value) as any;
            });

            metaMap.style.forEach((value, outputPath) => {
              const item = new ConcatSource(
                ...value.map((item) => styleAssets.get(item))
              );
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              compilation.assets[outputPath] = item as any;
            });
            metaMap.config.forEach((value, key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let config: Record<string, any>;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if ((ifs as any).fileSystem.existsSync(value.existConfig)) {
                config = JSON.parse(
                  ifs.readFileSync(value.existConfig).toString()
                );
              } else {
                config = {};
              }
              config.usingComponents = config.usingComponents || {};
              config.usingComponents = {
                ...config.usingComponents,
                ...value.usingComponents.reduce((pre, cur) => {
                  pre[cur.selector] = cur.path;
                  return pre;
                }, {} as Record<string, string>),
              };

              compilation.assets[key] = new RawSource(
                JSON.stringify(config)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any;
            });
            for (const key in metaMap.oterMetaCollectionGroup) {
              if (
                Object.prototype.hasOwnProperty.call(
                  metaMap.oterMetaCollectionGroup,
                  key
                )
              ) {
                const element = metaMap.oterMetaCollectionGroup[key];
                const libaryTemplatePath = `/library-template/${key}${this.buildPlatform.fileExtname.contentTemplate}`;
                compilation.assets[libaryTemplatePath] = new RawSource(
                  compilation.assets[libaryTemplatePath].source() +
                    element.templateList.map((item) => item.content).join('')
                ) as any;
              }
            }
            this.extraTemplateNameMapping.forEach((value, key) => {
              const extraConfig = this.libraryExtrayUseComponentsMap.get(key);
              value.forEach((item) => {
                const filePath = join(
                  normalize(LIBRARY_OUTPUT_PATH),
                  item + (this.buildPlatform.fileExtname.config || '.json')
                );
                const config = compilation.assets[filePath];
                let json: Record<string, any> = {};
                if (config) {
                  json = JSON.parse(config.source() as string);
                }
                json.usingComponents = {
                  ...json.usingComponents,
                  ...extraConfig,
                };
                compilation.assets[filePath] = new RawSource(
                  JSON.stringify(json)
                ) as any;
              });
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
    const result = await service.exportComponentBuildMetaMap();
    return result;
  }
  libraryExtrayUseComponentsMap = new Map();
  addLibraryExtraUseComponents = (
    key: string,
    useComponents: Record<string, string>
  ) => {
    let obj = this.libraryExtrayUseComponentsMap.get(key) || {};
    obj = { ...obj, ...useComponents };
    this.libraryExtrayUseComponentsMap.set(key, obj);
  };
  extraTemplateNameMapping = new Map<string, string[]>();
  addExtraTemplateNameMapping = (key: string, value: string) => {
    const list = this.extraTemplateNameMapping.get(key) || [];
    list.push(value);
    this.extraTemplateNameMapping.set(key, list);
  };
}
