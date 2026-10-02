/**
 * 本地 vendored 的 `cyia-ngx-devkit` builder 测试工具。
 *
 * 上游包停在 0.0.5，peerDependencies 钉死在 `@angular-devkit/*` 17.x，而本项目用的是
 * 20.x，之前只能靠 package.json 里的 `overrides` 强行拉平。把它抄进来之后依赖关系就
 * 走本项目的 devDependencies，不再需要 override。
 *
 * 主要来源是 Angular CLI 早期版本的 `describeBuilder` 测试脚手架，改动：
 * - 去掉了原来 `console.error` -> `process.exit(100)` 的全局钩子。那个钩子会让任何一次
 *   `console.error` 直接杀掉测试进程，日志都来不及看。
 */
import {
  BuilderContext,
  BuilderHandlerFn,
  BuilderInfo,
  BuilderOutput,
  BuilderOutputLike,
  BuilderProgressReport,
  BuilderRun,
  Target,
  fromAsyncIterable,
  isBuilderOutput,
} from '@angular-devkit/architect';
import { TestProjectHost } from '@angular-devkit/architect/testing';
import {
  Path,
  basename,
  dirname,
  getSystemPath,
  join,
  json,
  logging,
  virtualFs,
} from '@angular-devkit/core';
import nodeFs, { readFileSync } from 'node:fs';
import nodePath from 'node:path';
import type { Assertion } from 'vitest';

import {
  EMPTY,
  Observable,
  Subject,
  defer,
  firstValueFrom,
  lastValueFrom,
  of,
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  mergeMap,
  shareReplay,
  tap,
} from 'rxjs/operators';
import type { Configuration } from 'webpack';

export interface TestContext {
  buildSuccess: (webpackConfig: Configuration) => void;
}

/**
 * 拷 sandbox 时排除的目录。
 *
 * `dist/` 是**构建输出**（模板里那份是上一次跑留下的，5.7MB / 358 个文件），
 * 它从来不是构建的输入；拷进 sandbox 只会白拷，还会让 `toExist()` 这类断言
 * 拿旧产物蒙对。`.angular/` 是 CLI 缓存，`__test-app/` 是 builder.spec.ts
 * 往仓库根拷的副本，同理不是输入。
 */
const SANDBOX_EXCLUDE = [
  /(^|[\\/])dist([\\/]|$)/,
  /(^|[\\/])\.angular([\\/]|$)/,
  /(^|[\\/])__test-app([\\/]|$)/,
];

export function isExcludedFromSandbox(
  templateRoot: string,
  srcPath: string,
): boolean {
  const rel = nodePath.relative(templateRoot, srcPath);
  if (!rel) {
    return false;
  }
  return SANDBOX_EXCLUDE.some((re) => re.test(rel));
}

/** sandbox 目录名前缀。`.gitignore` 里 `test-project-host-hello-world-app-*` 对的就是它。 */
const SANDBOX_PREFIX = 'test-project-host-';

/**
 * 本进程内的 sandbox 序号。挂 `globalThis` 而不是模块变量：同一个进程里这个模块
 * 可能被实例化两份（vitest 的模块图不保证单例），那样两个计数器会同时从 0 开始，
 * 而 `pid` 又相同，名字就真撞了。文件下面统计耗时的 `__harnessTiming` 同理。
 */
const sandboxCounter: { n: number } = ((
  globalThis as any
).__harnessSandboxCounter ??= { n: 0 });

/**
 * 占一个独占的 sandbox 目录 —— 名字是**构造唯一**的，所以既不用重试也不用随机数。
 *
 * `test-project-host-<模板名>-<pid>-<序号>` 两段各自堵死一种撞法：
 *
 * | 可能来抢的         | 为什么抢不到                        |
 * | ------------------ | ----------------------------------- |
 * | 别的进程 / worker  | 同一台机器上活着的进程 pid 互不相同  |
 * | 本进程别的 harness | 序号单调递增，发出去的名字不回收      |
 *
 * 两条都成立，`mkdirSync` 就必然一次成功。真抛 EEXIST（PID 被回收后撞上上轮
 * 崩溃留下的同名目录）就让它直接响，静默换个名字只会把问题埋掉。
 *
 * `mkdirSync` 不带 `recursive`：目录已存在会 EEXIST 而不是静默通过，`mkdir(2)`
 * 本身原子 —— 拿内核占坑，不需要锁文件，进程崩了也不留待回收的状态。
 *
 * 上游 `findUniqueFolderPath()` 两样都反过来：先 exists 检查再返回，目录是
 * 后面 `cpSync` 顺手建的（查和用之间是 TOCTOU），名字靠 `Math.random()` 碰。
 */
function claimUniqueSandboxRoot(templateRoot: Path): Path {
  const name = `${SANDBOX_PREFIX}${basename(templateRoot)}-${process.pid}-${sandboxCounter.n++}`;
  const candidate = join(dirname(templateRoot), name);
  nodeFs.mkdirSync(getSystemPath(candidate));
  return candidate;
}

/**
 * `TestProjectHost` 的快速版本，只改 `initialize()` / `restore()`。
 *
 * 上游实现的问题（实测占整个测试套件 ~31% 时间）：
 *
 * 1. `initialize()` 递归列目录后，用 `concatMap(read -> write)` **串行**经
 *    devkit 虚拟 FS 一个个文件拷，而不是用原生递归拷贝；
 * 2. 模板里的构建产物 `dist/`（5.7MB / 358 文件）也被当成输入拷了一遍；
 * 3. `restore()` 固定 `delay(50ms)` 再逐文件删。
 *
 * 每个用 harness 的 spec 都要付这份钱（共 81 个），实测
 * initialize 0.46s + restore 0.21s = 0.67s / spec，合计 54.8s。
 * 换成原生 `fs.cpSync`（排除构建产物）+ `fs.rmSync` 后约 0.27s + 0.07s。
 *
 * 并发安全：sandbox 目录由 `claimUniqueSandboxRoot()` 构造唯一 + 原子地占，
 * 不依赖上游那个先查后用的 `findUniqueFolderPath()`。
 */
export class FastTestProjectHost extends TestProjectHost {
  private get internals(): any {
    return this as any;
  }

  override initialize(): Observable<void> {
    const templateRoot = getSystemPath(this._templateRoot);

    // defer 把同步抛出的异常直接转成 error 通知，不需要手写 subscriber.error
    return defer(() => {
      this.internals._currentRoot = claimUniqueSandboxRoot(this._templateRoot);
      this.internals._scopedSyncHost = new virtualFs.SyncDelegateHost(
        new virtualFs.ScopedHost(this, this.root()),
      );
      nodeFs.cpSync(templateRoot, getSystemPath(this.root()), {
        recursive: true,
        // 与上游行为对齐：上游是 read() 读内容再写，符号链接会被 deref。
        dereference: true,
        filter: (p: string) => !isExcludedFromSandbox(templateRoot, p),
      });
      return EMPTY;
    });
  }

  override restore(): Observable<void> {
    if (this.internals._currentRoot === null) {
      return EMPTY;
    }
    return defer(() => {
      try {
        // 原生 rm 自带重试，不需要上游那个无条件 delay(50ms)。
        nodeFs.rmSync(getSystemPath(this.root()), {
          recursive: true,
          force: true,
          maxRetries: 10,
          retryDelay: 50,
        });
      } finally {
        this.internals._currentRoot = null;
        this.internals._scopedSyncHost = null;
      }
      return EMPTY;
    });
  }
}

export let host: TestProjectHost;

/** 设置测试项目的位置,不设置情况下默认为 `hello-world-app` */
export function setWorkspaceRoot(path: Path): void {
  host = new FastTestProjectHost(path);
}

/** 耗时统计（MP_TEST_TIMING=1 才记录）：每次 sandbox 建立 / 回收的耗时 */
const __timing = ((globalThis as any).__harnessTiming ??= {
  init: [] as number[],
  restore: [] as number[],
});
const __timeIt = process.env.MP_TEST_TIMING === '1';

const optionSchemaCache = new Map<string, json.JsonObject>();

export function describeBuilder<T>(
  builderHandler: BuilderHandlerFn<T & json.JsonObject>,
  options: { name?: string; schemaPath: string },
  specDefinitions: (harness: BuilderTestHarness<T>) => void,
): void {
  let optionSchema = optionSchemaCache.get(options.schemaPath);
  if (optionSchema === undefined) {
    optionSchema = JSON.parse(
      readFileSync(options.schemaPath, 'utf8'),
    ) as json.JsonObject;
    optionSchemaCache.set(options.schemaPath, optionSchema);
  }
  if (!host) {
    throw new Error('call setWorkspaceRoot first');
  }
  const harness = new BuilderTestHarness<T>(builderHandler, host, {
    builderName: options.name,
    optionSchema,
  });

  describe(options.name || builderHandler.name, () => {
    beforeEach(async () => {
      const t = Date.now();
      await host.initialize().toPromise();
      if (__timeIt) {
        __timing.init.push(Date.now() - t);
      }
    });
    afterEach(async () => {
      const t = Date.now();
      await host.restore().toPromise();
      if (__timeIt) {
        __timing.restore.push(Date.now() - t);
      }
    });

    specDefinitions(harness);
  });
}

export interface BuilderHarnessExecutionOptions {
  configuration: string;
  outputLogsOnFailure: boolean;
  outputLogsOnException: boolean;
  useNativeFileWatching: boolean;
  testContext?: TestContext;
}

export interface BuilderHarnessExecutionResult<
  T extends BuilderOutput = BuilderOutput,
> {
  result?: T;
  error?: Error;
  logs: readonly logging.LogEntry[];
}

export interface WorkspaceHost {
  getBuilderName(project: string, target: string): Promise<string>;
  getMetadata(project: string): Promise<json.JsonObject>;
  getOptions(
    project: string,
    target: string,
    configuration?: string,
  ): Promise<json.JsonObject>;
  hasTarget(project: string, target: string): Promise<boolean>;
  getDefaultConfigurationName(
    project: string,
    target: string,
  ): Promise<string | undefined>;
}

export type BuilderWatcherCallback = (
  events: Array<{
    path: string;
    type: 'created' | 'modified' | 'deleted';
    time?: number;
  }>,
) => void;

export interface BuilderWatcherFactory {
  watch(
    files: Iterable<string>,
    directories: Iterable<string>,
    callback: BuilderWatcherCallback,
  ): { close(): void };
}

export class BuilderHarness<T> {
  private readonly schemaRegistry = new json.schema.CoreSchemaRegistry();
  private projectName = 'test';
  private projectMetadata: json.JsonObject = DEFAULT_PROJECT_METADATA;
  private targetName?: string;
  private options = new Map<string | null, T>();
  private builderTargets = new Map<
    string,
    {
      handler: BuilderHandlerFn<json.JsonObject>;
      options: json.JsonObject;
      info: BuilderInfo;
    }
  >();
  private watcherNotifier?: WatcherNotifier;
  private readonly builderInfo: BuilderInfo;

  constructor(
    private readonly builderHandler: BuilderHandlerFn<T & json.JsonObject>,
    public readonly host: TestProjectHost,
    builderInfo?: Partial<BuilderInfo>,
  ) {
    // Generate default pseudo builder info for test purposes
    this.builderInfo = {
      builderName: builderHandler.name,
      description: '',
      optionSchema: true,
      ...builderInfo,
    };

    this.schemaRegistry.addPostTransform(
      json.schema.transforms.addUndefinedDefaults,
    );
  }

  private resolvePath(path: string): string {
    // 必须用 join 而不是字符串拼接：`resolvePath('.')` 拼出来会带尾部的 `/.`，
    // 之后 build-angular 用 startsWith 校验资源路径是否在工作区内时会全部失配。
    return nodePath.join(getSystemPath(this.host.root()), path);
  }

  useProject(name: string, metadata: Record<string, unknown> = {}): this {
    if (!name) {
      throw new Error('Project name cannot be an empty string.');
    }

    this.projectName = name;
    this.projectMetadata = metadata as json.JsonObject;

    return this;
  }

  useTarget(name: string, baseOptions: T): this {
    if (!name) {
      throw new Error('Target name cannot be an empty string.');
    }

    this.targetName = name;
    this.options.set(null, baseOptions);

    return this;
  }

  withConfiguration(configuration: string, options: T): this {
    this.options.set(configuration, options);

    return this;
  }

  withBuilderTarget<O extends object>(
    target: string,
    handler: BuilderHandlerFn<O & json.JsonObject>,
    options?: O,
    info?: Partial<BuilderInfo>,
  ): this {
    this.builderTargets.set(target, {
      handler: handler as BuilderHandlerFn<json.JsonObject>,
      options: (options || {}) as json.JsonObject,
      info: {
        builderName: handler.name,
        description: '',
        optionSchema: true,
        ...info,
      },
    });

    return this;
  }

  execute(
    options: Partial<BuilderHarnessExecutionOptions> = {},
  ): Observable<BuilderHarnessExecutionResult> {
    const {
      configuration,
      outputLogsOnException = true,
      outputLogsOnFailure = true,
      useNativeFileWatching = false,
    } = options;

    const targetOptions = {
      ...this.options.get(null),
      ...((configuration && this.options.get(configuration)) ?? {}),
    } as T & json.JsonObject;

    if (!useNativeFileWatching) {
      if (this.watcherNotifier) {
        throw new Error('Only one harness execution at a time is supported.');
      }
      this.watcherNotifier = new WatcherNotifier();
    }

    const contextHost: HarnessContextHost = {
      findBuilderByTarget: async (project: string, target: string) => {
        this.validateProjectName(project);
        if (target === this.targetName) {
          return {
            info: this.builderInfo,
            handler: this.builderHandler as BuilderHandlerFn<json.JsonObject>,
          };
        }

        const builderTarget = this.builderTargets.get(target);
        if (builderTarget) {
          return { info: builderTarget.info, handler: builderTarget.handler };
        }

        throw new Error('Project target does not exist.');
      },
      getBuilderName: async function (
        this: HarnessContextHost,
        project: string,
        target: string,
      ) {
        return (await this.findBuilderByTarget(project, target)).info
          .builderName;
      },
      getMetadata: async (project: string) => {
        this.validateProjectName(project);

        return this.projectMetadata;
      },
      getOptions: async (
        project: string,
        target: string,
        configuration?: string,
      ) => {
        this.validateProjectName(project);
        if (target === this.targetName) {
          return (
            (this.options.get(configuration ?? null) as
              | json.JsonObject
              | undefined) ?? {}
          );
        } else if (configuration !== undefined) {
          // Harness builder targets currently do not support configurations
          return {};
        } else {
          return this.builderTargets.get(target)?.options || {};
        }
      },
      hasTarget: async (project: string, target: string) => {
        this.validateProjectName(project);

        return this.targetName === target || this.builderTargets.has(target);
      },
      getDefaultConfigurationName: async () => undefined,
      validate: async (options: json.JsonObject, builderName?: string) => {
        let schema: json.JsonObject | boolean | undefined;
        if (builderName === this.builderInfo.builderName) {
          schema = this.builderInfo.optionSchema;
        } else {
          for (const [, value] of this.builderTargets) {
            if (value.info.builderName === builderName) {
              schema = value.info.optionSchema;
              break;
            }
          }
        }

        const validator = await this.schemaRegistry.compile(
          (schema ?? true) as json.schema.JsonSchema,
        );
        const { data } = await validator(options);

        return data as json.JsonObject;
      },
    };

    const context = new HarnessBuilderContext(
      this.builderInfo,
      this.resolvePath('.'),
      contextHost,
      useNativeFileWatching ? undefined : this.watcherNotifier,
    );
    if (this.targetName !== undefined) {
      context.target = {
        project: this.projectName,
        target: this.targetName,
        configuration: configuration,
      };
    }

    const logs: logging.LogEntry[] = [];
    context.logger.subscribe((e: logging.LogEntry) => logs.push(e));

    return of(this.builderInfo.optionSchema as json.schema.JsonSchema).pipe(
      mergeMap((schema) => this.schemaRegistry.compile(schema)),
      mergeMap((validator) => validator(targetOptions)),
      map((validationResult) => validationResult.data as json.JsonObject),
      mergeMap((data) =>
        convertBuilderOutputToObservable(
          this.builderHandler(data as T & json.JsonObject, context),
        ),
      ),
      map((buildResult) => ({ result: buildResult, error: undefined })),
      catchError((error) => {
        if (outputLogsOnException) {
          // eslint-disable-next-line no-console
          console.error(logs.map((entry) => entry.message).join('\n'));
          // eslint-disable-next-line no-console
          console.error(error);
        }

        return of({ result: undefined, error });
      }),
      map(({ result, error }) => {
        if (
          outputLogsOnFailure &&
          result?.success === false &&
          logs.length > 0
        ) {
          // eslint-disable-next-line no-console
          console.error(logs.map((entry) => entry.message).join('\n'));
        }
        // Capture current logs and clear for next
        const currentLogs = logs.slice();
        logs.length = 0;

        return { result, error, logs: currentLogs };
      }),
      finalize(() => {
        this.watcherNotifier = undefined;
        for (const teardown of context.teardowns) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          teardown();
        }
      }),
    );
  }

  async executeOnce(
    options?: Partial<BuilderHarnessExecutionOptions>,
  ): Promise<BuilderHarnessExecutionResult> {
    // Return the first result
    return firstValueFrom(this.execute(options));
  }

  async appendToFile(path: string, content: string): Promise<void> {
    await this.writeFile(path, this.readFile(path).concat(content));
  }

  async writeFile(path: string, content: string | Buffer): Promise<void> {
    const fullPath = this.resolvePath(path);
    const fs = require('fs');
    const pathModule = require('path');
    fs.mkdirSync(pathModule.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf-8');
    this.watcherNotifier?.notify([{ path: fullPath, type: 'modified' }]);
  }

  async writeFiles(files: Record<string, string | Buffer>): Promise<void> {
    const watchEvents: Array<{ path: string; type: 'modified' }> | undefined =
      this.watcherNotifier ? [] : undefined;

    for (const [path, content] of Object.entries(files)) {
      const fullPath = this.resolvePath(path);
      const fs = require('fs');
      const pathModule = require('path');
      fs.mkdirSync(pathModule.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf-8');
      watchEvents?.push({ path: fullPath, type: 'modified' });
    }

    if (watchEvents) {
      this.watcherNotifier?.notify(watchEvents);
    }
  }

  async removeFile(path: string): Promise<void> {
    const fullPath = this.resolvePath(path);
    require('fs').unlinkSync(fullPath);
    this.watcherNotifier?.notify([{ path: fullPath, type: 'deleted' }]);
  }

  async modifyFile(
    path: string,
    modifier: (content: string) => string | Promise<string>,
  ): Promise<void> {
    const content = this.readFile(path);
    await this.writeFile(path, await modifier(content));
  }

  hasFile(path: string): boolean {
    const fullPath = this.resolvePath(path);

    return require('fs').existsSync(fullPath);
  }

  hasFileMatch(directory: string, pattern: RegExp): boolean {
    const fullPath = this.resolvePath(directory);

    return require('fs')
      .readdirSync(fullPath)
      .some((name: string) => pattern.test(name));
  }

  readFile(path: string): string {
    const fullPath = this.resolvePath(path);

    return require('fs').readFileSync(fullPath, 'utf-8');
  }

  private validateProjectName(name: string): void {
    if (name !== this.projectName) {
      throw new Error(`Project "${name}" does not exist.`);
    }
  }
}

export class BuilderTestHarness<T> extends BuilderHarness<T> {
  expectFile(path: string): HarnessFileMatchers {
    return expectFile(path, this);
  }
}

export interface HarnessFileMatchers {
  toExist(): boolean;
  toNotExist(): boolean;
  readonly content: Assertion<string>;
  readonly size: Assertion<number>;
}

interface HarnessContextHost {
  findBuilderByTarget(
    project: string,
    target: string,
  ): Promise<{ info: BuilderInfo; handler: BuilderHandlerFn<json.JsonObject> }>;
  getBuilderName(project: string, target: string): Promise<string>;
  getMetadata(project: string): Promise<json.JsonObject>;
  getOptions(
    project: string,
    target: string,
    configuration?: string,
  ): Promise<json.JsonObject>;
  hasTarget(project: string, target: string): Promise<boolean>;
  getDefaultConfigurationName(
    project: string,
    target: string,
  ): Promise<string | undefined>;
  validate(
    options: json.JsonObject,
    builderName?: string,
  ): Promise<json.JsonObject>;
}

function convertBuilderOutputToObservable(
  output: BuilderOutputLike,
): Observable<BuilderOutput> {
  if (isBuilderOutput(output)) {
    return of(output);
  } else if (isAsyncIterable(output)) {
    return fromAsyncIterable(output);
  } else {
    return output as Observable<BuilderOutput>;
  }
}

function isAsyncIterable(obj: unknown): obj is AsyncIterable<BuilderOutput> {
  return (
    !!obj &&
    typeof (obj as Record<symbol, unknown>)[Symbol.asyncIterator] === 'function'
  );
}

class HarnessBuilderContext implements BuilderContext {
  public readonly id = Math.trunc(Math.random() * 1000000);
  public logger = new logging.Logger(`builder-harness-${this.id}`);
  public readonly teardowns: Array<() => Promise<void> | void> = [];
  public target?: Target;

  public workspaceRoot: string;
  public currentDirectory: string;

  constructor(
    public builder: BuilderInfo,
    basePath: string,
    private contextHost: HarnessContextHost,
    private watcherFactory?: BuilderWatcherFactory,
  ) {
    this.workspaceRoot = this.currentDirectory = basePath;
  }

  addTeardown(teardown: () => Promise<void> | void): void {
    this.teardowns.push(teardown);
  }

  /**
   * 把 harness 的 watcher 暴露给 builder。
   *
   * 真实 architect 不提供这个（webpack 自己管 watch），但我们的 Vite builder
   * 需要自己实现 watch，测试里又必须走 harness 的通知路径，
   * 所以开一个口子让 builder 能拿到 watcher。
   * 原生 fs watch 模式下（useNativeFileWatching）返回 undefined，
   * builder 自己退化成 fs.watch。
   */
  getWatcherFactory(): BuilderWatcherFactory | undefined {
    return this.watcherFactory;
  }

  async getBuilderNameForTarget(target: Target): Promise<string> {
    return this.contextHost.getBuilderName(target.project, target.target);
  }

  async getProjectMetadata(
    targetOrName: Target | string,
  ): Promise<json.JsonObject> {
    const project =
      typeof targetOrName === 'string' ? targetOrName : targetOrName.project;

    return this.contextHost.getMetadata(project);
  }

  async getTargetOptions(target: Target): Promise<json.JsonObject> {
    return this.contextHost.getOptions(
      target.project,
      target.target,
      target.configuration,
    );
  }

  // 本项目 builder 不使用，保留接口占位
  async scheduleBuilder(
    _builderName: string,
    _options?: json.JsonObject,
    _scheduleOptions?: unknown,
  ): Promise<BuilderRun> {
    throw new Error('Not Implemented.');
  }

  async scheduleTarget(
    target: Target,
    overrides?: json.JsonObject,
    scheduleOptions?: { logger?: logging.Logger },
  ): Promise<BuilderRun> {
    const { info, handler } = await this.contextHost.findBuilderByTarget(
      target.project,
      target.target,
    );
    const targetOptions = await this.validateOptions<json.JsonObject>(
      {
        ...(await this.getTargetOptions(target)),
        ...overrides,
      },
      info.builderName,
    );

    const context = new HarnessBuilderContext(
      info,
      this.workspaceRoot,
      this.contextHost,
      this.watcherFactory,
    );
    context.target = target;
    context.logger = scheduleOptions?.logger ?? this.logger.createChild('');

    const progressSubject = new Subject<BuilderProgressReport>();
    const output = convertBuilderOutputToObservable(
      handler(targetOptions, context),
    );

    const run: BuilderRun = {
      id: context.id,
      info,
      progress: progressSubject.asObservable(),
      async stop() {
        for (const teardown of context.teardowns) {
          await teardown();
        }
        progressSubject.complete();
      },
      output: output.pipe(shareReplay()),
      get result() {
        return firstValueFrom<BuilderOutput>(this.output);
      },
      get lastOutput() {
        return lastValueFrom<BuilderOutput>(this.output);
      },
    };

    return run;
  }

  async validateOptions<T extends json.JsonObject = json.JsonObject>(
    options: json.JsonObject,
    builderName: string,
  ): Promise<T> {
    return this.contextHost.validate(options, builderName) as Promise<T>;
  }

  // Unused report methods
  reportRunning(): void {}
  reportStatus(_status: string): void {}
  reportProgress(_current: number, _total?: number, _status?: string): void {}
}

class WatcherDescriptor {
  constructor(
    readonly files: Set<string>,
    readonly directories: Set<string>,
    readonly callback: BuilderWatcherCallback,
  ) {}

  shouldNotify(_path: string): boolean {
    return true;
  }
}

export class WatcherNotifier implements BuilderWatcherFactory {
  private readonly descriptors = new Set<WatcherDescriptor>();

  notify(
    events: Iterable<{
      path: string;
      type: 'created' | 'modified' | 'deleted';
    }>,
  ): void {
    for (const descriptor of this.descriptors) {
      for (const { path } of events) {
        if (descriptor.shouldNotify(path)) {
          descriptor.callback([...events]);
          break;
        }
      }
    }
  }

  watch(
    files: Iterable<string>,
    directories: Iterable<string>,
    callback: BuilderWatcherCallback,
  ): { close(): void } {
    const descriptor = new WatcherDescriptor(
      new Set(files),
      new Set(directories),
      callback,
    );
    this.descriptors.add(descriptor);

    return { close: () => this.descriptors.delete(descriptor) };
  }
}

const DEFAULT_PROJECT_METADATA: json.JsonObject = {
  root: '.',
  sourceRoot: 'src',
  cli: {
    cache: {
      enabled: false,
    },
  },
};

export function expectFile<T>(
  path: string,
  harness: BuilderHarness<T>,
): HarnessFileMatchers {
  return {
    toExist() {
      const exists = harness.hasFile(path);
      expect(exists, 'Expected file to exist: ' + path).toBe(true);

      return exists;
    },
    toNotExist() {
      const exists = harness.hasFile(path);
      expect(exists, 'Expected file to not exist: ' + path).toBe(false);

      return !exists;
    },
    get content() {
      // 文件不存在就直接带上下文抛出去。
      // 旧实现是往 jasmine 的 `expector.addFilter` 上挂一个「恒假」过滤器，
      // 那是 jasmine 未公开的内部 API，vitest 下根本没有。
      if (!harness.hasFile(path)) {
        throw new Error(
          `Expected file content but file does not exist: '${path}'`,
        );
      }
      return expect(harness.readFile(path), `With file content for '${path}'`);
    },
    get size() {
      if (!harness.hasFile(path)) {
        throw new Error(
          `Expected file size but file does not exist: '${path}'`,
        );
      }
      return expect(
        Buffer.byteLength(harness.readFile(path)),
        `With file size for '${path}'`,
      );
    },
  };
}
