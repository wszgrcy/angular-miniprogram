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
 *  - `builders.json` 的 implementation 是 `./vite` / `./library/builder` / `./karma/vite`，
 *    Angular CLI 按**文件路径**加载 builder；
 *  - `path.resolve(__dirname, '../template/app-template.js')`
 *    这类「按相对路径取自己的产物」散落在 7 个 platform 实现里；
 *  - `package.json#exports` 的 `./karma/plugin` 也指到具体文件。
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
}

/** builder 主链路里不含 karma 的 client / plugin：它们有自己的 tsconfig 与产物根。 */
const isKarmaSide = (rel: string) =>
  rel.startsWith('karma/client/') || rel.startsWith('karma/plugin/');

/** vitest 的设备端跑在小程序里，产物根独立于 dist/builder。 */
const isVitestRuntime = (rel: string) => rel.startsWith('vitest/runtime/');

const TARGETS: BuildTarget[] = [
  {
    name: 'builder',
    srcDir: 'src/builder',
    outDir: 'dist/builder',
    exclude: (rel) => isKarmaSide(rel) || isVitestRuntime(rel),
  },
  // 顺序有讲究：plugin 的产物根是 `dist/karma`，client 是它的子目录，
  // 先 client 后 plugin 会把 client 的产物连带清掉。
  {
    name: 'karma-plugin',
    srcDir: 'src/builder/karma',
    outDir: 'dist/karma',
    // 对齐 karma/plugin/tsconfig.json 的 `files: ["./index.ts"]`：
    // 产物只有 plugin/{index,launcher} 与 vite/karma-framework 三个模块。
    // 这里不能「全量扫 karma 目录」，否则会把 client/ 和 vite/ 下
    // 一堆跑 Node 构建用的模块一起塞进 dist/karma。
    entryFiles: ['plugin/index', 'vite/karma-framework'],
  },
  {
    name: 'karma-client',
    srcDir: 'src/builder/karma/client',
    outDir: 'dist/karma/client',
  },
  // vitest 的设备端：被测试工程的 vite 打进小程序包，
  // 所以裸依赖（vitest/browser、birpc、flatted）一律 external，
  // 由应用侧的 vite 去解析 —— 和 karma/client 外置 socket.io-client 同理。
  {
    name: 'vitest-runtime',
    srcDir: 'src/builder/vitest/runtime',
    outDir: 'dist/vitest/runtime',
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
 * 一是 `@angular/compiler-cli` / `ng-packagr` / `karma` 本来就是运行时
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
        formats: ['cjs'],
        fileName: (_f, name) => `${name}.js`,
      },
      rollupOptions: {
        external: isExternal,
        output: {
          preserveModules: true,
          preserveModulesRoot: srcDir,
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          exports: 'named',
          esModule: true,
        },
      },
    },
  };
}

/**
 * 用 vite 构建全部 Node 侧产物（builder + karma）。
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
