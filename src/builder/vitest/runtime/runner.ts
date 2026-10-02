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
