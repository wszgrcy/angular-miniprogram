---
title: '事件修饰符'
---

小程序的事件绑定分四种：`bind:` / `catch:` / `capture-bind:` / `capture-catch:`（后两个是捕获阶段，`catch` 版本还会阻止继续传播）。Angular 模板没有对应的语法，构建时会将**事件名后面的修饰符**翻译成对应前缀。

| 模板写法                 | wxml 产物                    |
| ------------------------ | ---------------------------- |
| `(tap)="f"`              | `bind:tap="f"`               |
| `(tap.stop)="f"`         | `catch:tap="f"`              |
| `(tap.prevent)="f"`      | `catch:tap="f"`              |
| `(tap.capture)="f"`      | `capture-bind:tap="f"`       |
| `(tap.stop.capture)="f"` | `capture-catch:tap="f"`      |
| `(tap.once)="f"`         | `bind:tap="f"`（仅触发一次） |
| `(click)="f"`            | `bind:tap="f"`               |

```html
<view (tap.stop)="onTap($event)">点我，不往上冒</view>
```

```html
<!-- 产物 -->
<view catch:tap="catchEvent" data-node-index="0">点我，不往上冒</view>
```

## 规则

- 修饰符写在事件名**后面**，用 `.` 分隔，顺序无关：`tap.stop.capture` 与 `tap.capture.stop` 等价。
- `stop` 与 `prevent` 等价，均编译为 `catch:`。小程序的 `catch` 本身同时表示「阻止冒泡」与「阻止默认行为」，无需再拆分为两个修饰符。
- 仅已识别的修饰符会被处理。`keyup.enter` 中的 `enter` 属于 Angular 自身的按键修饰符，未识别的部分原样保留，不会被移除。
- `once` 不参与前缀翻译（小程序没有一次性绑定属性），由监听器自行处理：首次触发后移除已注册的监听。
- 小程序不存在 `click` 事件，非自定义组件上的 `(click)` 一律按 `tap` 处理。自定义组件（以及声明了同名 `@Output` 的指令）上的 `click` 属于其自身输出，保持不变。

## 等价的旧写法

将前缀直接拼接在事件名上同样可用，这是引入修饰符之前的写法，目前仍然有效：

| 旧写法                   | 等价修饰符               |
| ------------------------ | ------------------------ |
| `(catchtap)="f"`         | `(tap.stop)="f"`         |
| `(mut-bindtap)="f"`      | ——                       |
| `(capture-bindtap)="f"`  | `(tap.capture)="f"`      |
| `(capture-catchtap)="f"` | `(tap.stop.capture)="f"` |

## 事件名按平台翻译

事件**名**本身在各平台之间存在差异，开发者统一按微信形态书写，由编译期翻译。目前仅支付宝与微信存在差异。

多数差异仅为断词不同（`touchstart` → `onTouchStart`），另有若干事件词根与语义均不同，无法由名称推断：

| 微信                              | 支付宝                                |          |
| --------------------------------- | ------------------------------------- | -------- |
| `longpress` / `longtap`           | `onLongTap`                           | 词根不同 |
| `waiting`                         | `onLoading`                           | 语义不同 |
| `animationfinish`                 | `onAnimationEnd`                      | 语义不同 |
| `loadedmetadata`                  | `onRenderStart`                       | 语义不同 |
| `scrolltoupper` / `scrolltolower` | `onScrollToUpper` / `onScrollToLower` | 断词     |
| `timeupdate`                      | `onTimeUpdate`                        | 断词     |
| `regionchange`                    | `onRegionChange`                      | 断词     |
| `chooseavatar`                    | `onChooseAvatar`                      | 断词     |

全部映射见 `src/builder/platform/zfb/zfb-event-name.ts`。单词事件（`tap` `input` `change` `blur` `focus` `confirm` `submit` `load` `error`）两边同名，不受影响。

旧写法（直接在模板中书写支付宝的驼峰事件名，如 `(touchStart)`）仍然有效，两种写法均被支持。

## 只在原生组件上生效

修饰符会被翻译为 wxml 的绑定前缀，因此只对**确实产生 wxml 事件**的绑定有意义：原生小程序组件（`view` / `button` / `scroll-view` …）以及原生组件透出的自定义事件。

Angular 自身的 `@Output` 不经过 wxml（父组件直接订阅子组件的 EventEmitter），因此在自定义组件上书写 `(someOutput.stop)` 不会报错，但也不会拦截任何行为——小程序的 `catch` 拦截的是视图层的事件传播，而该传播在此路径上并不存在。

## 不支持 `(catch:tap)` 写法

Angular 会将冒号前的部分解析为**全局事件目标**（仅接受 `window` / `document` / `body`），编译期直接报错：

```
Unexpected global target 'catch' defined for 'tap' event.
```

因此小程序的事件前缀只能通过修饰符表达，或使用上文列出的旧写法。
