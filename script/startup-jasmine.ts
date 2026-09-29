import { register } from 'ts-node';
import Jasmine from 'jasmine';
import path from 'path';

// static-injector 7 不再需要 TypeScript transformer：
// DI 全部走运行时的 inject()，所以这里不再注册 transformers。
register({
  project: path.resolve(__dirname, '../tsconfig.spec.json'),
  logError: true,
});
import Module from 'module';
import { createMatchPath } from 'tsconfig-paths';

/**
 * 让 `angular-miniprogram/*` 的**包自引用**在 Node 测试里可解析。
 *
 * 库源码里大量用 `import ... from 'angular-miniprogram/platform/wx'`
 * 这种自引用（50 处），构建时靠 tsconfig.library.json 的 paths 映射。
 * 但那是**编译期**的，Node 运行时不认，且 src/library/package.json 的
 * exports 里也没有这些子路径，于是 require 直接失败。
 *
 * 这里注册一个解析钩子把同一套映射搬到运行时，使得在测试里可以
 * 真正 boot 组件、跑 getPageRefreshContext 拿真实 nodeList。
 */
const matchPath = createMatchPath(
  path.resolve(__dirname, '..'),
  {
    'angular-miniprogram/platform/default': [
      './src/library/platform/default/index.ts',
    ],
    'angular-miniprogram/platform/wx': ['./src/library/platform/wx/index.ts'],
    'angular-miniprogram/platform/type': [
      './src/library/platform/type/index.ts',
    ],
    'angular-miniprogram/platform': ['./src/library/platform/index.ts'],
    '@angular/common': ['./src/library/common/index.ts'],
    '@angular/common/http': ['./src/library/common/http/index.ts'],
  },
  ['main'],
  false,
);

/**
 * 小程序全局 `wx` 的最小替身。
 *
 * `platform-core.ts` 里 `MINIPROGRAM_GLOBAL = wx` 是直接引用全局，
 * 模块加载时就要有，所以必须在启动阶段装好。
 *
 * 用 Proxy 兜底：任意成员访问返回一个可调用且可继续取属性的对象，
 * 这样测试里不必预先枚举小程序 API 的全部表面。真实值需要断言的
 * 场景，用 setWxStub() 覆盖具体成员。
 */
const wxOverrides: Record<string, unknown> = {};
function makeStub(name: string): any {
  const fn = function (...args: any[]) {
    void args;
    return undefined;
  };
  return new Proxy(fn, {
    get(_t, prop) {
      if (prop === 'then') {
        // 别让它被误当成 thenable
        return undefined;
      }
      if (prop in wxOverrides) {
        return wxOverrides[prop as string];
      }
      return makeStub(`${name}.${String(prop)}`);
    },
    has() {
      return true;
    },
    apply() {
      return undefined;
    },
  });
}
(globalThis as any).wx = new Proxy({} as any, {
  get(_t, prop) {
    if (prop in wxOverrides) {
      return wxOverrides[prop as string];
    }
    return makeStub(`wx.${String(prop)}`);
  },
  has() {
    return true;
  },
});

// 小程序页面的几个顶层全局函数，同样要在模块加载前存在
(globalThis as any).App = (globalThis as any).App || ((...a: any[]) => void a);
(globalThis as any).Page =
  (globalThis as any).Page || ((...a: any[]) => void a);
(globalThis as any).Component =
  (globalThis as any).Component || ((...a: any[]) => void a);
(globalThis as any).getApp =
  (globalThis as any).getApp || (() => ({ globalData: {} }));
(globalThis as any).getCurrentPages =
  (globalThis as any).getCurrentPages || (() => []);

const origResolve: (...a: any[]) => string = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (
  request: string,
  ...rest: any[]
): string {
  const mapped = matchPath(request, undefined, undefined, undefined);
  return origResolve.call(this, mapped ?? request, ...rest);
};

/* ---------------------------------------------------------------------------
 * 耗时统计（MP_TEST_TIMING=1 时开启）
 *
 * 目的：定位 `npm run test:ci` 慢在哪。
 *  - 阶段耗时：ts-node 注册 / 加载 spec 文件 / 执行 spec
 *  - 单个 spec 耗时排行（带源文件）
 *  - 单个模块 require 的「自身耗时」排行（用于看 ts-node 编译开销落在哪）
 * 默认关闭，不影响正常输出。
 * ------------------------------------------------------------------------- */
const TIMING = process.env.MP_TEST_TIMING === '1';
const T0 = Date.now();
let lastMark = T0;
function mark(label: string) {
  const now = Date.now();
  if (TIMING) {
    console.log(`[timing] ${label}: ${now - lastMark}ms (total ${now - T0}ms)`);
  }
  lastMark = now;
}

interface LoadRec {
  file: string;
  total: number;
  self: number;
}
const loadRecords: LoadRec[] = [];
const loadStack: { start: number; childTotal: number }[] = [];

const origLoad: (...a: any[]) => any = (Module as any)._load;
(Module as any)._load = function (
  this: any,
  request: string,
  parent: any,
  isMain: boolean,
): any {
  if (!TIMING) {
    return origLoad.apply(this, [request, parent, isMain] as any);
  }
  let resolved = request;
  try {
    resolved = (Module as any)._resolveFilename(request, parent, isMain);
  } catch {
    /* 解析失败交给原始 load 报错 */
  }
  const frame = { start: Date.now(), childTotal: 0 };
  loadStack.push(frame);
  try {
    return origLoad.apply(this, [request, parent, isMain] as any);
  } finally {
    loadStack.pop();
    const total = Date.now() - frame.start;
    const self = Math.max(0, total - frame.childTotal);
    if (loadStack.length) {
      loadStack[loadStack.length - 1].childTotal += total;
    }
    loadRecords.push({ file: resolved, total, self });
  }
};

const specRecords: { name: string; file: string; ms: number }[] = [];
const suiteRecords: { name: string; file: string; ms: number }[] = [];

function rel(p?: string) {
  if (!p) return '<unknown>';
  const r = path.relative(process.cwd(), p);
  return r && !r.startsWith('..') ? r : p;
}

function printTimingSummary() {
  const top = <T>(arr: T[], n: number, key: (t: T) => number) =>
    [...arr].sort((a, b) => key(b) - key(a)).slice(0, n);
  const fmt = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

  console.log('');
  console.log('================= TIMING SUMMARY =================');
  console.log('Slowest specs:');
  top(specRecords, 20, (s) => s.ms).forEach((s) =>
    console.log(`  ${fmt(s.ms).padStart(8)}  ${s.file}  ::  ${s.name}`),
  );
  const byFile = new Map<string, number>();
  specRecords.forEach((s) => {
    byFile.set(s.file, (byFile.get(s.file) || 0) + s.ms);
  });
  console.log('');
  console.log('Slowest spec files (sum of spec time):');
  [...byFile.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([f, ms]) => console.log(`  ${fmt(ms).padStart(8)}  ${f}`));
  console.log('');
  console.log('Slowest top-level suites:');
  top(suiteRecords, 15, (s) => s.ms).forEach((s) =>
    console.log(`  ${fmt(s.ms).padStart(8)}  ${s.file}  ::  ${s.name}`),
  );
  console.log('');
  console.log('Slowest module loads (self time, 含 ts-node 编译):');
  top(loadRecords, 20, (l) => l.self).forEach((l) =>
    console.log(
      `  ${fmt(l.self).padStart(8)} (total ${fmt(l.total)})  ${rel(l.file)}`,
    ),
  );
  console.log('');
  const sumSelf = (pred: (f: string) => boolean) =>
    loadRecords.reduce((acc, l) => (pred(l.file) ? acc + l.self : acc), 0);
  const count = (pred: (f: string) => boolean) =>
    loadRecords.filter((l) => pred(l.file)).length;
  console.log('Self-time grouped:');
  const isSpec = (f: string) => /\.spec\.tsx?$/.test(f);
  const inDir = (d: string) => (f: string) =>
    new RegExp(`[\\\\/]src[\\\\/]${d}[\\\\/]`).test(f);
  const groups: [string, (f: string) => boolean][] = [
    ['*.spec.ts', isSpec],
    ['src/library (非 spec)', (f) => inDir('library')(f) && !isSpec(f)],
    ['src/builder (非 spec)', (f) => inDir('builder')(f) && !isSpec(f)],
    ['node_modules', (f) => /[\\/]node_modules[\\/]/.test(f)],
  ];
  groups.forEach(([name, pred]) =>
    console.log(
      `  ${fmt(sumSelf(pred)).padStart(8)}  ${name}  (${count(pred)} modules)`,
    ),
  );
  console.log(`  ${fmt(Date.now() - T0).padStart(8)}  whole process`);
  const ht = (globalThis as any).__harnessTiming;
  if (ht) {
    const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
    const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0);
    console.log('');
    console.log('Sandbox (TestProjectHost) per-call cost:');
    console.log(
      `  initialize(): ${ht.init.length} calls, total ${fmt(
        sum(ht.init),
      )}, avg ${(avg(ht.init) / 1000).toFixed(2)}s, max ${fmt(
        Math.max(0, ...ht.init),
      )}`,
    );
    console.log(
      `  restore():    ${ht.restore.length} calls, total ${fmt(
        sum(ht.restore),
      )}, avg ${(avg(ht.restore) / 1000).toFixed(2)}s, max ${fmt(
        Math.max(0, ...ht.restore),
      )}`,
    );
  }
  console.log('==============================================');
}

let jasmineInstance = new Jasmine();
let args = process.argv.slice(2) || [];

if (TIMING) {
  jasmineInstance.addReporter({
    specDone: (r: any) => {
      specRecords.push({
        name: r.fullName,
        file: rel(r.filename),
        ms: r.duration || 0,
      });
    },
    suiteDone: (r: any) => {
      suiteRecords.push({
        name: r.fullName,
        file: rel(r.filename),
        ms: r.duration || 0,
      });
    },
    jasmineDone: () => {
      printTimingSummary();
    },
  });
}

(async () => {
  // 注意：loadConfigFile 是**异步**的，必须在它完成之后再改 failFast，
  // 否则会被配置文件里的 stopOnSpecFailure 覆盖回去。
  await jasmineInstance.loadConfigFile(
    path.resolve(__dirname, '../jasmine.json'),
  );
  mark('loadConfigFile');

  // 调试用：MP_TEST_NO_STOP=1 时不在第一个失败处停下，方便跑完整体看耗时
  if (process.env.MP_TEST_NO_STOP === '1') {
    jasmineInstance.stopOnSpecFailure(false);
    jasmineInstance.stopSpecOnExpectationFailure(false);
  }

  await jasmineInstance.execute(undefined, args[0] || undefined);
  mark('execute() finished');
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
