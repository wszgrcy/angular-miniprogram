import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JavaScriptTransformer } from '@angular/build/private';
import type { Plugin } from 'vite';
import type { TestProjectInlineConfiguration } from 'vitest/config';
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
 * `@angular/common` 发的是部分编译产物（`ɵɵngDeclareFactory` /
 * `ɵɵngDeclareClassMetadata` 等 linker 标记）。真实应用由 Angular 构建器在
 * 打包时把标记就地翻成 `ɵɵdefineInjectable` 等运行时定义；裸 vite 没这一步，
 * Angular 会退化成“运行时 JIT 编译”，于是模块求值直接抛
 * `The service 'BrowserXhr' needs to be compiled using the JIT compiler,
 * but '@angular/compiler' is not available`。
 *
 * 直接用 `@angular/build` 自己导出的 `JavaScriptTransformer`（`@angular/build/private`），
 * 官方构建器内部用的就是同一个类：linker 标记嗅探、`@angular/core|compiler`
 * 误报排除、worker 池与缓存都在它里面，这里不再自己接 babel。
 * `jit: false` 与官方应用构建一致 —— 产出完整 AOT 定义，不依赖 `@angular/compiler`。
 *
 * 需要配合 `test.server.deps.inline` —— vitest 默认外部化 node_modules，
 * 不内联就轮不到 transform。
 */
function angularPartialIocLinker(): Plugin {
  let transformer: JavaScriptTransformer | undefined;

  return {
    name: 'angular-partial-ioc-linker',
    enforce: 'pre',
    async transform(code, id) {
      const file = id.split('?')[0];
      if (!file.includes('node_modules')) return null;
      // 便宜的预筛，真正的 requiresLinking 判断在 transformer 里
      if (!code.includes('ɵɵngDeclare')) return null;

      transformer ??= new JavaScriptTransformer(
        { sourcemap: false, thirdPartySourcemaps: false, jit: false },
        1,
      );
      const out = await transformer.transformData(file, code, false, false);
      return { code: Buffer.from(out).toString('utf8'), map: null };
    },
  };
}

/**
 * 必须先执行的文件：**相对仓库根的 posix 路径**，按声明顺序。
 * 新增条目直接加一行路径，后缀匹配。
 *
 * 以前这里只有 `library/library.spec.ts`：它把 test-library 的构建产物拷进
 * `test/hello-world-app/node_modules/test-library`，而
 * `library-meta-sidecar.spec.ts` / `library-multiplatform.spec.ts`
 * 读的就是这份副本；顺序错了读到上一次残留的旧副本，就是假绿灯。
 *
 * 那份拷贝现在由 `test/global-setup.ts` 在 worker 起跑前统一产出，
 * 文件之间不再有先后依赖。表留着，当下没有需要打头的文件。
 */
const RUN_FIRST: string[] = [];

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

/**
 * builder 的并发上限。
 *
 * 一次小程序构建 ≈ 2s，实测每个 fork 的构建要吃 ~1.2 个核（rolldown + esbuild
 * 各自起线程/子进程）。核数开满反而更慢：16 核上 1 worker 98s、8 worker 34s、
 * 16 worker 又回到 39s（互相抢核 + 抢同一块盘的 I/O）。所以按核数的一半取，
 * 再封顶 8。
 *
 * 另一个天花板是内存：一个 fork 峰值 ~1GB（Angular 编译产物 + rolldown 图），
 * 拿总内存除 1.5GB 卡一道，小机器上自动退到少并发甚至串行，而不是被 OOM 杀掉
 * 后只拿到一句 worker exited。
 *
 * `MP_TEST_MAX_WORKERS` 覆盖它，`MP_TEST_MAX_WORKERS=1` 就是原来的串行，
 * 排查「是不是并发串台」时拿它做对照。
 */
const BUILDER_MAX_WORKERS =
  Number(process.env.MP_TEST_MAX_WORKERS) ||
  Math.min(
    8,
    Math.max(1, Math.floor(os.availableParallelism() / 2)),
    Math.max(1, Math.floor(os.totalmem() / (1.5 * 1024 * 1024 * 1024))),
  );

/**
 * 两类测试用 vitest 官方 `test.projects` 彻底分开，互不干扰。
 *
 * ### `library` —— Angular 运行时
 * `TestBed` + `initMiniProgramTestEnv()`，纯内存，不碰磁盘也不碰 `dist/`。
 * 所以吃 vitest 默认值：并行、5s 超时、每文件隔离。
 *
 * ### `builder` —— 构建链路
 * 真的跑一遍小程序构建：architect 的 `TestProjectHost` 会在仓库里开真实
 * 临时目录写文件，产物又来自 `dist/`。sandbox 名字构造唯一、模板目录只读，
 * 所以可以多 fork；但模块级注册表要求单文件粒度串行，所以
 * `sequence.concurrent: false` + 分钟级超时 + 固定执行顺序。
 *
 * 两边共用的是根配置：`resolve.alias`（包自引用）与 `setupFiles` 里的小程序全局。
 * linker plugin 和 `server.deps.inline` **只给 library**，见下面注释。
 */
const LIBRARY_PROJECT: TestProjectInlineConfiguration = {
  extends: true,
  /**
   * 只对 node_modules 里的 partial-IoC 产物跑 linker，而需要它的只有 library：
   * builder spec 里出现的 `@angular/common` 全部是**字符串字面量**（写进临时
   * fixture 的源码文本），测试进程本身并不 import 它。
   *
   * 挂在根上还有反作用：配套的 `server.deps.inline: [/@angular\//]` 会把
   * `@angular/build` 也强行内联进 vitest 的 vm 沙箱 —— 那是 builder 最不该
   * 走的路径（它就该被 Node 原生加载）。所以两者一起收进本 project。
   */
  plugins: [angularPartialIocLinker()],
  test: {
    name: 'library',
    include: ['src/library/**/*.spec.ts'],
    // linker 插件要能转到 @angular/common，就不能被 vitest 外部化给 node 直接加载
    server: { deps: { inline: [/@angular\//] } },
    // vitest 要求 maxWorkers 不同的 project 必须给不同的 groupOrder
    // （它们不能共用同一个调度池），顺手也把“先轻后重”的跑序固定下来。
    sequence: { groupOrder: 1 },
  },
};

const BUILDER_PROJECT: TestProjectInlineConfiguration = {
  extends: true,
  test: {
    name: 'builder',
    include: ['src/builder/**/*.spec.ts'],
    // 单条上限 60s。关键是**必须有界**：之前写的 500_000（8 分钟）等于没有上限，
    // 真卡住就是零反馈干等，而不是报超时。
    testTimeout: 60_000,
    hookTimeout: 60_000,
    /**
     * 执行模型：**多 fork，每个 fork 内部串行**。
     *
     * 时间几乎全花在构建上（四十次真构建 ≈ 78s，占整个 project 的八成；
     * 重复输入已经被 `shared-build` 去重掉了），而构建是 CPU 密集的，
     * 所以提速靠把 fork 铺开，不靠改用例。
     *
     * ## 并发为什么安全
     *
     * | 共享的东西 | 为什么不互踩 |
     * | ---------- | ------------ |
     * | sandbox 目录 | `claimUniqueSandboxRoot()` 用 `mkdir` 原子占坑，名字带 pid + 进程内序号，跨进程不可能重名 |
     * | `test/.shared-build` | `publish()` 先写 tmp 再 `rename`，读侧要么看不见、要么看见完整一份；目录每轮由 `globalSetup` 抹掉 |
     * | `test/hello-world-app`（模板） | 只读。唯一的写者是 `globalSetup`（库产物 + `node_modules/test-library`），跑在 worker 起跑之前 |
     * | 仓库 `dist/` | 只读（`npm run build:library` 的产物） |
     * | 模块级注册表（`manifest-registry`、`library-meta-store`） | `sequence.concurrent: false` 保证一个 worker 同一时刻只跑一个文件，跨文件也各自 reset |
     * | 临时工作区 | 走 `fs.mkdtemp(os.tmpdir())` 的 spec（mp-config / options / library-meta-store）天然隔离 |
     *
     * 以前钉串行是因为「洗牌顺序下随机碎 `template-name-coverage.spec.ts`」，
     * 那是 Ivy `TView` 跨文件累加导致的**文件顺序依赖**，不是并发竞态。
     * 现在 `--sequence.shuffle --maxWorkers=1` 已经稳定全绿，这条依赖不成立了。
     *
     * `isolate: false` 是构建去重的前提，不是可选项：`shared-build` 的记忆化表
     * 挂在模块实例上，一 isolate 就每个文件一张新表，跨文件复用当场失效。
     */
    pool: 'forks',
    maxWorkers: BUILDER_MAX_WORKERS,
    /**
     * worker 起跑前把 `test-library` 夹具构建出来，spec 之间不再有先后依赖
     * （见 `test/global-setup.ts`）。只给本 project：library 不碰磁盘也不碰
     * `dist/`，让它白付那 2s 构建没道理。
     */
    globalSetup: ['./test/global-setup.ts'],
    isolate: false,
    sequence: { concurrent: false, sequencer: OrderedSequencer, groupOrder: 2 },
  },
};

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [LIBRARY_PROJECT, BUILDER_PROJECT],
    exclude: ['**/fixture/**', 'node_modules/**'],
    globals: true,
    environment: 'node',
    setupFiles: ['./test/vitest-setup.ts'],
    // 只能在根配置上给（vitest 把 slowTestThreshold 归入 NonProjectOptions）。
    // 超过就标慢，让“变慢”在日志里先于“超时”暴露出来。
    slowTestThreshold: 20_000,
    // 同样属于 NonProjectOptions，只能放根：跑完了但 worker 收不掉
    // （子进程挂死、句柄没关）时强杀，默认 10s 对真建项目的 spec 偏紧。
    teardownTimeout: 30_000,
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
