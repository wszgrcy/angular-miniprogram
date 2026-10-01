import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
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
 * 给 `@angular/core` 补上被 TS `const enum` 抹掉的运行时值。
 *
 * `NotificationSource` 在 Angular 里是 `declare const enum`：
 * tsc 编译时把 `NotificationSource.Listener` 直接内联成 `5`，
 * 产物里根本没有这个导出。esbuild / oxc **不做跨文件 const enum 内联**，
 * 于是 vitest 下 `src/library/**` 里的
 * `this.scheduler.notify(NotificationSource.Listener)` 全部炸在
 * `Cannot read properties of undefined (reading 'Listener')`。
 *
 * 库产物本身走 ng-packagr（tsc），所以线上没这个问题；
 * 但任何用 esbuild/vite 直接吃源码的消费方都会踩，
 * 值得单独记一笔。
 */
const NOTIFICATION_SOURCE = {
  MarkAncestorsForTraversal: 0,
  SetInput: 1,
  DeferBlockStateUpdate: 2,
  DebugApplyChanges: 3,
  MarkForCheck: 4,
  Listener: 5,
  CustomElement: 6,
  RenderHook: 7,
  ViewAttached: 8,
  ViewDetachedFromDOM: 9,
  AsyncAnimationsLoaded: 10,
  PendingTaskRemoved: 11,
  RootEffect: 12,
  ViewEffect: 13,
};

const CORE_SHIM = '\0ng-core-const-enum-shim';

function angularCoreConstEnumShim(): Plugin {
  return {
    name: 'angular-core-const-enum-shim',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        source !== '@angular/core' ||
        importer?.includes('ng-core-const-enum-shim')
      ) {
        return null;
      }
      return CORE_SHIM;
    },
    load(id) {
      if (id !== CORE_SHIM) return null;
      return (
        `export * from '@angular/core';\n` +
        `export const ɵNotificationSource = ${JSON.stringify(NOTIFICATION_SOURCE)};\n`
      );
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

export default defineConfig({
  resolve: { alias },
  plugins: [angularCoreConstEnumShim(), dynamicImportEscapeHatch()],
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['**/fixture/**', 'node_modules/**'],
    globals: true,
    environment: 'node',
    setupFiles: ['./test/vitest-setup.ts'],
    // builder 类 spec 会真的跑一遍小程序全量构建，单条几分钟很正常。
    // jasmine 那边对应 `jasmine.DEFAULT_TIMEOUT_INTERVAL = 500 * 1000`。
    testTimeout: 500_000,
    hookTimeout: 500_000,
    // architect 的 TestProjectHost 会在仓库里开真实临时目录并写文件，
    // 并发跑会互相踩；单进程串行，行为与 jasmine 一致。
    pool: 'forks',
    maxWorkers: 1,
    isolate: false,
    sequence: { concurrent: false },
    slowTestThreshold: 10_000,
  },
});
