---
title: "原生配置：mpComponentOptions / mpPageOptions"
---

模板、渲染数据、事件分发都由构建器和运行时接管了，但你偶尔还是得碰原生能力——
挂个 behavior、声明组件间关系、在页面钩子里做点原生的事。口子只有一个：
在 Angular 组件类上挂一个静态字段。

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

页面用 `static mpPageOptions`。

## 1. 生效范围

`Component()` 那张配置单**不是整张都能写**。框架自己占用了几段，剩下的原样交给微信。

| 定义段 | 生效 | 说明 |
| --- | --- | --- |
| `lifetimes` | ✅ | 框架包在外面：先完成启动 / 回连，再调你那份 |
| `pageLifetimes` | ✅ | 组件即页面时 `show` / `hide` 被包装，你的那份先跑 |
| `behaviors` | ✅ | behavior 自带的 `data` / `properties` / `methods` 由微信合并，不受下面的限制 |
| `relations` | ✅ | |
| `observers` | ✅ | 只能观察到框架自己的数据（`hasLoad` 等） |
| `options` | ✅ | `multipleSlots` 由框架强制打开 |
| `methods` | ⚠️ | 组件入口不收；**组件即页面**时页面钩子（`onShow` / `onHide` / `onUnload`）落在这里，收 |
| `data` | ❌ | 这一格是框架 `setData` 的载体 |
| `properties` | ❌ | 被框架占用为回连通道 |
| `externalClasses` | ❌ | 外部样式类要父模板传，而父模板是生成的 |

用 `MpComponentOptions` 标注，写到不收的那一段 TS 当场报错：

```ts
static mpComponentOptions: MpComponentOptions = {
  properties: { title: { type: String } }, // ✗ 编译不过
};
```

- **组件即页面**（`bootstrapPage` 走 `Component()` 那条）标 `MpComponentOptions<true>`，
  额外开放 `methods`——那条路上页面钩子就落在 `methods` 里。
- 页面侧标 `MpPageOptions`，只剔 `data`，其余全收。

## 2. 为什么那几段写了没用

**没有生产者。** 组件的 wxml 是 HTML 转换出来的，只读框架自己的数据
（`nodeList` / `hasLoad` / `property.*`），不会有任何一行去引用你声明的字段。
Angular 的 `@Input` 也不走小程序 `properties`——值在 Angular 内部传，
下发靠构建器注入的 `propertyChange`。

**也没有外部入口。** 小程序组件被父模板创建时，靠 `nodePath` / `nodeIndex`
两个 property 回连到 Angular 那一侧，这两个名字是框架的。脱离 Angular 页面
就没人传 `nodePath`，`hasLoad` 恒为 `false`，
`<block wx:if="{{hasLoad}}">` 渲染出一个空盒子——所以 Angular 产出的组件
不能被原生页面当普通小程序组件引用，「让原生父级给我传属性」这条路本身不成立。

**框架也不替你合并。** 那几段在拼配置单时是整体赋值，写进去的内容不会出现在
`Component()` 里。既然本来就没有生产者，合并它们只会多开一个坑：你自己声明一个
叫 `nodePath` 的 property 就能把回连撞断，换来整块空白且不报错。
所以契约直接不收——比「收了但不生效」诚实。

## 3. 页面：`mpPageOptions`

`onLoad` / `onShow` / `onHide` / `onReady` / `onUnload` / 下拉刷新 / 触底 /
分享这些全部保留，框架包在你的那份周围：除 `onLoad`（在 Angular 实例起来之后
才调你的）以外，都是你的先跑。`data` 同样被框架占用。

```ts
export class FooPage {
  static mpPageOptions: MpPageOptions = {
    onShareAppMessage() {
      return { title: '标题' };
    },
  };
}
```
