import { normalizePath } from '@ngtools/webpack/src/ivy/paths';
import {
  InputFileSystemSync,
  createWebpackSystem,
} from '@ngtools/webpack/src/ivy/system';
import * as path from 'path';
import { Inject, Injectable, Injector } from 'static-injector';
import ts from 'typescript';
import { sources } from 'webpack';
import * as webpack from 'webpack';
import { ExportMiniProgramAssetsPluginSymbol, InjectorSymbol } from '../const';
import { LibraryTemplateScopeService } from '../html/library-template-scope.service';
import { MiniProgramApplicationAnalysisService } from '../html/mini-program-application-analysis.service';
import type { ComponentTemplateLoaderContext } from '../loader/type';
import { BuildPlatform } from '../platform/platform';
import { PAGE_PATTERN_TOKEN, TS_CONFIG_TOKEN } from '../token/project.token';
import { OLD_BUILDER, TS_SYSTEM } from '../token/ts-program.token';
import { WEBPACK_COMPILATION, WEBPACK_COMPILER } from '../token/webpack.token';
import type { PagePattern } from '../type';
import { libraryTemplateResolve } from '../util/library-template-resolve';
import { setCompilationAsset } from '../util/set-compilation-asset';

@Injectable()
export class ExportMiniProgramAssetsPlugin {
  private pageList!: PagePattern[];
  private componentList!: PagePattern[];
  private system!: ts.System;
  constructor(
    @Inject(TS_CONFIG_TOKEN) tsConfig: string,
    private buildPlatform: BuildPlatform,
    private injector: Injector,
    private libraryTemplateScopeService: LibraryTemplateScopeService
  ) {}
  apply(compiler: webpack.Compiler) {
    const ifs = compiler.inputFileSystem as InputFileSystemSync;
    let oldBuilder: ts.EmitAndSemanticDiagnosticsBuilderProgram | undefined =
      undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleAssets = new Map<string, sources.Source>();
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
                const data = compilation.getAsset(stylePath)!;
                if (/\.(scss|css|sass|less|styl)$/.test(stylePath)) {
                  styleAssets.set(path.normalize(stylePath), data.source);
                  setCompilationAsset(
                    compilation,
                    stylePath,
                    new sources.RawSource(' ')
                  );
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
        this.libraryTemplateScopeService.register(compilation);
        (compilation as any)[InjectorSymbol] = this.injector;
        const injector = Injector.create({
          providers: [
            { provide: MiniProgramApplicationAnalysisService },
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
        const templateService = injector.get(
          MiniProgramApplicationAnalysisService
        );
        oldBuilder =
          templateService.getBuilder() as ts.EmitAndSemanticDiagnosticsBuilderProgram;
        const buildTemplatePromise = this.buildTemplate(templateService);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compilation as any)[ExportMiniProgramAssetsPluginSymbol] = {
          buildPlatform: this.buildPlatform,
          otherMetaGroupPromise: buildTemplatePromise.then(
            (item) => item.otherMetaCollectionGroup
          ),
        } as ComponentTemplateLoaderContext;

        compilation.hooks.processAssets.tapAsync(
          'ExportMiniProgramAssetsPlugin',
          async (assets, cb) => {
            const metaMap = await buildTemplatePromise;

            metaMap.outputContent.forEach((value, key) => {
              setCompilationAsset(
                compilation,
                key,
                new sources.RawSource(value)
              );
            });

            metaMap.style.forEach((value, outputPath) => {
              setCompilationAsset(
                compilation,
                outputPath,
                new sources.ConcatSource(
                  ...value.map((item) => styleAssets.get(item)!)
                )
              );
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
              setCompilationAsset(
                compilation,
                key,
                new sources.RawSource(JSON.stringify(config))
              );
            });
            for (const key in metaMap.otherMetaCollectionGroup) {
              if (
                Object.prototype.hasOwnProperty.call(
                  metaMap.otherMetaCollectionGroup,
                  key
                )
              ) {
                const element = metaMap.otherMetaCollectionGroup[key];
                this.libraryTemplateScopeService.setScopeExtraUseComponents(
                  key,
                  {
                    useComponents: {
                      ...[...element.localPath, ...element.libraryPath].reduce(
                        (pre, cur) => {
                          pre[cur.selector] = cur.path;
                          return pre;
                        },
                        {} as Record<string, string>
                      ),
                    },
                    templateList: element.templateList.map(
                      (item) => item.content
                    ),
                  }
                );
              }
            }
            const componentConfigGroup =
              this.libraryTemplateScopeService.exportLibraryComponentConfig();
            for (const item of componentConfigGroup) {
              setCompilationAsset(
                compilation,
                item.filePath,
                new sources.RawSource(JSON.stringify(item.content))
              );
            }
            const templateGroup =
              this.libraryTemplateScopeService.exportLibraryTemplate();
            for (const key in templateGroup) {
              if (Object.prototype.hasOwnProperty.call(templateGroup, key)) {
                const element = templateGroup[key];
                setCompilationAsset(
                  compilation,
                  key,
                  new sources.RawSource(
                    libraryTemplateResolve(
                      element,
                      this.buildPlatform.templateTransform.getData()
                        .directivePrefix,
                      this.buildPlatform.templateTransform.eventListConvert,
                      this.buildPlatform.templateTransform
                        .templateInterpolation,
                      this.buildPlatform.fileExtname
                    )
                  )
                );
              }
            }

            for (const key in metaMap.selfTemplate) {
              if (
                Object.prototype.hasOwnProperty.call(metaMap.selfTemplate, key)
              ) {
                const element = metaMap.selfTemplate[key];
                setCompilationAsset(
                  compilation,
                  key,
                  new sources.RawSource(element)
                );
              }
            }
            cb();
          }
        );
        templateService.cleanDependencyFileCache();
      }
    );
  }

  public setEntry(pageList: PagePattern[], componentList: PagePattern[]) {
    this.pageList = pageList;
    this.componentList = componentList;
  }
  async buildTemplate(service: MiniProgramApplicationAnalysisService) {
    try {
      await service.analyzeAsync();
      const result = await service.exportComponentBuildMetaMap();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
