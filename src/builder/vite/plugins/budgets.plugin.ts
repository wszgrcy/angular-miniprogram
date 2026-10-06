import type { BuilderContext } from '@angular-devkit/architect';
import type { OutputAsset, OutputBundle, OutputChunk, Plugin } from 'rollup';
import type {
  BudgetEntry,
  BudgetStats,
} from '../../util/angular-build-compat';
import { loadBudgetChecker } from '../../util/angular-build-compat';

/**
 * `budgets` / `statsJson`：产物体积核算。
 *
 * 阈值换算、`all` / `any` / `initial` / `bundle` 的口径、报错文案全部复用
 * @angular/build 的实现，本文件只负责把 rollup 的 bundle 拼成它要的
 * `BudgetStats`。口径在小程序语境下的对应关系：
 *
 *  - `initial` —— 所有入口 chunk 之和，即「所有页面/组件入口 JS 的总量」
 *  - `all`     —— 全部产物（≈ 整包体积，对小程序的主包 2MB 限制最有用）
 *  - `any` / `anyScript` —— 单个文件
 *  - `bundle` + `name`   —— 指定 chunk
 *
 * `statsJson` 出的是 `{chunks, assets}`（每项带 size），不是 webpack 那份
 * stats —— 体积分析要的「谁占了多少」这里一次遍历就有了。
 */
export function budgetsPlugin(options: {
  budgets?: BudgetEntry[];
  statsJson?: boolean;
  logger: BuilderContext['logger'];
}): Plugin {
  return {
    name: 'mini-program:budgets',
    async generateBundle(_outputOptions, bundle) {
      // 先算 stats：stats.json 本身不该算进体积
      const stats = collectBudgetStats(bundle);
      if (options.statsJson) {
        this.emitFile({
          type: 'asset',
          fileName: 'stats.json',
          source: `${JSON.stringify(stats, null, 2)}\n`,
        });
      }
      if (!options.budgets?.length) {
        return;
      }
      const { checkBudgets, ThresholdSeverity } = await loadBudgetChecker();
      const errors: string[] = [];
      for (const result of checkBudgets(options.budgets, stats)) {
        if (result.severity === ThresholdSeverity.Error) {
          errors.push(result.message);
        } else {
          options.logger.warn(`[budgets] ${result.message}`);
        }
      }
      if (errors.length) {
        throw new Error(
          `产物体积超出 budgets 限制：\n  - ${errors.join('\n  - ')}`,
        );
      }
    },
  };
}

/**
 * rollup bundle → @angular/build 的 BudgetStats。
 *
 * 它的模型是「assets 是体积的唯一来源，chunks 用 files 引用 asset 名」，
 * 所以每个产物文件都要进 assets，chunk 再按文件名指回去 ——
 * 少填一个 assets 就会报 `Could not find asset for file`。
 */
export function collectBudgetStats(bundle: OutputBundle): BudgetStats {
  const assets: NonNullable<BudgetStats['assets']> = [];
  const chunks: NonNullable<BudgetStats['chunks']> = [];
  for (const [fileName, item] of Object.entries(bundle)) {
    assets.push({ name: fileName, size: byteLength(item) });
    if (item.type === 'chunk') {
      chunks.push({
        names: [item.name],
        files: [fileName],
        initial: item.isEntry,
      });
    }
  }
  return { chunks, assets };
}

function byteLength(item: OutputChunk | OutputAsset): number {
  if (item.type === 'chunk') {
    return Buffer.byteLength(item.code, 'utf8');
  }
  const source = item.source;
  return typeof source === 'string'
    ? Buffer.byteLength(source, 'utf8')
    : source.byteLength;
}
