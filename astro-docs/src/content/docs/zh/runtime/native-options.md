---
title: '原生配置：mpComponentOptions / mpPageOptions'
---

模板、渲染数据、事件分发均由构建器和运行时接管。当需要访问原生能力（挂载 behavior、
声明组件间关系、在页面钩子中执行原生逻辑）时，入口只有一个：在 Angular 组件类上
声明一个静态字段。

```ts
import { MpComponentOptions } from 'angular-miniprogram/platform/type';

@Component({ selector: 'app-foo', templateUrl: './foo.html', standalone: true })
export class FooComponent {
  static mpComponentOptions: MpComponentOptions = {
    behaviors: [someBehavior],
    relations: { '../x/x': { type: 'child' } },
    lifetimes: {
      attached() {
        /* this 就是小程序组件实例 */
      },
    },
  };
}
```

页面用 `static mpPageOptions`，见下文。

钩子与 Angular 生命周期的相对顺序见 [生命周期](../lifecycle/)。

## 1. 生效范围

`Component()` 的配置项**并非全部可用**。框架占用了其中几段，其余原样传递给小程序平台。

| 定义段            | 生效 | 说明                                                                                           |
| ----------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `lifetimes`       | ✅   | 由框架包装：先完成启动 / 回连，再调用声明的钩子                                                |
| `pageLifetimes`   | ✅   | 组件即页面时 `show` / `hide` 被包装，声明的钩子先执行                                          |
| `behaviors`       | ✅   | behavior 自带的 `data` / `properties` / `methods` 由平台合并，不受下面的限制                   |
| `relations`       | ✅   |                                                                                                |
| `observers`       | ✅   | 只能观察框架自身的数据（`hasLoad` 等）                                                         |
| `options`         | ✅   | `multipleSlots` 由框架强制开启                                                                 |
| `methods`         | ⚠️   | 组件入口不接受该段；**组件即页面**时页面钩子（`onShow` / `onHide` / `onUnload`）位于此处，接受 |
| `data`            | ❌   | 该段是框架 `setData` 的载体                                                                    |
| `properties`      | ❌   | 被框架占用为回连通道                                                                           |
| `externalClasses` | ❌   | 外部样式类需要父模板传入，而父模板由构建器生成                                                 |

使用 `MpComponentOptions` 标注后，写入不接受的段会直接产生类型错误：

```ts
static mpComponentOptions: MpComponentOptions = {
  properties: { title: { type: String } }, // ✗ 编译不过
};
```

- **组件即页面**（`bootstrapPage` 走 `Component()` 分支）应标注 `MpComponentOptions<true>`，
  额外开放 `methods`——该分支下页面钩子位于 `methods` 中。
- 页面侧标注 `MpPageOptions`，仅排除 `data`，其余段均接受。

## 2. 被排除的配置段

组件的 wxml 由 HTML 转换而来，只读取框架自身的数据（`nodeList` / `hasLoad` /
`property.*`），不会引用开发者声明的字段。Angular 的 `@Input` 也不经过小程序
`properties`——值在 Angular 内部传递，下发依赖构建器注入的 `propertyChange`。

`properties` 段同时承担 Angular 实例与小程序实例之间的**回连通道**，`nodePath` /
`nodeIndex` 两个 property 属于框架。声明同名 property 会中断回连，表现为整块空白且
不报错，因此这几段直接不接受，而不是接受后不生效。

推论：Angular 产出的组件**不能被原生页面作为普通小程序组件引用**。脱离 Angular 页面后
没有来源传入 `nodePath`，`hasLoad` 恒为 `false`，`<block wx:if="{{hasLoad}}">` 只会
渲染出一个空容器。

## 3. 页面：`mpPageOptions`

`onLoad` / `onShow` / `onHide` / `onReady` / `onUnload` / 下拉刷新 / 触底 /
分享这些全部保留，仅排除 `data`。执行顺序上的差异见 [生命周期](../lifecycle/)。

```ts
import { MpPageOptions } from 'angular-miniprogram/platform/type';

export class FooPage {
  static mpPageOptions: MpPageOptions = {
    onShareAppMessage() {
      return { title: '标题' };
    },
  };
}
```
