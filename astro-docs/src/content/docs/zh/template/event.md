---
title: "事件修饰符"
---

小程序的事件绑定分四种：`bind:` / `catch:` / `capture-bind:` / `capture-catch:`（后两个是捕获阶段，`catch` 版本还会阻止继续传播）。Angular 模板里没有这套语法，构建时会把**事件名后面的修饰符**翻译成对应前缀。

| 模板写法 | wxml 产物 |
| --- | --- |
| `(tap)="f"` | `bind:tap="f"` |
| `(tap.stop)="f"` | `catch:tap="f"` |
| `(tap.prevent)="f"` | `catch:tap="f"` |
| `(tap.capture)="f"` | `capture-bind:tap="f"` |
| `(tap.stop.capture)="f"` | `capture-catch:tap="f"` |
| `(tap.once)="f"` | `bind:tap="f"`（只响一次） |
| `(click)="f"` | `bind:tap="f"` |

```html
<view (tap.stop)="onTap($event)">点我，不往上冒</view>
```

```html
<!-- 产物 -->
<view catch:tap="catchEvent" data-node-index="0">点我，不往上冒</view>
```

## 规则

- 修饰符写在事件名**后面**，用 `.` 分隔，顺序无关：`tap.stop.capture` 与 `tap.capture.stop` 等价。
- `stop` 与 `prevent` 同义，都落 `catch:`。小程序的 `catch` 本身就同时意味着「不冒泡 + 不执行默认行为」，没有再拆两个的必要。
- 只对认识的修饰符生效。`keyup.enter` 里的 `enter` 是 Angular 自己的按键修饰符，不认识就原样保留，不会被吃掉。
- `once` 不参与前缀（小程序没有「一次性绑定」这种属性），它由监听器自己收摊：首次触发后把占过的键全删掉。
- `click` 在小程序里不存在，非自定义组件上的 `(click)` 一律当 `tap`。自定义组件（以及声明了同名 `@Output` 的指令）上的 `click` 是它自己的输出，不动。

## 等价的旧写法

前缀直接拼在事件名上也能用，这是修饰符之前唯一的写法，现在仍然有效：

| 旧写法 | 等价修饰符 |
| --- | --- |
| `(catchtap)="f"` | `(tap.stop)="f"` |
| `(mut-bindtap)="f"` | —— |
| `(capture-bindtap)="f"` | `(tap.capture)="f"` |
| `(capture-catchtap)="f"` | `(tap.stop.capture)="f"` |

## 事件名也按平台翻译

事件**名**本身各家不一样，作者统一写微信形态，编译期翻译。目前只有支付宝跟微信不同。

大部分只是断词差异（`touchstart` → `onTouchStart`），表里还有几个连词根/语义都不同的，根本猜不出来：

| 微信 | 支付宝 | |
| --- | --- | --- |
| `longpress` / `longtap` | `onLongTap` | 词根不同 |
| `waiting` | `onLoading` | 语义不同 |
| `animationfinish` | `onAnimationEnd` | 语义不同 |
| `loadedmetadata` | `onRenderStart` | 语义不同 |
| `scrolltoupper` / `scrolltolower` | `onScrollToUpper` / `onScrollToLower` | 断词 |
| `timeupdate` | `onTimeUpdate` | 断词 |
| `regionchange` | `onRegionChange` | 断词 |
| `chooseavatar` | `onChooseAvatar` | 断词 |

全部映射见 `src/builder/platform/zfb/zfb-event-name.ts`。单词事件（`tap` `input` `change` `blur` `focus` `confirm` `submit` `load` `error`）两边同名，不受影响。

旧写法（直接在模板里写支付宝驼峰名，如 `(touchStart)`）仍然有效，两种写法现在都能接住。

## 只在原生组件上生效

修饰符是翻成 wxml 绑定前缀的，所以只对**真的会走 wxml 事件**的绑定有意义：原生小程序组件（`view` / `button` / `scroll-view` …）以及原生组件透出的自定义事件。

Angular 自己的 `@Output` 不过 wxml（父组件直接订阅子组件的 EventEmitter），所以在自定义组件上写 `(someOutput.stop)` 不会报错，但也不会拦住任何东西——小程序的 `catch` 拦的是视图层传播，而这条传播根本不存在于视图层。

## 为什么不能写 `(catch:tap)`

Angular 会把冒号前面那段当成**全局事件目标**（只认 `window` / `document` / `body`），于是编译期直接报错：

```
Unexpected global target 'catch' defined for 'tap' event.
```

所以小程序前缀只能走修饰符，或者上面那张旧写法表。
