import { globSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rimraf } from 'rimraf';
import { build, type UserConfig } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 一个 vite 构建目标 = `src` 下的一棵 TS 目录树。
 *
 * 全部走 `preserveModules`：产物目录与源码目录一比一。
 * 这不是审美选择，而是硬约束——
 *  - `builders.json` 的 implementation 是 `./vite` / `./library/builder` / `./vitest/vite`，
 *    Angular CLI 按**文件路径**加载 builder；
 *  - `path.resolve(__dirname, '../template/app-template.js')`
 *    这类「按相对路径取自己的产物」散落在 7 个 platform 实现里；
 *  - `package.json#exports` 的 `./vitest` 也指到具体文件。
 * 打包成单文件会同时打断这三处。
 */
interface BuildTarget {
  /** 日志里显示的名字 */
  name: string;
  /** 源码根（相对仓库根） */
  srcDir: string;
  /** 产物根（相对仓库根） */
  outDir: string;
  /** 相对 srcDir 的排除规则 */
  exclude?: (rel: string) => boolean;
  /**
   * 显式入口（相对 srcDir，不含扩展名）。
   * 给了就只用这些入口，其余模块靠 preserveModules 按需带出。
   */
  entryFiles?: string[];
  /**
   * 产物模块格式，默认 cjs。
   *
   * builder 主链路必须是 cjs（Angular CLI 用 require 加载 builder），
   * 但 vitest 的宿主侧插件是被 `vitest.config.mts` 用 ESM `import {}` 引的，
   * 给 cjs 就得赌 cjs-module-lexer 能认出命名导出（实际认不出）。
   */
  format?: 'cjs' | 'esm';
}

/** vitest 的设备端跑在小程序里，产物根独立于 dist/builder。 */
const isVitestRuntime = (rel: string) => rel.startsWith('vitest/runtime/');

const TARGETS: BuildTarget[] = [
  {
    name: 'builder',
    srcDir: 'src/builder',
    outDir: 'dist/builder',
    exclude: isVitestRuntime,
  },
  // vitest 的设备端：被测试工程的 vite 打进小程序包，
  // 所以裸依赖（vitest/browser、birpc、flatted）一律 external，
  // 由应用侧的 vite 去解析 —— 和以往客户端外置传输库同理。
  {
    name: 'vitest-runtime',
    srcDir: 'src/builder/vitest/runtime',
    outDir: 'dist/vitest/runtime',
  },
  // vitest 的宿主侧插件（miniProgramVitest）。被测试工程的
  // `vitest.config.mts` 以 ESM 命名导入引用，所以必须单独出 ESM，
  // 不能复用 dist/builder 下的 cjs 产物。
  // outDir 是 dist/vitest/plugin，和 vitest-runtime 的 dist/vitest/runtime
  // 不重叠，两边各自的 emptyOutDir 不会互相洗掉。
  {
    name: 'vitest-plugin',
    srcDir: 'src/builder/vitest',
    entryFiles: ['node/index'],
    outDir: 'dist/vitest/plugin',
    format: 'esm',
  },
];

function collectEntries(
  srcDir: string,
  exclude?: (rel: string) => boolean,
  entryFiles?: string[],
) {
  const entries: Record<string, string> = {};
  const rels = entryFiles
    ? entryFiles.map((f) => `${f}.ts`)
    : globSync('**/*.ts', { cwd: srcDir }).filter(
        (rel) =>
          !rel.endsWith('.spec.ts') &&
          !rel.endsWith('.d.ts') &&
          !rel.endsWith('.template.ts') &&
          !rel.includes('fixture/') &&
          !exclude?.(rel),
      );
  for (const rel of rels) {
    entries[rel.replace(/\.ts$/, '')] = path.join(srcDir, rel);
  }
  if (!Object.keys(entries).length) {
    throw new Error(`[${path.relative(ROOT, srcDir)}] 没找到任何入口`);
  }
  return entries;
}

/**
 * 裸标识符一律 external。
 *
 * builder 是 Node 侧代码，依赖必须留在 node_modules：
 * 一是 `@angular/compiler-cli` / `ng-packagr` 本来就是运行时
 * `await import()` 进来的，打进产物反而会因为 rollup 静态分析而报错；
 * 二是 `abortcontroller-polyfill/dist/abortcontroller` 那个 ponyfill
 * 要交给**小程序侧**的 vite 去解析，构建期不能吞。
 */
function isExternal(id: string): boolean {
  if (id.startsWith('.') || path.isAbsolute(id)) return false;
  if (id.startsWith('\0') || id.startsWith('virtual:')) return false;
  return true;
}

function makeConfig(target: BuildTarget): UserConfig {
  const srcDir = path.join(ROOT, target.srcDir);
  const outDir = path.join(ROOT, target.outDir);
  const entries = collectEntries(srcDir, target.exclude, target.entryFiles);
  /**
   * dist/package.json 没有 `"type": "module"`（发布包主体是 CJS），所以
   * ESM 产物必须用 `.mjs`，否则 Node 按 CJS 解析，ESM 命名导入直接报
   * `Named export 'xxx' not found`。
   */
  const ext = target.format === 'esm' ? 'mjs' : 'js';
  return {
    root: ROOT,
    configFile: false,
    publicDir: false,
    logLevel: 'warn',
    resolve: {
      alias: {
        // 与 tsconfig.builder.json 的 paths 对齐：该包完全没有类型，
        // 运行时也必须指到那个纯 ponyfill 文件。
        'abortcontroller-polyfill/dist/abortcontroller': path.join(
          ROOT,
          'node_modules/abortcontroller-polyfill/dist/abortcontroller.js',
        ),
      },
    },
    esbuild: {
      target: 'es2022',
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: false,
        },
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
      target: 'node20',
      minify: false,
      sourcemap: false,
      reportCompressedSize: false,
      lib: {
        entry: entries,
        formats: [target.format ?? 'cjs'],
        fileName: (_f, name) => `${name}.${ext}`,
      },
      rollupOptions: {
        external: isExternal,
        output: {
          preserveModules: true,
          preserveModulesRoot: srcDir,
          entryFileNames: `[name].${ext}`,
          chunkFileNames: `[name].${ext}`,
          exports: 'named',
          esModule: true,
        },
      },
    },
  };
}

/**
 * 用 vite 构建全部 Node 侧产物。
 *
 * 类型检查不在这里：vite 走 esbuild，只转译不检查。
 * `npm run typecheck:builder` 负责把 `tsc --noEmit` 补上，
 * 原先 `noEmitOnError: true` 提供的「类型不过就不落盘」保证由那条命令 +
 * `npm run build` 的串行顺序共同提供。
 */
export async function viteBuildAll(): Promise<void> {
  const started = Date.now();
  await rimraf(path.join(ROOT, 'dist/builder'));
  for (const target of TARGETS) {
    const t0 = Date.now();
    await build(makeConfig(target));
    console.log(
      `vite build ${target.name} -> ${target.outDir} (${Date.now() - t0}ms)`,
    );
  }
  console.log(`vite build all: ${Date.now() - started}ms`);
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  viteBuildAll().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
