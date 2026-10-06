---
title: '使用原生自定义组件'
---

第三方小程序组件库（如 vant-weapp）不是 Angular 组件，而是一组
`wxml / wxss / js / json` 文件。`nativeComponentsDir` 用于接入这类组件，模板中直接
书写其标签名即可。

## 1. 目录约定

当 `<nativeComponentsDir>/<目录名>/<目录名>.json` 存在时，该目录被识别为一个原生组件，
**标签名即目录名**。

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
  "nativeComponentsDir": "src/wxcomponents",
}
```

构建时整个目录被原样拷贝到产物根目录（`src/wxcomponents` → `wxcomponents`，不带
`src/` 前缀），目录结构不变，供 `usingComponents` 引用。

## 3. 在模板中使用

```ts
@Component({
  standalone: true,
  template: `<van-button
    type="primary"
    loading="{{ busy() }}"
    (bindclick)="(submit)"
    >提交</van-button
  >`,
})
export class CheckoutComponent {
  busy = signal(false);
  submit() {}
}
```

构建后该页面的 `.json` 中自动生成：

```json
{
  "usingComponents": {
    "van-button": "../../wxcomponents/van-button/van-button"
  }
}
```

相对路径由构建器根据该页面在产物中的位置计算，无需手写。

## 4. 拼写错误不会中断构建

小程序构建不执行 Angular 的模板类型检查（见
[不支持与受限的能力](../../getting-started/limitations/)），因此
`<van-buton>`、`typ="primary"` 这类拼写错误**不会导致构建失败**，仅表现为组件未渲染或
属性未生效。原生组件的标签名与属性名没有类型约束，需要对照组件文档，并在开发者工具中
确认渲染结果。

将使用原生组件的模板集中在少数组件内，有助于缩小排查范围。

## 5. 事件与属性

原生组件的属性遵循小程序规范，不经过 Angular 的 `@Input`：

| 场景               | 写法                                                |
| ------------------ | --------------------------------------------------- |
| 静态属性           | `type="primary"`                                    |
| 动态属性           | `[loading]="loading()"`（编译为 `loading="{{…}}"`） |
| 监听小程序标准事件 | `(tap)="onTap()"`、`(change)="onChange()"`          |
| 监听组件自定义事件 | 直接使用事件名：`(confirm)="onConfirm()"`           |

两点需要注意：

- `(click)` 会被归一化为 `tap`（小程序没有 `click` 事件）。组件通过
  `triggerEvent('click')` 抛出的事件，需使用 `(bindclick)="f()"` 接收
- 事件对象为 `WechatMiniprogram.BaseEvent`，业务数据位于 `detail` 中

## 6. 使用限制

- **原生组件内不能再嵌套 Angular 组件。** 原生组件运行在小程序自身的组件树中，无法访问
  Angular 的注入器，也无法接收 Angular 侧建立节点回连所需的 `nodePath`
- **原生组件不参与 Angular 的变更检测。** 属性变化需要由 Angular 侧重新绑定来驱动
- 仅扫描 wxml 中出现过的标签：模板中未书写 `<van-button>`，产物 json 中就不会包含它，
  即使目录中存在该组件
- 标签名固定取目录名。若目录名与期望的标签名不一致，需要重命名目录
