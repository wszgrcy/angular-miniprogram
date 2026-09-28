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
   *
   * ⚠️ **不要拿它当「容器里有几个视图」的唯一依据**，
   * 见下面 `CONTAINER_HEADER_OFFSET` 的说明。
   */
  CONTAINER_VIEW_REFS: 8,

  /**
   * `LContainer[CONTAINER_HEADER_OFFSET]`：嵌入视图（裸 lView）的起始下标。
   *
   * 与 `VIEW_REFS` 的区别是本质性的，不是「多一个可选来源」：
   *
   * - `VIEW_REFS`（8）存 **ViewRef / ComponentRef 包装对象**，
   *   且是**惰性创建**的。只有走公开 `ViewContainerRef` API
   *   （`createEmbeddedView` / `insert`）才会填——`*ngIf`、`*ngFor`
   *   这些结构指令就是走这条路。
   * - 内建控制流 `@if` / `@for` / `@switch` 由 `ɵɵif` /
   *   `ɵɵrepeater` 等指令**直接**往 `CONTAINER_HEADER_OFFSET`（10）
   *   起塞**裸 lView**，全程不创建 ViewRef，于是 `VIEW_REFS` 恒为
   *   `null`。
   *
   * 实测（@angular/core 22.1.7，微信开发者工具，`@for (item of ['x','y'])`）：
   *   container[10] = lView('x')
   *   container[11] = lView('y')
   *   container[8]  = null
   *
   * 只读 `VIEW_REFS` 会让所有内建控制流分支渲染成空数组——
   * 节点全丢且不报错，是最难查的一类 bug。
   *
   * 读这里的裸 lView 是两条路径的**共同上游**（ViewContainerRef
   * 最终也是把 lView 插到本下标），所以以它为准，
   * 同时覆盖 `*ngIf` 与 `@if`。
   *
   * 来源：`packages/core/src/render3/interfaces/container.ts`
   */
  CONTAINER_HEADER_OFFSET: 10,
} as const;

/** `LVIEW` 里所有键的字面量联合类型 */
export type LviewKey = keyof typeof LVIEW;
