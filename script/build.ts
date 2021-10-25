import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { createTransformer } from 'static-injector/transform';
export function main() {
  let inputPath = process.argv[2];
  let filePath = path.resolve(process.cwd(), inputPath);
  let tsConfigBuffer = fs.readFileSync(filePath);
  let jsonSourceFile = ts.parseJsonText(filePath, tsConfigBuffer.toString());
  let config = ts.parseJsonSourceFileConfigFileContent(
    jsonSourceFile,
    ts.sys,
    ''
  );
  let program = ts.createProgram({
    rootNames: config.fileNames,
    options: config.options,
    projectReferences: config.projectReferences,
  });
  let errors = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
  ];
  program.getSourceFiles().forEach((sf) => {
    errors.push(
      ...program.getSyntacticDiagnostics(sf),
      ...program.getSemanticDiagnostics(sf)
    );
  });

  if (errors.length) {
    console.log(
      ts.formatDiagnostics(errors, {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: (f: string) => f,
      })
    );
    return;
  }
  let transformer = createTransformer(program);
  program.emit(undefined, undefined, undefined, undefined, {
    before: [transformer],
  });
}

if (require.main === module) {
  main();
}
