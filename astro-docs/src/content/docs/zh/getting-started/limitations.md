---
title: '不支持与受限的能力'
---

这一页列的是「在浏览器里能跑、在这里不行」的部分。构建期能拦下来的都会直接报错，
拦不下来的会静默失效——后者都列在下面。

## 没有 DOM

小程序逻辑层拿不到 DOM。构建器会装一个只有 `head` 一个属性的 `Document` 占位物
（Angular 22 建组件时会无条件读它），所以不会一上来就 `NG0210`，但**任何真的用到
DOM 的代码都会炸**：

```ts
document.querySelector('.x');        // ✗
document.createElement('view');      // ✗
window.addEventListener('resize', …) // ✗
new MutationObserver(…)              // ✗
```

替代方案：

| 想做的事 | 用什么 |
| --- | --- |
| 读元素尺寸 / 位置 | `ElementRef` + `AgentNode.find()`，见 [节点查询](../../runtime/node-query/) |
| 监听滚动、交叉、可视区 | `MpApiService.createIntersectionObserver()` |
| 监听窗口尺寸 | `wx.onWindowResize` / `MpApiService` |
| 动态改样式 | `[style]` / `[class]` 绑定，或 `Renderer2.setStyle()` |

`Renderer2` 是完整可用的——它被换成了小程序实现，`addClass` / `setStyle` /
`setProperty` / `listen` 都会正确落到渲染层。`ElementRef.nativeElement` 拿到的
不是 `HTMLElement`，而是框架的 `AgentNode`。

## 模板里不支持的语法

| 语法 | 状态 |
| --- | --- |
| `@defer`（含 `@placeholder` / `@loading` / `@error`） | 构建期直接报错，请改用 `@if` |
| `@content` | 构建期直接报错 |
| `@if` / `@else` / `@for` / `@switch` / `@let` | 正常支持 |
| `*ngIf` / `*ngFor` / `*ngSwitch` | 正常支持 |
| `ng-content select="…"` | 只认 `[slot="名字"]` 一种写法，见 [内容投影](../../template/content-projection/) |
| `(catch:tap)` 这类带冒号的事件名 | Angular 会把 `catch` 当全局事件目标，编译期报错，见 [事件修饰符](../../template/event/) |

## 模板不做类型检查

小程序构建走的是 vite + AOT 的 emit 路径，**不跑 Angular 的模板类型检查**——
它也没法跑：`view` / `text` / `checkbox` 这些标签在 Angular 眼里全是未知元素，
真查起来满屏 NG8001。

后果是构建期拿不到这些报错：

- 未知元素、未知属性绑定不报错（原生组件标签因此不需要 `NO_ERRORS_SCHEMA`）
- 组件 `@Input` 名字写错也不报错，会被当成普通 property 下发，运行时静默无效
- `strictTemplates: true` 在这条链路上不产生任何诊断

但 **IDE 的 Angular 语言服务照查**。不想满屏波浪线就给用到原生标签的组件加
`NO_ERRORS_SCHEMA`，代价是那个组件的模板在编辑器里也不再检查。两者取一个。

## 事件

- 只有小程序的事件名有意义。`keyup` / `keydown` / `mousemove` 这类 DOM 事件不存在，
  Angular 的按键修饰符 `(keyup.enter)` 也没有承载它的宿主
- `preventDefault` / `stopPropagation` 在事件对象上不存在，用 `.stop` 修饰符代替
- 自定义组件的 `@Output` 不过渲染层，在它上面写 `.stop` 不报错但也不拦任何东西

## 没有的东西

小程序平台本身没有对应概念，构建器不会去模拟：

- **路由**：`@angular/router` 用不上。页面跳转走 `wx.navigateTo` /
  `MpApiService.navigateTo()`，参数走 url query 或 `EventChannel`
- **`@angular/animations`**：动画走 wxss / `animation` 组件属性
- **Service Worker / PWA**、**Web Worker**
- **SSR / 水合**
- **`ViewEncapsulation`**：声明被忽略。组件样式各自产出一份 wxss，隔离规则由小程序
  自己定（自定义组件默认隔离，页面不隔离）
- **`@angular/platform-browser` 的 DOM 工具**（`BrowserDomAdapter`、`DomRendererFactory2` 等）

另外两处「换个入口」的：

- `@angular/forms` 不能直接用，改用 `angular-miniprogram/forms` → [表单](../../runtime/forms/)
- `HttpClient` 默认已经是 `wx.request()` 后端。`provideHttpClient(withFetch())` /
  `withXhr()` 会把它换回浏览器实现，装配时不报错，第一个请求才在运行时撞
  `fetch is not a function` → [HTTP 请求](../../runtime/http/)

## 平台差异

不是所有平台都支持所有能力。构建器会在配置层面拦住：

| 能力 | 支持情况 |
| --- | --- |
| 分包 | 支付宝系、百度等支持；配了但平台不支持会直接报错 |
| 独立分包 | 部分平台不支持，`independent: true` 会被拦 |
| 自定义 tabBar | 只有微信系（`custom-tab-bar`）和支付宝（`customize-tab-bar`） |
| 渲染层脚本 | 各家标签名与扩展名不同（`wxs`/`sjs`/`import-sjs`、`.wxs`/`.sjs`/`.qs`/`.jds`），构建期自动转译，作者只写微信写法 |
| `darkmode` | 平台字段名不统一，构建器按平台改写 |

完整平台列表见 [多平台与条件编译](../../guide/platforms/)。
