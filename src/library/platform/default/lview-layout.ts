/**
 * Angular lView / LContainer 的 header 下标。
 *
 * ## 为什么需要这个模块
 *
 * 这些常量在 `@angular/core` 源码里都是 `export const`，但**既没有进公开
 * API，也没有 `ɵ` 导出**（已核对 v22 的 `core.mjs` 导出面与
 * `goldens/public-api/core/index.api.md`，均无）。我们做小程序渲染要读
 * lView 的头部结构，只能自己持有这些下标。
 *
 * ## 风险实证：它们真的会变
 *
 * 跨版本核对（`packages/core/src/render3/interfaces/view.ts`）：
 *
 *   v19.2.25   HEADER_OFFSET = 26
 *   v20.3.31   HEADER_OFFSET = 27   ← 变了
 *   v21.2.9    HEADER_OFFSET = 27
 *   v22.1.7    HEADER_OFFSET = 27
 *
 * 如果硬编码 26 然后升级到 v20，`nodeList[index - HEADER_OFFSET]` 会整体
 * 错位一位——**渲染结果错乱但不抛任何错误**，是最难查的一类 bug。
 *
 * ## 因此本模块的设计约束
 *
 * 1. 全项目只有这里定义这些下标，其他地方一律用 `LVIEW.*`，
 *    不允许再出现裸数字或本地重复常量。
 * 2. 配套 `lview-layout.spec.ts` 做两层校验：
 *    - 从**已安装的** `@angular/core` fesm 里读出实际值做比对
 *    - 运行时结构自检，确认下标指向的东西语义正确
 *    升级 Angular 后若布局变化，校验会失败并指出是哪个下标不对，
 *    而不是等到页面上出现错位才发现。
 *
 * ## 升级 Angular 时的操作
 *
 * 直接跑 `npm run test:jasmine lview-layout`。
 * 失败信息会给出「我们的值」vs「已安装 Angular 的值」，按后者更新本文件。
 */
export const LVIEW = {
  /**
   * `lView[CLEANUP]`：清理回调数组（`destroy` 时逐个执行）。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  CLEANUP: 7,

  /**
   * `lView[CONTEXT]`：组件实例 / 模板上下文。
   *
   * 注意 Angular 里就叫 `CONTEXT`，本项目历史上叫 `LVIEW_CONTEXT`，
   * 是同一个东西（值都是 8）。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  CONTEXT: 8,

  /**
   * `lView[INJECTOR]`：该视图的 NodeInjector。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  INJECTOR: 9,

  /**
   * 第一个用户节点在 lView 里的起始下标。
   *
   * ⚠️ 这个值变过（v19=26 → v20=27），是本模块存在的主要原因。
   * 来源：`packages/core/src/render3/interfaces/view.ts`
   */
  HEADER_OFFSET: 27,

  /**
   * `LContainer[VIEW_REFS]`：容器内嵌入视图的 ComponentRef 数组。
   *
   * 注意这是 **LContainer** 的下标，不是 LView 的。
   * 与 `LVIEW.CONTEXT`（也是 8）数值相同但语义无关，别混用。
   * 来源：`packages/core/src/render3/interfaces/container.ts`
   */
  CONTAINER_VIEW_REFS: 8,
} as const;

/** `LVIEW` 里所有键的字面量联合类型 */
export type LviewKey = keyof typeof LVIEW;
