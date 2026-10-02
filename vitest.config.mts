import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { BaseSequencer, type TestSpecification } from 'vitest/node';
import { defineConfig } from 'vitest/config';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const r = (p: string) => path.resolve(ROOT, p);

/**
 * 包自引用的运行时映射。
 *
 * `src/library` 里几十处 `import ... from 'angular-miniprogram/platform/wx'`，
 * 构建期靠 tsconfig.library.json 的 paths，jasmine 那边靠
 * `Module._resolveFilename` 钩子。vite 有自己的解析器，两套钩子都不生效，
 * 只能在这里再声明一遍。**长 key 必须排在短 key 前面**，
 * 否则 `angular-miniprogram/platform` 会先把 `/platform/wx` 吃掉。
 */
const SELF_IMPORTS: Record<string, string> = {
  'angular-miniprogram/platform/default':
    'src/library/platform/default/index.ts',
  'angular-miniprogram/platform/wx': 'src/library/platform/wx/index.ts',
  'angular-miniprogram/platform/type': 'src/library/platform/type/index.ts',
  'angular-miniprogram/platform': 'src/library/platform/index.ts',
  'angular-miniprogram/api': 'src/library/api/index.ts',
};

const alias = Object.entries(SELF_IMPORTS)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([find, replacement]) => ({ find, replacement: r(replacement) }));

/**
 * 对 node_modules 里的 partial-IoC 产物跑 **Angular Linker**。
 *
 * `@angular/common` 发的是部分编译产物（`ɵɵngDeclareFactory` / `ɵɵngDeclareClassMetadata`
 * 等 linker 标记）。真实应用由 Angular 构建器在打包时把标记就地翻成
 * `ɵɵdefineInjectable` 等运行时定义；裸 vite 没这一步，Angular 会退化成
 * “运行时 JIT 编译”，于是模块求值直接抛
 * `The service 'BrowserXhr' needs to be compiled using the JIT compiler,
 * but '@angular/compiler' is not available`。
 *
 * 这里用官方 `@angular/compiler-cli/linker/babel` 补上同一步，而不是把
 * `@angular/compiler`（1.1MB）整个拉进测试环境。需要配合
 * `test.server.deps.inline` —— vitest 默认外部化 node_modules，不内联就轮不到 transform。
 */
async function angularPartialIocLinker(): Promise<Plugin> {
  const require = createRequire(import.meta.url);
  const babel = await import('@babel/core');
  const {
    createEs2015LinkerPlugin,
  } = require('@angular/compiler-cli/linker/babel');

  const linkerPlugin = createEs2015LinkerPlugin({
    linkerJitMode: false,
    // 官方构建器同样关掉：https://github.com/angular/angular/issues/42769
    sourceMapping: false,
    logger: { level: 1, debug() {}, info() {}, warn() {}, error() {} },
    fileSystem: {
      resolve: path.resolve,
      exists: fs.existsSync,
      dirname: path.dirname,
      relative: path.relative,
      readFile: fs.readFileSync,
    },
  });

  return {
    name: 'angular-partial-ioc-linker',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0];
      if (!file.includes('node_modules')) return null;
      // @angular/core / @angular/compiler 会误报，且本身不需要 linker
      if (/[\\/]@angular[\\/](?:compiler|core)[\\/]/.test(file)) return null;
      if (!code.includes('ɵɵngDeclare')) return null;
      const out = await babel.transformAsync(code, {
        babelrc: false,
        configFile: false,
        sourceType: 'module',
        filename: file,
        plugins: [linkerPlugin],
      });
      return out?.code ? { code: out.code, map: null } : null;
    },
  };
}

/**
 * 把 `loadEsmModule` 的 `new Function('return import(...))` 换回真正的动态 import。
 *
 * 这是 Angular 官方 `loadEsmModule` 的写法，目的是躲开打包器的静态分析。
 * vitest 用 `vm.runInThisContext` 跑模块，`new Function` 里再 `import()`
 * 会直接抛 `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`（模块求值就炸，
 * 于是 `angularCompilerCliPromise` 是个 rejected promise，
 * 所有跑真实构建的 builder spec 连带失败）。
 *
 * 语义等价，只是不再躲分析；只影响测试环境，不改源码。
 */
function dynamicImportEscapeHatch(): Plugin {
  return {
    name: 'dynamic-import-escape-hatch',
    enforce: 'pre',
    transform(code) {
      if (!code.includes('return import(modulePath)')) return null;
      return code.replace(
        /new Function\(\s*'modulePath',\s*`return import\(modulePath\);`,?\s*\)\(modulePath\)/,
        'import(/* @vite-ignore */ modulePath)',
      );
    },
  };
}

/**
 * 必须先执行的文件：**相对仓库根的 posix 路径**，按声明顺序。
 * 新增条目直接加一行路径，后缀匹配。
 *
 * 为什么需要它：`library/library.spec.ts` 会把 test-library 的构建产物拷进
 * `test/hello-world-app/node_modules/test-library`，而
 * `library-meta-sidecar.spec.ts` / `library-multiplatform.spec.ts`
 * 读的就是这份副本。按文件名排序 `library-` < `library/`
 * （`-` 是 0x2D，`/` 是 0x2F），默认顺序下读到的会是上一次残留的旧副本
 * —— 假绿灯。旧 jasmine 链路靠 `jasmine.json` 的 `spec_files` 声明顺序解决，
 * vitest 用 sequencer 表达同一件事。
 */
const RUN_FIRST = ['src/builder/library/library.spec.ts'];

/** 把 Windows 路径归一成 posix，再按 RUN_FIRST 的下标定序；不在表里的排背。 */
function firstRank(spec: TestSpecification): number {
  const id = spec.moduleId.split(path.win32.sep).join(path.posix.sep);
  const i = RUN_FIRST.findIndex((suffix) => id.endsWith(suffix));
  return i < 0 ? RUN_FIRST.length : i;
}

class OrderedSequencer extends BaseSequencer {
  override async sort(files: TestSpecification[]) {
    const list = await super.sort(files);
    return [...list].sort((a, b) => firstRank(a) - firstRank(b));
  }
}

export default defineConfig({
  resolve: { alias },
  plugins: [angularPartialIocLinker(), dynamicImportEscapeHatch()],
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['**/fixture/**', 'node_modules/**'],
    // linker 插件要能转到 @angular/common，就不能被 vitest 外部化给 node 直接加载
    server: { deps: { inline: [/@angular\//] } },
    globals: true,
    environment: 'node',
    setupFiles: ['./test/vitest-setup.ts'],
    // builder 类 spec 会真的跑一遍小程序全量构建，单条几分钟很正常。
    testTimeout: 500_000,
    hookTimeout: 500_000,
    // architect 的 TestProjectHost 会在仓库里开真实临时目录并写文件，
    // 并发跑会互相踩，所以强制单进程串行。
    pool: 'forks',
    maxWorkers: 1,
    isolate: false,
    sequence: { concurrent: false, sequencer: OrderedSequencer },
    slowTestThreshold: 10_000,
    coverage: {
      provider: 'v8',
      include: ['src/builder/**/*.ts', 'src/library/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/fixture/**', '**/test-util/**'],
      // script/coverage-badge.ts 读 docs/coverage/coverage-summary.json 的
      // total.lines.pct 生成徽章，reportsDirectory 必须指到 docs/coverage
      reportsDirectory: 'docs/coverage',
      reporter: ['text', 'json-summary', 'html'],
    },
  },
});
