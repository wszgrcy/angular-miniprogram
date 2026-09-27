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
    path.dirname(filePath)
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
    // 必须显式置退出码。之前这里只 `return`，进程仍以 0 退出，
    // 于是 `npm run build` 的 `&&` 链继续往下跑并报告成功——
    // 带着类型错误的构建会被当成成功产物。
    process.exitCode = 1;
    return;
  }
  let transformer = createTransformer(program);
  const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [transformer],
  });

  // emit 阶段自有的诊断（典型如 declaration 生成错误）不在
  // 上面的预检查范围内，同样需要纳入退出码判定。
  const emitErrors = emitResult.diagnostics.filter(
    (d) => d.category === ts.DiagnosticCategory.Error,
  );
  if (emitErrors.length) {
    console.log(
      ts.formatDiagnostics(emitErrors, {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: (f: string) => f,
      })
    );
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
