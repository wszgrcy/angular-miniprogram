/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Transform,
  transformFromPromise,
} from 'ng-packagr/src/lib/graph/transform';
import {
  EntryPointNode,
  PackageNode,
  isEntryPoint,
  isEntryPointInProgress,
  isPackage,
} from 'ng-packagr/src/lib/ng-package/nodes';
import { NgPackagrOptions } from 'ng-packagr/src/lib/ng-package/options.di';
import { StylesheetProcessor as StylesheetProcessorClass } from 'ng-packagr/src/lib/styles/stylesheet-processor';
import { setDependenciesTsConfigPaths } from 'ng-packagr/src/lib/ts/tsconfig';
import ora from 'ora';
import * as path from 'path';
import ts from 'typescript';
import { compileSourceFiles } from './compile-source-files';
import {
  registerLibraryMetaEntry,
  writeLibraryMetaFile,
} from './library-meta-store';

export const myCompileNgcTransformFactory = (
  StylesheetProcessor: typeof StylesheetProcessorClass,
  options: NgPackagrOptions,
): Transform => {
  return transformFromPromise(async (graph) => {
    const spinner = ora({
      hideCursor: false,
      discardStdin: false,
    });

    const entryPoints: EntryPointNode[] = graph.filter(isEntryPoint);
    const entryPoint: EntryPointNode = entryPoints.find(
      isEntryPointInProgress(),
    )!;
    const ngPackageNode: PackageNode = graph.find(isPackage)!;
    const projectBasePath = ngPackageNode.data.primary.basePath;
    /** 库产物根（`dist/`），sidecar 就落在这里 */
    const distRoot = ngPackageNode.data.primary.destinationPath;

    try {
      // Add paths mappings for dependencies
      const tsConfig = setDependenciesTsConfigPaths(
        entryPoint.data.tsConfig!,
        entryPoints,
      );

      // Compile TypeScript sources
      const {
        esm2022: esm2022,
        declarations,
        declarationsBundled,
      } = entryPoint.data.destinationFiles;
      const { basePath, cssUrl, styleIncludePaths } =
        entryPoint.data.entryPoint;
      const { moduleResolutionCache } = entryPoint.cache;

      spinner.start(
        `Compiling with Angular sources in Ivy ${
          tsConfig.options.compilationMode || 'full'
        } compilation mode.`,
      );

      entryPoint.cache.stylesheetProcessor ??= new StylesheetProcessor(
        projectBasePath,
        basePath,
        cssUrl,
        styleIncludePaths,
        // ng-packagr 19 在 cacheDirectory 之前新增了 `sass` 参数
        undefined,
        options.cacheEnabled && options.cacheDirectory,
        options.watch,
      );

      /**
       * 先把本 entry 的「扁平化 d.ts 路径」登记进 sidecar 暂存区。
       *
       * 用 ng-packagr 自己的 `declarationsBundled`（= `dist/types/<flat>.d.ts`），
       * 也就是最终 `package.json#typings` 指的那个文件。读取侧拿类的
       * `getSourceFile()` 相对库根一算就能命中，不用反推 exports map。
       */
      registerLibraryMetaEntry(
        entryPoint.data.entryPoint.moduleId,
        declarationsBundled,
        distRoot,
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
        options.watch,
      );

      /**
       * 每个 entry 编译完就落一次盘（全量重写，幂等）。
       *
       * 放在这里而不是 build 结束后的钩子上，是因为 watch 模式下
       * 「build 结束」根本不会发生；挂在 entry 编译尾部两条路径都能覆盖。
       */
      writeLibraryMetaFile(distRoot);
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
