import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

/**
 * 库构建用的 transform。
 *
 * 它不产出任何平台的真实文本，而是把「平台相关的决定」**留成 `${}` 插值**，
 * 交给主构建填。见 `library/mp-template.ts`。
 *
 * 三处覆盖：
 *
 * | 位置 | app 构建（真实值） | 库构建（留插值） |
 * | --- | --- | --- |
 * | `directivePrefix` | `wx` | `${directivePrefix}` |
 * | `eventListConvert(list)` | `bind:tap="tapEvent"` | `${eventListConvert(["tap"])}` |
 * | `fileExtname.*` | `.wxml` 等 | `${fileExtname.*}`（在 LibraryBuildPlatform） |
 *
 * 注意 `templateInterpolation` **不需要覆盖**：我们的分隔符是 `${}`，和 wxml
 * 自己的 `{{ }}` 不撞，所以库模板里的 `{{hasLoad}}` 就是普通静态文本，
 * 主构建渲染时原样进出，不需要任何转义。
 *
 * 于是同一份库产物能通吃 wx / zfb / bd / qq —— 平台相关的东西一个都不烘进库里。
 */
export class LibraryTransform extends WxTransformLike {
  directivePrefix = '${directivePrefix}';

  override eventListConvert = (list: string[]) => {
    const args = list.map((name) => JSON.stringify(name)).join(', ');
    return `\${eventListConvert([${args}])}`;
  };
}
