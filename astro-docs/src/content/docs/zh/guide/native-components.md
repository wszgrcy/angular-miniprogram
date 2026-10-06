---
title: '使用原生自定义组件'
---

第三方的小程序组件库（vant-weapp 那种）不是 Angular 组件，是一堆
`wxml / wxss / js / json`。`nativeComponentsDir` 把它们接进来，模板里直接写标签。

## 1. 目录约定

`<nativeComponentsDir>/<目录名>/<目录名>.json` 存在，就认定这是一个原生组件，
**标签名 = 目录名**。

```tree
src/wxcomponents/
└─ van-button/
   ├─ van-button.json     # { "component": true }
   ├─ van-button.wxml
   ├─ van-button.wxss
   └─ van-button.js
```

## 2. 配置

```jsonc
// angular.json -> options
{
  "platform": "wx",
  "nativeComponentsDir": "src/wxcomponents"
}
```

构建时整个目录被原样拷进产物根（`src/wxcomponents` → `wxcomponents`，
不带 `src/` 前缀），路径不变，供 `usingComponents` 指过去。

## 3. 模板里用

```ts
@Component({
  standalone: true,
  template: `<van-button type="primary" loading="{{busy()}}" (bindclick)="submit">提交</van-button>`,
})
export class CheckoutComponent {
  busy = signal(false);
  submit() {}
}
```

构建后该页的 `.json` 里自动出现：

```json
{ "usingComponents": { "van-button": "../../wxcomponents/van-button/van-button" } }
```

相对路径由构建器按该页在产物里的位置算，不用手写。

## 4. 拼错了没人告诉你

小程序构建不跑 Angular 的模板类型检查（见
[不支持与受限的能力](../../getting-started/limitations/)），所以
`<van-buton>`、`typ="primary"` 这类拼写错误**不会让构建失败**，只会表现为
组件不出现或属性没生效。原生组件的标签名和属性名没有类型兜底，靠对照文档 +
在开发者工具里看渲染结果。

把用到原生组件的模板集中放一两个组件里，比散在全项目好排查。

## 5. 事件与属性

原生组件的属性走小程序那套，不走 Angular 的 `@Input`：

| 想做的事 | 写法 |
| --- | --- |
| 传静态属性 | `type="primary"` |
| 传动态属性 | `[loading]="loading()"`（编译成 `loading="{{…}}"`） |
| 监听小程序标准事件 | `(tap)="onTap()`、`(change)="onChange()"` |
| 监听组件自定义事件 | 直接写事件名：`(confirm)="onConfirm()"` |

两个坑：

- `(click)` 会被归一成 `tap`（小程序里没有 `click` 这个事件）。组件自己
  `triggerEvent('click')` 抛的事件，用旧写法 `(bindclick)="f()"` 接
- 事件对象是 `WechatMiniprogram.BaseEvent`，`detail` 里才是业务数据

## 6. 边界

- **原生组件里不能再嵌 Angular 组件。** 它跑在小程序自己的组件树里，
  拿不到 Angular 的注入器，也没人给它传回连所需的 `nodePath`
- **原生组件不会参与 Angular 的变更检测。** 属性变了要靠 Angular 侧重新绑定驱动
- 只扫 wxml 里出现过的标签：模板里没写 `<van-button>`，产物 json 里就不会有它，
  即便目录里放了
- 标签名固定取目录名。目录名跟期望标签不一致，就把目录改成标签名
