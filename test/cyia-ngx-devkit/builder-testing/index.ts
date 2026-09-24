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
import { Path, getSystemPath, json, logging } from '@angular-devkit/core';
import nodePath from 'node:path';
import { Observable, Subject, firstValueFrom, lastValueFrom, of } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  mergeMap,
  shareReplay,
} from 'rxjs/operators';

export let host: TestProjectHost;

/** 设置测试项目的位置,不设置情况下默认为 `hello-world-app` */
export function setWorkspaceRoot(path: Path): void {
  host = new TestProjectHost(path);
}

const optionSchemaCache = new Map<string, json.JsonObject>();

export function describeBuilder<T>(
  builderHandler: BuilderHandlerFn<T & json.JsonObject>,
  options: { name?: string; schemaPath: string },
  specDefinitions: (harness: JasmineBuilderHarness<T>) => void
): void {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 500 * 1000;

  let optionSchema = optionSchemaCache.get(options.schemaPath);
  if (optionSchema === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    optionSchema = JSON.parse(
      require('fs').readFileSync(options.schemaPath, 'utf8')
    );
    optionSchemaCache.set(options.schemaPath, optionSchema);
  }
  if (!host) {
    throw new Error('call setWorkspaceRoot first');
  }
  const harness = new JasmineBuilderHarness<T>(builderHandler, host, {
    builderName: options.name,
    optionSchema,
  });

  describe(options.name || builderHandler.name, () => {
    beforeEach(() => host.initialize().toPromise());
    afterEach(() => host.restore().toPromise());

    specDefinitions(harness);
  });
}

export interface BuilderHarnessExecutionOptions {
  configuration: string;
  outputLogsOnFailure: boolean;
  outputLogsOnException: boolean;
  useNativeFileWatching: boolean;
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
    configuration?: string
  ): Promise<json.JsonObject>;
  hasTarget(project: string, target: string): Promise<boolean>;
  getDefaultConfigurationName(
    project: string,
    target: string
  ): Promise<string | undefined>;
}

export type BuilderWatcherCallback = (
  events: Array<{
    path: string;
    type: 'created' | 'modified' | 'deleted';
    time?: number;
  }>
) => void;

export interface BuilderWatcherFactory {
  watch(
    files: Iterable<string>,
    directories: Iterable<string>,
    callback: BuilderWatcherCallback
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
    builderInfo?: Partial<BuilderInfo>
  ) {
    // Generate default pseudo builder info for test purposes
    this.builderInfo = {
      builderName: builderHandler.name,
      description: '',
      optionSchema: true,
      ...builderInfo,
    };

    this.schemaRegistry.addPostTransform(
      json.schema.transforms.addUndefinedDefaults
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
    info?: Partial<BuilderInfo>
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
    options: Partial<BuilderHarnessExecutionOptions> = {}
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
        target: string
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
        configuration?: string
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
          (schema ?? true) as json.schema.JsonSchema
        );
        const { data } = await validator(options);

        return data as json.JsonObject;
      },
    };

    const context = new HarnessBuilderContext(
      this.builderInfo,
      this.resolvePath('.'),
      contextHost,
      useNativeFileWatching ? undefined : this.watcherNotifier
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
          this.builderHandler(data as T & json.JsonObject, context)
        )
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
      })
    );
  }

  async executeOnce(
    options?: Partial<BuilderHarnessExecutionOptions>
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
    modifier: (content: string) => string | Promise<string>
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

export class JasmineBuilderHarness<T> extends BuilderHarness<T> {
  expectFile(path: string): HarnessFileMatchers {
    return expectFile(path, this);
  }
}

export interface HarnessFileMatchers {
  toExist(): boolean;
  toNotExist(): boolean;
  readonly content: jasmine.ArrayLikeMatchers<string>;
  readonly size: jasmine.Matchers<number>;
}

interface HarnessContextHost {
  findBuilderByTarget(
    project: string,
    target: string
  ): Promise<{ info: BuilderInfo; handler: BuilderHandlerFn<json.JsonObject> }>;
  getBuilderName(project: string, target: string): Promise<string>;
  getMetadata(project: string): Promise<json.JsonObject>;
  getOptions(
    project: string,
    target: string,
    configuration?: string
  ): Promise<json.JsonObject>;
  hasTarget(project: string, target: string): Promise<boolean>;
  getDefaultConfigurationName(
    project: string,
    target: string
  ): Promise<string | undefined>;
  validate(
    options: json.JsonObject,
    builderName?: string
  ): Promise<json.JsonObject>;
}

function convertBuilderOutputToObservable(
  output: BuilderOutputLike
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
    private watcherFactory?: BuilderWatcherFactory
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
    targetOrName: Target | string
  ): Promise<json.JsonObject> {
    const project =
      typeof targetOrName === 'string' ? targetOrName : targetOrName.project;

    return this.contextHost.getMetadata(project);
  }

  async getTargetOptions(target: Target): Promise<json.JsonObject> {
    return this.contextHost.getOptions(
      target.project,
      target.target,
      target.configuration
    );
  }

  // 本项目 builder 不使用，保留接口占位
  async scheduleBuilder(
    _builderName: string,
    _options?: json.JsonObject,
    _scheduleOptions?: unknown
  ): Promise<BuilderRun> {
    throw new Error('Not Implemented.');
  }

  async scheduleTarget(
    target: Target,
    overrides?: json.JsonObject,
    scheduleOptions?: { logger?: logging.Logger }
  ): Promise<BuilderRun> {
    const { info, handler } = await this.contextHost.findBuilderByTarget(
      target.project,
      target.target
    );
    const targetOptions = await this.validateOptions<json.JsonObject>(
      {
        ...(await this.getTargetOptions(target)),
        ...overrides,
      },
      info.builderName
    );

    const context = new HarnessBuilderContext(
      info,
      this.workspaceRoot,
      this.contextHost,
      this.watcherFactory
    );
    context.target = target;
    context.logger = scheduleOptions?.logger ?? this.logger.createChild('');

    const progressSubject = new Subject<BuilderProgressReport>();
    const output = convertBuilderOutputToObservable(
      handler(targetOptions, context)
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
    builderName: string
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
    readonly callback: BuilderWatcherCallback
  ) {}

  shouldNotify(_path: string): boolean {
    return true;
  }
}

export class WatcherNotifier implements BuilderWatcherFactory {
  private readonly descriptors = new Set<WatcherDescriptor>();

  notify(
    events: Iterable<{ path: string; type: 'created' | 'modified' | 'deleted' }>
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
    callback: BuilderWatcherCallback
  ): { close(): void } {
    const descriptor = new WatcherDescriptor(
      new Set(files),
      new Set(directories),
      callback
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
  harness: BuilderHarness<T>
): HarnessFileMatchers {
  return {
    toExist() {
      const exists = harness.hasFile(path);
      expect(exists).toBe(true, 'Expected file to exist: ' + path);

      return exists;
    },
    toNotExist() {
      const exists = harness.hasFile(path);
      expect(exists).toBe(false, 'Expected file to not exist: ' + path);

      return !exists;
    },
    get content() {
      try {
        return expect(harness.readFile(path)).withContext(
          `With file content for '${path}'`
        );
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw e;
        }
        // File does not exist so always fail the expectation
        return createFailureExpectation(
          expect(''),
          `Expected file content but file does not exist: '${path}'`
        );
      }
    },
    get size() {
      try {
        return expect(Buffer.byteLength(harness.readFile(path))).withContext(
          `With file size for '${path}'`
        );
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw e;
        }
        // File does not exist so always fail the expectation
        return createFailureExpectation(
          expect(0),
          `Expected file size but file does not exist: '${path}'`
        );
      }
    },
  };
}

/** jasmine 的类型里没有暴露 expector，这里只声明用到的部分 */
interface ExpectorHost {
  expector: {
    addFilter(f: {
      selectComparisonFunc(): () => { pass: boolean; message: string };
    }): ExpectorHost['expector'];
  };
}

function createFailureExpectation<T>(base: T, message: string): T {
  const host = base as unknown as ExpectorHost;

  host.expector = host.expector.addFilter({
    selectComparisonFunc() {
      return () => ({
        pass: false,
        message,
      });
    },
  });

  return base;
}
