/**
 * Angular lView / LContainer 的 header 下标。
 *
 * 这些常量在 `@angular/core` 里既没进公开 API 也没有 `ɵ` 导出，只能自己持有。
 * 它们会随版本变（v19 HEADER_OFFSET=26，v20 起 =27），硬编码错了会让 `nodeList`
 * 整体错位一位且不抛错。
 *
 * 全项目只有这里定义这些下标，其他地方一律用 `LVIEW.*`。
 * 配套的 `lview-layout.spec.ts` 会从已安装的 `@angular/core` 里读实际值做比对，
 * 升级 Angular 后直接跑 `npx vitest run lview-layout`。
 */
export const LVIEW = {
  /** `lView[CLEANUP]`：清理回调数组（`destroy` 时逐个执行）。 */
  CLEANUP: 7,

  /** `lView[CONTEXT]`：组件实例 / 模板上下文。 */
  CONTEXT: 8,

  /** `lView[INJECTOR]`：该视图的 NodeInjector。 */
  INJECTOR: 9,

  /** 第一个用户节点在 lView 里的起始下标。v19=26，v20 起=27。 */
  HEADER_OFFSET: 27,

  /**
   * `LContainer[VIEW_REFS]`：容器内嵌入视图的 ComponentRef 数组。这是 LContainer 的下标，
   * 与 `LVIEW.CONTEXT`（也是 8）数值相同但语义无关。不要拿它当「容器里有几个视图」的依据，
   * 见下面 `CONTAINER_HEADER_OFFSET`。
   */
  CONTAINER_VIEW_REFS: 8,

  /**
   * `LContainer[CONTAINER_HEADER_OFFSET]`：嵌入视图（裸 lView）的起始下标。
   *
   * 与 `VIEW_REFS` 的区别是本质性的：`VIEW_REFS` 存惰创建的 ViewRef / ComponentRef 包装，
   * 只有走 `ViewContainerRef` API（`*ngIf` / `*ngFor`）才会填；内建控制流 `@if` / `@for` /
   * `@switch` 直接往本下标起塞裸 lView，`VIEW_REFS` 恒为 `null`。
   * 读这里是两条路径的共同上游，同时覆盖 `*ngIf` 与 `@if`。
   */
  CONTAINER_HEADER_OFFSET: 10,
} as const;

/** `LVIEW` 里所有键的字面量联合类型 */
export type LviewKey = keyof typeof LVIEW;
