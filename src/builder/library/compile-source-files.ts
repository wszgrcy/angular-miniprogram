import { dirname, normalize } from '@angular-devkit/core';
import { join } from 'node:path';

import type {
  CompilerOptions,
  ParsedConfiguration,
} from '@angular/compiler-cli';
import { BuildGraph } from 'ng-packagr/lib/graph/build-graph';
import {
  EntryPointNode,
  PackageNode,
  isEntryPointInProgress,
  isPackage,
} from 'ng-packagr/lib/ng-package/nodes';
import { StylesheetProcessor } from 'ng-packagr/lib/styles/stylesheet-processor';
import {
  augmentProgramWithVersioning,
  cacheCompilerHost,
} from 'ng-packagr/lib/ts/cache-compiler-host';
import * as log from 'ng-packagr/lib/utils/log';
import { ngCompilerCli } from 'ng-packagr/lib/utils/ng-compiler-cli';
import path from 'path';
import { Injector } from 'static-injector';
import ts from 'typescript';
import { MiniProgramCompilerService } from '../mini-program-compiler';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import { AddDeclarationMetaDataService } from './add-declaration-metadata.service';
import { OutputTemplateMetadataService } from './output-template-metadata.service';
import { SetupComponentDataService } from './setup-component-data.service';
import { CustomStyleSheetProcessor } from './stylesheet-processor';
import {
  ENTRY_FILE_TOKEN,
  ENTRY_POINT_TOKEN,
  RESOLVED_DATA_GROUP_TOKEN,
} from './token';
export async function compileSourceFiles(
  graph: BuildGraph,
  tsConfig: ParsedConfiguration,
  moduleResolutionCache: ts.ModuleResolutionCache,
  extraOptions?: Partial<CompilerOptions>,
  stylesheetProcessor?: StylesheetProcessor,
  watch?: boolean
) {
  const { NgtscProgram, formatDiagnostics } = await ngCompilerCli();

  const tsConfigOptions: CompilerOptions = {
    ...tsConfig.options,
    ...extraOptions,
  };
  const entryPoint: EntryPointNode = graph.find(
    isEntryPointInProgress() as any
  )!;
  const ngPackageNode: PackageNode = graph.find(isPackage)!;
  const inlineStyleLanguage = ngPackageNode.data.inlineStyleLanguage;

  const tsCompilerHost = cacheCompilerHost(
    graph,
    entryPoint,
    tsConfigOptions,
    moduleResolutionCache,
    stylesheetProcessor,
    inlineStyleLanguage
  );
  // inject
  augmentLibraryMetadata(tsCompilerHost);
  const cache = entryPoint.cache;
  const sourceFileCache = cache.sourcesFileCache;

  // Create the Angular specific program that contains the Angular compiler
  const angularProgram = new NgtscProgram(
    tsConfig.rootNames,
    tsConfigOptions,
    tsCompilerHost,
    cache.oldNgtscProgram
  );

  const angularCompiler = angularProgram.compiler;
  const { ignoreForDiagnostics, ignoreForEmit } = angularCompiler;

  // SourceFile versions are required for builder programs.
  // The wrapped host inside NgtscProgram adds additional files that will not have versions.
  const typeScriptProgram = angularProgram.getTsProgram();
  augmentProgramWithVersioning(typeScriptProgram);

  let builder: ts.BuilderProgram | ts.EmitAndSemanticDiagnosticsBuilderProgram;
  if (watch) {
    builder = cache.oldBuilder =
      ts.createEmitAndSemanticDiagnosticsBuilderProgram(
        typeScriptProgram,
        tsCompilerHost,
        cache.oldBuilder
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = builder.getSemanticDiagnosticsOfNextAffectedFile(
        undefined,
        (sourceFile) => {
          // If the affected file is a TTC shim, add the shim's original source file.
          // This ensures that changes that affect TTC are typechecked even when the changes
          // are otherwise unrelated from a TS perspective and do not result in Ivy codegen changes.
          // For example, changing @Input property types of a directive used in another component's
          // template.
          if (
            ignoreForDiagnostics.has(sourceFile) &&
            sourceFile.fileName.endsWith('.ngtypecheck.ts')
          ) {
            // This file name conversion relies on internal compiler logic and should be converted
            // to an official method when available. 15 is length of `.ngtypecheck.ts`
            const originalFilename = sourceFile.fileName.slice(0, -15) + '.ts';
            const originalSourceFile = builder.getSourceFile(originalFilename);
            if (originalSourceFile) {
              affectedFiles.add(originalSourceFile);
            }

            return true;
          }

          return false;
        }
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
            buildPlatform
          );
        },
        deps: [Injector, BuildPlatform],
      },
      {
        provide: ENTRY_FILE_TOKEN,
        useValue: join(
          dirname(normalize(tsConfig.rootNames[0])),
          normalize(tsConfigOptions.flatModuleOutFile!)
        ),
      },
      {
        provide: ENTRY_POINT_TOKEN,
        useValue: entryPoint.data.entryPoint.moduleId,
      },
    ],
  });
  const miniProgramCompilerService = injector.get(MiniProgramCompilerService);
  // Required to support asynchronous resource loading
  // Must be done before creating transformers or getting template diagnostics
  await angularCompiler.analyzeAsync();
  // inject
  miniProgramCompilerService.init();
  const metaMap =
    await miniProgramCompilerService.exportComponentBuildMetaMap();
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
        ...builder.getSemanticDiagnostics(sourceFile)
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
      const angularDiagnostics =
        sourceFileCache.getAngularDiagnostics(sourceFile);
      if (angularDiagnostics?.length) {
        allDiagnostics.push(...angularDiagnostics);
      }
    }
  }

  // Collect new Angular diagnostics for files affected by changes
  for (const affectedFile of affectedFiles) {
    const angularDiagnostics = angularCompiler.getDiagnosticsForFile(
      affectedFile,
      /** OptimizeFor.WholeProgram */ 1
    );

    allDiagnostics.push(...angularDiagnostics);
    sourceFileCache.updateAngularDiagnostics(affectedFile, angularDiagnostics);
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
  function augmentLibraryMetadata(compilerHost: ts.CompilerHost) {
    const oldWriteFile = compilerHost.writeFile;
    compilerHost.writeFile = function (
      fileName: string,
      data: string,
      writeByteOrderMark,
      onError,
      sourceFiles
    ) {
      const entryFileName = injector.get(ENTRY_FILE_TOKEN);
      if (fileName.endsWith('.map')) {
        return oldWriteFile.call(
          this,
          fileName,
          data,
          writeByteOrderMark,
          onError,
          sourceFiles
        );
      }
      if (fileName.endsWith('.d.ts')) {
        const service = injector.get(AddDeclarationMetaDataService);
        const result = service.run(fileName, data);
        return oldWriteFile.call(
          this,
          fileName,
          result,
          writeByteOrderMark,
          onError,
          sourceFiles
        );
      }
      const sourceFile = sourceFiles && sourceFiles[0];
      if (sourceFile) {
        if (
          normalize(entryFileName) ===
          normalize(sourceFile.fileName.replace(/\.ts$/, '.js'))
        ) {
          const service = injector.get(OutputTemplateMetadataService);
          const result = service.run(fileName, data, sourceFiles![0]);
          return oldWriteFile.call(
            this,
            fileName,
            result,
            writeByteOrderMark,
            onError,
            sourceFiles
          );
        }
        const originFileName = path.normalize(sourceFile.fileName);
        const setupComponentDataService = injector.get(
          SetupComponentDataService
        );
        const result = setupComponentDataService.run(
          data,
          originFileName,
          stylesheetProcessor! as CustomStyleSheetProcessor
        );
        return oldWriteFile.call(
          this,
          fileName,
          result,
          writeByteOrderMark,
          onError,
          sourceFiles
        );
      }
      return oldWriteFile.call(
        this,
        fileName,
        data,
        writeByteOrderMark,
        onError,
        sourceFiles
      );
    };
  }
}
