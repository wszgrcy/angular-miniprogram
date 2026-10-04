import type {
  BudgetCalculatorResult,
  BudgetEntry,
  BudgetStats,
  ThresholdSeverity,
} from '@angular/build/private';
import { normalizeFileReplacements } from '@angular-devkit/build-angular/src/utils/normalize-file-replacements';
import { normalizeOptimization } from '@angular-devkit/build-angular/src/utils/normalize-optimization';
import { normalizeSourceMaps } from '@angular-devkit/build-angular/src/utils/normalize-source-maps';

/**
 * 复用 @angular 侧实现的收口层。
 *
 * 分两类，加载代价差一个数量级，所以待遇不同：
 *
 *  - **归一函数**（`normalizeOptimization` / `normalizeSourceMaps`）：
 *    `@angular-devkit/build-angular` 的 package.json 没有 `exports` 字段，
 *    深导入合法，而且这两个模块编译出来零运行时依赖，静态 import 不心疼。
 *    走 `src/utils/xxx` 而不是 `src/utils`（barrel 会把 webpack 那堆一起拖进来）。
 *  - **`@angular/build/private`**：官方入口，但注释里写明「只给
 *    @angular-devkit/build-angular 用、不保证 SemVer」，而且它一 require 就把
 *    application builder / dev-server / sass service / index-html 全拖进来。
 *    所以只在真要用时 `await import()`，且只在这一处出现 —— 上游挪了导出
 *    也只坏这一个文件。
 */

export type { BudgetCalculatorResult, BudgetEntry, BudgetStats };

/** `optimization` 的布尔 / 对象两种写法归一（跟 @angular/build 同一套规则）。 */
export const normalizeOptimizationOptions = normalizeOptimization;

/** `sourceMap` 的布尔 / 对象两种写法归一。 */
export const normalizeSourceMapOptions = normalizeSourceMaps;

/**
 * `fileReplacements` 归一：认 `replace/with` 与 `src/replaceWith` 两种写法，
 * 相对路径拼 workspaceRoot，并校验两侧文件存在。
 */
export const normalizeFileReplacementList = normalizeFileReplacements;

/**
 * budgets 的判定实现（阈值换算、`all` / `any` / `initial` / `bundle` 口径、
 * 报错文案）全部来自 @angular/build，我们只负责把 rollup 的 bundle 拼成
 * 它要的 `BudgetStats`。
 *
 * `ThresholdSeverity` 一并取出来：它是 string enum，直接拿字面量比会被
 * `no-unsafe-enum-comparison` 拦下，而且 enum 换了值也不会报错。
 */
export async function loadBudgetChecker(): Promise<{
  checkBudgets: (
    budgets: BudgetEntry[],
    stats: BudgetStats,
    checkComponentStyles?: boolean,
  ) => IterableIterator<BudgetCalculatorResult>;
  ThresholdSeverity: typeof ThresholdSeverity;
}> {
  const privateApi = await import('@angular/build/private');
  return {
    checkBudgets: privateApi.checkBudgets,
    ThresholdSeverity: privateApi.ThresholdSeverity,
  };
}
