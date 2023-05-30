/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Transform,
  transformFromPromise,
} from 'ng-packagr/lib/graph/transform';
import {
  EntryPointNode,
  PackageNode,
  isEntryPoint,
  isEntryPointInProgress,
  isPackage,
} from 'ng-packagr/lib/ng-package/nodes';
import { NgPackagrOptions } from 'ng-packagr/lib/ng-package/options.di';
import { StylesheetProcessor as StylesheetProcessorClass } from 'ng-packagr/lib/styles/stylesheet-processor';
import { setDependenciesTsConfigPaths } from 'ng-packagr/lib/ts/tsconfig';
import ora from 'ora';
import * as path from 'path';
import ts from 'typescript';
import { compileSourceFiles } from './compile-source-files';

export const myCompileNgcTransformFactory = (
  StylesheetProcessor: typeof StylesheetProcessorClass,
  options: NgPackagrOptions
): Transform => {
  return transformFromPromise(async (graph) => {
    const spinner = ora({
      hideCursor: false,
      discardStdin: false,
    });

    const entryPoints: EntryPointNode[] = graph.filter(isEntryPoint);
    const entryPoint: EntryPointNode = entryPoints.find(
      isEntryPointInProgress()
    )!;
    const ngPackageNode: PackageNode = graph.find(isPackage)!;
    const projectBasePath = ngPackageNode.data.primary.basePath;

    try {
      // Add paths mappings for dependencies
      const tsConfig = setDependenciesTsConfigPaths(
        entryPoint.data.tsConfig!,
        entryPoints
      );

      // Compile TypeScript sources
      const { esm2022: esm2022, declarations } =
        entryPoint.data.destinationFiles;
      const { basePath, cssUrl, styleIncludePaths } =
        entryPoint.data.entryPoint;
      const { moduleResolutionCache } = entryPoint.cache;

      spinner.start(
        `Compiling with Angular sources in Ivy ${
          tsConfig.options.compilationMode || 'full'
        } compilation mode.`
      );

      entryPoint.cache.stylesheetProcessor ??= new StylesheetProcessor(
        projectBasePath,
        basePath,
        cssUrl,
        styleIncludePaths,
        options.cacheEnabled && options.cacheDirectory
      );

      await compileSourceFiles(
        graph,
        tsConfig,
        moduleResolutionCache,
        {
          outDir: path.dirname(esm2022),
          declarationDir: path.dirname(declarations),
          declaration: true,
          target: ts.ScriptTarget.ES2022,
        },
        entryPoint.cache.stylesheetProcessor,
        options.watch
      );
    } catch (error) {
      spinner.fail();
      throw error;
    } finally {
      if (!options.watch) {
        entryPoint.cache.stylesheetProcessor?.destroy();
      }
    }

    spinner.succeed();

    return graph;
  });
};
