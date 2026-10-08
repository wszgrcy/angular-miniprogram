import type {
  CompilerOptions,
  ParsedConfiguration,
} from '@angular/compiler-cli';
import { dirname, normalize } from '@angular-devkit/core';
import { BuildGraph } from 'ng-packagr/src/lib/graph/build-graph';
import {
  EntryPointNode,
  PackageNode,
  isEntryPointInProgress,
  isPackage,
} from 'ng-packagr/src/lib/ng-package/nodes';
import { StylesheetProcessor } from 'ng-packagr/src/lib/styles/stylesheet-processor';
import {
  augmentProgramWithVersioning,
  cacheCompilerHost,
} from 'ng-packagr/src/lib/ts/cache-compiler-host';
import * as log from 'ng-packagr/src/lib/utils/log';
import { join } from 'node:path';
import { Injector } from 'static-injector';
import ts from 'typescript';
import {
  InlineStyleSource,
  MiniProgramCompilerService,
} from '../mini-program-compiler';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import { isSamePath } from '../util/path';
import { AddDeclarationMetaDataService } from './add-declaration-metadata.service';
import { OutputTemplateMetadataService } from './output-template-metadata.service';
import { SetupComponentDataService } from './setup-component-data.service';
import {
  CustomStyleSheetProcessor,
  compileStyles,
  inlineStyleEntries,
} from './stylesheet-processor';
import {
  ENTRY_FILE_TOKEN,
  ENTRY_POINT_TOKEN,
  RESOLVED_DATA_GROUP_TOKEN,
} from './token';

/** 懒加载入口，避免在模块顶层就把 compiler-cli 拉进来。 */
async function ngCompilerCli() {
  return import('@angular/compiler-cli');
}

export async function compileSourceFiles(
  graph: BuildGraph,
  tsConfig: ParsedConfiguration,
  moduleResolutionCache: ts.ModuleResolutionCache,
  extraOptions?: Partial<CompilerOptions>,
  stylesheetProcessor?: StylesheetProcessor,
  watch?: boolean,
) {
  const { NgtscProgram, formatDiagnostics } = await ngCompilerCli();

  const tsConfigOptions: CompilerOptions = {
    ...tsConfig.options,
    ...extraOptions,
  };
  const entryPoint: EntryPointNode = graph.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isEntryPointInProgress() as any,
  )!;
  const ngPackageNode: PackageNode = graph.find(isPackage)!;
  const inlineStyleLanguage = ngPackageNode.data.inlineStyleLanguage;

  const tsCompilerHost = cacheCompilerHost(
    graph,
    entryPoint,
    tsConfigOptions,
    moduleResolutionCache,
    stylesheetProcessor,
    inlineStyleLanguage,
  );
  // inject
  augmentLibraryMetadata(tsCompilerHost);
  const cache = entryPoint.cache;
  const sourceFileCache = cache.sourcesFileCache;
  // Angular 诊断缓存从 FileCache 中拆出，改为 entryPoint.cache.angularDiagnosticCache
  const angularDiagnosticsCache = cache.angularDiagnosticCache;

  // Create the Angular specific program that contains the Angular compiler
  const angularProgram = new NgtscProgram(
    tsConfig.rootNames,
    tsConfigOptions,
    tsCompilerHost,
    cache.oldNgtscProgram,
  );

  const angularCompiler = angularProgram.compiler;
  const { ignoreForDiagnostics, ignoreForEmit } = angularCompiler;

  // SourceFile versions are required for builder programs. The wrapped host inside NgtscProgram
  // adds additional files that will not have versions.
  const typeScriptProgram = angularProgram.getTsProgram();
  augmentProgramWithVersioning(typeScriptProgram);

  let builder: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  if (watch) {
    builder = cache.oldBuilder =
      ts.createEmitAndSemanticDiagnosticsBuilderProgram(
        typeScriptProgram,
        tsCompilerHost,
        cache.oldBuilder,
      );
    cache.oldNgtscProgram = angularProgram;
  } else {
    // When not in watch mode, the startup cost of the incremental analysis can be avoided by
    // using an abstract builder that only wraps a TypeScript program.
    builder = ts.createAbstractBuilder(typeScriptProgram, tsCompilerHost);
  }

  // Update semantic diagnostics cache
  const affectedFiles = new Set<ts.SourceFile>();

  // Analyze affected files when in watch mode for incremental type checking
  if ('getSemanticDiagnosticsOfNextAffectedFile' in builder) {
    while (true) {
      const result = builder.getSemanticDiagnosticsOfNextAffectedFile(
        undefined,
        (sourceFile) => {
          // If the affected file is a TTC shim, add the shim's original source file. This ensures
          // that changes that affect TTC are typechecked even when the changes are otherwise
          // unrelated from a TS perspective and do not result in Ivy codegen changes.
          if (
            ignoreForDiagnostics.has(sourceFile) &&
            sourceFile.fileName.endsWith('.ngtypecheck.ts')
          ) {
            // 依赖内部编译逻辑：15 是 `.ngtypecheck.ts` 的长度
            const originalFilename = sourceFile.fileName.slice(0, -15) + '.ts';
            const originalSourceFile = builder.getSourceFile(originalFilename);
            if (originalSourceFile) {
              affectedFiles.add(originalSourceFile);
            }

            return true;
          }

          return false;
        },
      );

      if (!result) {
        break;
      }

      affectedFiles.add(result.affected as ts.SourceFile);
    }
  }

  // Collect program level diagnostics
  const allDiagnostics: ts.Diagnostic[] = [
    ...angularCompiler.getOptionDiagnostics(),
    ...builder.getOptionsDiagnostics(),
    ...builder.getGlobalDiagnostics(),
  ];
  // inject
  let injector = Injector.create({
    providers: [
      ...getBuildPlatformInjectConfig(PlatformType.library),
      {
        provide: MiniProgramCompilerService,
        useFactory: (injector: Injector, buildPlatform: BuildPlatform) => {
          return new MiniProgramCompilerService(
            angularProgram,
            injector,
            buildPlatform,
          );
        },
        deps: [Injector, BuildPlatform],
      },
      {
        provide: ENTRY_FILE_TOKEN,
        useValue: join(
          dirname(normalize(tsConfig.rootNames[0])),
          normalize(tsConfigOptions.flatModuleOutFile!),
        ),
      },
      {
        provide: ENTRY_POINT_TOKEN,
        useValue: entryPoint.data.entryPoint.moduleId,
      },
    ],
  });
  const miniProgramCompilerService = injector.get(MiniProgramCompilerService);
  // Required to support asynchronous resource loading. Must be done before creating transformers
  // or getting template diagnostics
  await angularCompiler.analyzeAsync();
  // inject
  miniProgramCompilerService.init();
  const metaMap =
    await miniProgramCompilerService.exportComponentBuildMetaMap();
  /**
   * 把内联样式（`@Component.styles` / 模板 `<style>`）先编译完。必须在这里做：
   * `SetupComponentDataService` 挂在 `compilerHost.writeFile` 上，那是个同步回调，编不了异步的样式。
   * 不能指望 ng-packagr 自己那份：它的 `transformResource` 拿组件 .ts 当 key，同文件多条内联样式会互相覆盖。
   */
  if (stylesheetProcessor) {
    const styleProcessor = stylesheetProcessor as CustomStyleSheetProcessor;
    const inline: InlineStyleSource[] = [];
    metaMap.inlineStyle.forEach((list) => inline.push(...list));
    await compileStyles(
      styleProcessor,
      inlineStyleEntries(styleProcessor, inline, inlineStyleLanguage),
      (error, key) =>
        log.warn(
          `内联样式编译失败 ${key}: ${String((error as Error)?.message ?? error)}`,
        ),
    );
  }
  injector = Injector.create({
    parent: injector,
    providers: [
      { provide: RESOLVED_DATA_GROUP_TOKEN, useValue: metaMap },
      { provide: AddDeclarationMetaDataService },
      { provide: OutputTemplateMetadataService },
      { provide: SetupComponentDataService },
    ],
  });
  // Collect source file specific diagnostics
  for (const sourceFile of builder.getSourceFiles()) {
    if (!ignoreForDiagnostics.has(sourceFile)) {
      allDiagnostics.push(
        ...builder.getDeclarationDiagnostics(sourceFile),
        ...builder.getSyntacticDiagnostics(sourceFile),
        ...builder.getSemanticDiagnostics(sourceFile),
      );
    }

    if (sourceFile.isDeclarationFile) {
      continue;
    }

    // Collect sources that are required to be emitted
    if (
      !ignoreForEmit.has(sourceFile) &&
      !angularCompiler.incrementalCompilation.safeToSkipEmit(sourceFile)
    ) {
      // If required to emit, diagnostics may have also changed
      if (!ignoreForDiagnostics.has(sourceFile)) {
        affectedFiles.add(sourceFile);
      }
    } else if (
      sourceFileCache &&
      !affectedFiles.has(sourceFile) &&
      !ignoreForDiagnostics.has(sourceFile)
    ) {
      // Use cached Angular diagnostics for unchanged and unaffected files
      const angularDiagnostics = angularDiagnosticsCache.get(sourceFile);
      if (angularDiagnostics.length) {
        allDiagnostics.push(...angularDiagnostics);
      }
    }
  }

  // Collect new Angular diagnostics for files affected by changes
  for (const affectedFile of affectedFiles) {
    const angularDiagnostics = angularCompiler.getDiagnosticsForFile(
      affectedFile,
      /** OptimizeFor.WholeProgram */ 1,
    );

    allDiagnostics.push(...angularDiagnostics);
    angularDiagnosticsCache.update(affectedFile, angularDiagnostics);
  }

  const otherDiagnostics = [];
  const errorDiagnostics = [];
  for (const diagnostic of allDiagnostics) {
    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      errorDiagnostics.push(diagnostic);
    } else {
      otherDiagnostics.push(diagnostic);
    }
  }

  if (otherDiagnostics.length) {
    log.msg(formatDiagnostics(errorDiagnostics));
  }

  if (errorDiagnostics.length) {
    throw new Error(formatDiagnostics(errorDiagnostics));
  }

  const transformers = angularCompiler.prepareEmit().transformers;
  for (const sourceFile of builder.getSourceFiles()) {
    if (!ignoreForEmit.has(sourceFile)) {
      builder.emit(sourceFile, undefined, undefined, undefined, transformers);
    }
  }
  /**
   * 在 `compilerHost.writeFile` 上挂一个只读采集钩子。这里不修改任何产物内容，写出去的一律是
   * 原始 `data`；钩子只在每份产物落盘前认出类/组件，把元数据登记进 sidecar 暂存区。
   *
   * 还挂在 writeFile 上：那是唯一能「按正在写的这个源文件」天然圈定当前 entry point 的时机。
   * 直接去扫 `componentMap` / `directiveMap` 会把上游 entry point 的类一并摄进来。
   *
   * 三个 service 都是「只登记、原样返回」：
   *   - `.d.ts` → host listeners / properties / outputPath
   *   - flat module `.js` → 全局模板
   *   - 其余 `.js` → 组件模板载荷
   */
  function augmentLibraryMetadata(compilerHost: ts.CompilerHost) {
    const oldWriteFile = compilerHost.writeFile;
    compilerHost.writeFile = function (
      fileName: string,
      data: string,
      writeByteOrderMark,
      onError,
      sourceFiles,
    ) {
      const entryFileName = injector.get(ENTRY_FILE_TOKEN);
      if (fileName.endsWith('.map')) {
        return oldWriteFile.call(
          this,
          fileName,
          data,
          writeByteOrderMark,
          onError,
          sourceFiles,
        );
      }
      if (fileName.endsWith('.d.ts')) {
        injector.get(AddDeclarationMetaDataService).run(fileName, data);
      } else {
        const sourceFile = sourceFiles && sourceFiles[0];
        if (sourceFile) {
          if (
            isSamePath(
              entryFileName,
              sourceFile.fileName.replace(/\.ts$/, '.js'),
            )
          ) {
            injector.get(OutputTemplateMetadataService).run(fileName, data);
          }
          injector
            .get(SetupComponentDataService)
            .run(
              data,
              sourceFile.fileName,
              stylesheetProcessor! as CustomStyleSheetProcessor,
            );
        }
      }
      // 无论上面采集到什么，写出去的都是原内容。
      return oldWriteFile.call(
        this,
        fileName,
        data,
        writeByteOrderMark,
        onError,
        sourceFiles,
      );
    };
  }
}
