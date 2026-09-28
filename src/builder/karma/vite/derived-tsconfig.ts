import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';
import { resolveNative, toNativePath } from '../../util/asset-path';

/** 派生时要读写的 tsconfig 形状（其余字段原样透传） */
interface TsConfigShape {
  compilerOptions?: {
    types?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * 找 @types 到底在哪。
 *
 * 真实项目里 workspaceRoot/node_modules/@types 就在本地。但测试跑在
 * 临时 host 目录（test/test-project-host-XXX/）里，那个 node_modules 只有
 * test-library，@types 实际在仓库根。所以从 workspaceRoot 往上逐级找，
 * 把所有带 @types 的层都收进来（近的排前面，优先命中）。
 */
function resolveTypeRoots(workspaceRoot: string): string[] {
  const found: string[] = [];
  // 同样先归一成原生绝对路径，否则 /C:/... 进来会把整条 walk-up 链算错
  let current = toNativePath(workspaceRoot);
  const { root } = path.parse(current);

  while (current !== root) {
    const typesDir = path.join(current, 'node_modules', '@types');
    if (fs.existsSync(typesDir)) {
      found.push(typesDir);
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  // 一个都没找到时退回默认位置，让报错保持成「找不到某个具体类型库」
  // 而不是 typeRoots 为空这种更难查的形态
  return found.length
    ? found
    : [path.resolve(toNativePath(workspaceRoot), 'node_modules/@types')];
}

/**
 * 生成一个派生 tsconfig：继承原配置，但把 typeRoots 钉死。
 *
 * 为什么需要：测试跑在临时 host 目录里，`types: ["jasmine"]` 会因为
 * 找不到 @types/jasmine 报 TS2688。显式指 typeRoots 就不依赖目录 walk-up。
 *
 * 关键：派生文件必须写在**原 tsconfig 旁边**。tsconfig 里的 extends /
 * include / files / outDir 都是相对自身所在目录解析的，写到 /tmp 里
 * 这些相对路径全部错位。
 */
export function writeDerivedTsConfig(options: {
  baseTsConfig: string;
  workspaceRoot: string;
  /** 额外要加进来的类型库 */
  types?: string[];
}): { path: string } {
  // baseTsConfig 可能是 devkit posix 化的 Windows 绝对路径（/C:/...），
  // 直接 path.resolve 会拼出 C:\C:\... 双盘符。走 toNativePath 统一掉。
  const basePath = resolveNative(options.workspaceRoot, options.baseTsConfig);
  // tsconfig 不是严格的 JSON：允许注释、允许尾逗号。自己拿正则剔注释再
  // JSON.parse 的话，一个尾逗号就能把整条测试链路炸掉（报 `is not valid
  // JSON`，且完全看不出是哪个文件）。直接用 TS 自己的解析器：它只读单文件、
  // 不会把 extends 展开，正好是我们要的形状。
  const parsed = ts.readConfigFile(basePath, (p) => {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch {
      return undefined;
    }
  }) as {
    config?: TsConfigShape;
    error?: ts.Diagnostic;
    // 运行时会给整集诊断，但 d.ts 只声明了单个 error，这里手动收拢
    errors?: ts.Diagnostic[];
  };
  const syntaxErrors = [
    ...(parsed.errors ?? []),
    ...(parsed.error ? [parsed.error] : []),
  ].filter((e) => e.category === ts.DiagnosticCategory.Error);
  if (syntaxErrors.length) {
    throw new Error(
      `无法解析 tsconfig: ${basePath}\n` +
        ts.formatDiagnosticsWithColorAndContext(syntaxErrors, {
          getCurrentDirectory: () => path.dirname(basePath),
          getCanonicalFileName: (f) => f,
          getNewLine: () => '\n',
        }),
    );
  }
  const base = parsed.config ?? {};

  const derived: TsConfigShape = {
    ...base,
    compilerOptions: {
      ...base.compilerOptions,
      typeRoots: resolveTypeRoots(options.workspaceRoot),
      types: [
        ...new Set([
          ...(base.compilerOptions?.types ?? []),
          ...(options.types ?? []),
        ]),
      ],
    },
  };

  const outPath = path.join(
    path.dirname(basePath),
    `.tsconfig.generated-${path.basename(basePath, '.json')}.json`,
  );
  fs.writeFileSync(outPath, JSON.stringify(derived, null, 2), 'utf8');

  return { path: outPath };
}
