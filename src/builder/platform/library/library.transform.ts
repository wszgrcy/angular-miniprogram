import { WxTransformLike } from '../template-transform-strategy/wx-like/wx-transform.base';

/**
 * 库构建用的 transform。它不产出任何平台的真实文本，而是把平台相关的决定留成 `${}` 插值，
 * 交给主构建填。见 `library/mp-template.ts`。
 *
 * | 位置 | app 构建（真实值） | 库构建（留插值） |
 * | --- | --- | --- |
 * | `directivePrefix` | `wx` | `${directivePrefix}` |
 * | `eventListConvert(list)` | `bind:tap="tapEvent"` | `${eventListConvert(["tap"])}` |
 * | `fileExtname.*` | `.wxml` 等 | `${fileExtname.*}`（在 LibraryBuildPlatform） |
 *
 * `templateInterpolation` 不需要覆盖：分隔符是 `${}`，和 wxml 自己的 `{{ }}` 不撞，
 * 库模板里的 `{{hasLoad}}` 就是普通静态文本，主构建渲染时原样进出。
 * 于是同一份库产物能通吃 wx / zfb / bd / qq。
 */
export class LibraryTransform extends WxTransformLike {
  directivePrefix = '${directivePrefix}';

  override eventListConvert = (list: string[]) => {
    const args = list.map((name) => JSON.stringify(name)).join(', ');
    return `\${eventListConvert([${args}])}`;
  };
}
