---
title: '不支持与受限的能力'
---

本页列出在浏览器环境可用、在本框架中不可用的能力。构建期能够拦截的问题会直接报错，
无法拦截的会静默失效——后者列在下文。

## 没有 DOM

小程序逻辑层无法访问 DOM。构建器会注入一个仅含 `head` 属性的 `Document` 占位实现
（Angular 22 创建组件时会无条件读取），因此不会立即触发 `NG0210`，但**任何实际使用
DOM 的代码都会报错**：

```ts
document.querySelector('.x');        // ✗
document.createElement('view');      // ✗
window.addEventListener('resize', …) // ✗
new MutationObserver(…)              // ✗
```

替代方案：

| 目标                   | 替代方案                                                                    |
| ---------------------- | --------------------------------------------------------------------------- |
| 读元素尺寸 / 位置      | `ElementRef` + `AgentNode.find()`，见 [节点查询](../../runtime/node-query/) |
| 监听滚动、交叉、可视区 | `MpApiService.createIntersectionObserver()`                                 |
| 监听窗口尺寸           | `wx.onWindowResize` / `MpApiService`                                        |
| 动态改样式             | `[style]` / `[class]` 绑定，或 `Renderer2.setStyle()`                       |

`Renderer2` 完整可用——其实现已替换为小程序版本，`addClass` / `setStyle` /
`setProperty` / `listen` 都会正确作用于渲染层。`ElementRef.nativeElement` 返回的不是
`HTMLElement`，而是框架的 `AgentNode`。

## 模板中不支持的语法

| 语法                                                  | 状态                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `@defer`（含 `@placeholder` / `@loading` / `@error`） | 构建期直接报错，请改用 `@if`                                                                |
| `@content`                                            | 构建期直接报错                                                                              |
| `@if` / `@else` / `@for` / `@switch` / `@let`         | 正常支持                                                                                    |
| `*ngIf` / `*ngFor` / `*ngSwitch`                      | 正常支持                                                                                    |
| `ng-content select="…"`                               | 只认 `[slot="名字"]` 一种写法，见 [内容投影](../../template/content-projection/)            |
| 形如 `(catch:tap)` 的带冒号事件名                     | Angular 会将 `catch` 解析为全局事件目标，编译期报错，见 [事件修饰符](../../template/event/) |

## 模板不做类型检查

小程序构建走的是 vite + AOT 的 emit 路径，**不执行 Angular 的模板类型检查**——
该检查在此链路上也无法启用：`view` / `text` / `checkbox` 这些标签在 Angular 看来都是
未知元素，启用后会产生大量 NG8001。

因此构建期不会报出以下问题：

- 未知元素、未知属性绑定不会报错（原生组件标签因此无需 `NO_ERRORS_SCHEMA`）
- 组件 `@Input` 名称书写错误同样不报错，会被当作普通 property 下发，运行时静默无效
- `strictTemplates: true` 在这条链路上不产生任何诊断

但 **IDE 的 Angular 语言服务仍会检查**。若不希望出现大量提示，可为使用原生标签的组件
添加 `NO_ERRORS_SCHEMA`，代价是该组件的模板在编辑器中也不再检查。两者需要取舍。

## 事件

- 只有小程序的事件名有意义。`keyup` / `keydown` / `mousemove` 等 DOM 事件不存在，
  Angular 的按键修饰符 `(keyup.enter)` 也没有可承载的宿主
- `preventDefault` / `stopPropagation` 在事件对象上不存在，用 `.stop` 修饰符代替
- 自定义组件的 `@Output` 不经过渲染层，在其上书写 `.stop` 不会报错，但也不会拦截任何行为

## 不支持的能力

小程序平台本身没有对应概念，构建器不会进行模拟：

- **路由**：`@angular/router` 不适用。页面跳转使用 `wx.navigateTo` /
  `MpApiService.navigateTo()`，参数通过 url query 或 `EventChannel` 传递
- **`@angular/animations`**：动画通过 wxss 或 `animation` 组件属性实现
- **`@angular/animations`**：动画走 wxss / `animation` 组件属性
- **Service Worker / PWA**、**Web Worker**
- **SSR / 水合**
- **`ViewEncapsulation`**：声明被忽略。组件样式各自产出一份 wxss，隔离规则由小程序
  平台决定（自定义组件默认隔离，页面不隔离）
- **`@angular/platform-browser` 的 DOM 工具**（`BrowserDomAdapter`、`DomRendererFactory2` 等）

另有两处需要更换入口：

- `@angular/forms` 不能直接使用，改用 `angular-miniprogram/forms` → [表单](../../runtime/forms/)
- `HttpClient` 默认已使用 `wx.request()` 后端。`provideHttpClient(withFetch())` /
  `withXhr()` 会将其替换为浏览器实现，装配时不报错，首个请求才在运行时抛
  `fetch is not a function` → [HTTP 请求](../../runtime/http/)

## 平台差异

并非所有平台都支持全部能力。构建器会在配置层面拦截：

| 能力          | 支持情况                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 分包          | 支付宝系、百度等支持；平台不支持时配置会直接报错                                                                         |
| 独立分包      | 部分平台不支持，`independent: true` 会被拦                                                                               |
| 自定义 tabBar | 仅微信系（`custom-tab-bar`）与支付宝（`customize-tab-bar`）                                                              |
| 渲染层脚本    | 各平台标签名与扩展名不同（`wxs`/`sjs`/`import-sjs`、`.wxs`/`.sjs`/`.qs`/`.jds`），构建期自动转译，开发者只需书写微信写法 |
| `darkmode`    | 平台字段名不统一，构建器按平台改写                                                                                       |

完整平台列表见 [多平台与条件编译](../../guide/platforms/)。
