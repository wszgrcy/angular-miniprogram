import type {
  CancelReason,
  RunnerTaskEventPack,
  RunnerTaskResultPack,
  RunnerTestCase,
  RunnerTestFile,
  SerializedConfig,
  VitestTestRunner,
} from 'vitest';
import type { TestModuleRegistry } from './registry';

export interface MiniProgramTestRunnerOptions {
  config: SerializedConfig;
  registry: TestModuleRegistry;
  /** 把任务状态变化推给宿主，vitest 的 reporter 全靠它 */
  onTaskUpdate(
    packs: RunnerTaskResultPack[],
    events: RunnerTaskEventPack[],
  ): void | Promise<void>;
  /**
   * 一个文件收集完了。宿主靠它建 file 实体，少调一次后面每条更新都是
   * `AssertionError: Entity must be found for task xxx`。
   */
  onCollected?(files: RunnerTestFile[]): void | Promise<void>;
  /** 文件开跑前的排队通知（Node 那边是 rpc.onQueued）。 */
  onQueued?(file: RunnerTestFile): void | Promise<void>;
  onFileFinished?(filepath: string): void | Promise<void>;
}

/**
 * 跑在小程序运行时里的 VitestRunner。
 *
 * 和 Node 版 runner 的唯一实质差别是 `importFile`：
 * Node 走 vite 的 module runner 去 dev server 拉模块，
 * 小程序只能从**编译期就编进包**的注册表里取。
 */
export class MiniProgramTestRunner implements VitestTestRunner {
  private readonly cancelled = new Set<string>();
  private readonly registeredFiles = new Set<string>();

  constructor(private readonly options: MiniProgramTestRunnerOptions) {}

  get config(): SerializedConfig {
    return this.options.config;
  }

  async importFile(filepath: string): Promise<unknown> {
    const mod = await this.options.registry.load(filepath);
    // 有的打包器把模块包一层（`{__run}` / `{default:{...}}`），取出来。
    if (
      typeof mod === 'object' &&
      mod !== null &&
      '__run' in mod &&
      typeof (mod as { __run: unknown }).__run === 'function'
    ) {
      return (mod as { __run: () => unknown }).__run();
    }
    return mod;
  }

  onCollectStart(file: RunnerTestFile): void {
    this.registeredFiles.add(file.filepath);
    this.cancelled.delete(file.filepath);
    void this.options.onQueued?.(file);
  }

  /**
   * `@vitest/runner` 在收集完一个文件后调这里。
   *
   * Node worker 不用自己管：vitest 的 `resolveTestRunner` 会把这个方法
   * 包一层去调 rpc。我们自己拼 runner，所以得自己补上。
   */
  async onCollected(files: RunnerTestFile[]): Promise<void> {
    await this.options.onCollected?.(files);
  }

  onBeforeRunFiles(files: RunnerTestFile[]): void {
    for (const file of files) {
      this.registeredFiles.add(file.filepath);
      this.cancelled.delete(file.filepath);
    }
  }

  async onAfterRunFiles(files: RunnerTestFile[]): Promise<void> {
    for (const file of files) {
      await this.options.onFileFinished?.(file.filepath);
    }
  }

  onBeforeRunTask(test: RunnerTestCase): void {
    if (this.cancelled.has(test.file.filepath)) {
      test.mode = 'skip';
    }
  }

  onBeforeTryTask(test: RunnerTestCase): void {
    if (this.cancelled.has(test.file.filepath)) {
      test.mode = 'skip';
    }
  }

  async onTaskUpdate(
    packs: RunnerTaskResultPack[],
    events: RunnerTaskEventPack[],
  ): Promise<void> {
    await this.options.onTaskUpdate(packs, events);
  }

  /**
   * 只能把「之后还没跑的」标成 skip，已经在跑的那条靠 @vitest/runner
   * 自己的检查点退出 —— 这是 VitestRunner 接口的能力上限，不是实现偷懒。
   */
  cancel(_reason: CancelReason): void {
    for (const filepath of this.registeredFiles) {
      this.cancelled.add(filepath);
    }
  }
}
