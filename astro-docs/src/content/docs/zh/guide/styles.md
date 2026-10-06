---
title: '样式'
---

样式的写法跟 Angular 浏览器版基本一致，差别在产物形态和几条小程序硬限制。

## 两条通道

| 来源 | 产物 |
| --- | --- |
| `styles` 选项（全局样式） | `app.wxss`（文件名跟平台走，百度是 `app.css`，支付宝是 `app.acss`） |
| 组件的 `styleUrls` / `styles` | 该组件自己的 `.wxss` |

一个组件的多份样式（样式文件 + 内联样式）会拼成一份 wxss。SCSS / Sass / Less
照常可用，预处理器的 includePaths 走 `stylePreprocessorOptions`。

## `ViewEncapsulation` 不参与

组件声明的 `encapsulation` 会被忽略——样式根本不走 DOM 注入那条路，而是各产一份
wxss，隔离规则由小程序自己定：

- **自定义组件**默认隔离，父级样式进不去
- **页面**的样式不隔离子组件之外的部分，但子组件仍然各管各的

所以「这个选择器为什么选不中」的答案通常在小程序的样式隔离规则里，不在 Angular 里。
需要跨边界时用 `::v-deep` 没有意义，正确做法是把样式写进该组件自己的样式文件，
或者在组件 json 里声明 `styleIsolation`。

`:host` 原样透传进 wxss，在自定义组件里是有效的。

## 标签选择器选不中东西

模板里的 `div` 在 wxml 里是 `view`，`span` 也是 `view`，`ul`/`li` 还是 `view`。
所以样式里写标签选择器会静默失效，构建期会告警：

```
[样式 pages/home/home-entry.wxss] 样式里的 span 标签选择器在小程序里选不中任何元素
（模板里渲染成 view），请改用 class 选择器
```

构建器**只告警不改写**——换选择器是语义决策，编译器不替用户改语义。

两条出路：

1. **改用 class 选择器**（推荐）。小程序的样式匹配本来就偏向 class，标签选择器
   在真机上性能也更差
2. 用 `tag-name-*` 把手。`tagNameClass: "mapped"`（默认）会给被映射改写的元素补一个
   `tag-name-div` 的 class，样式里写 `.tag-name-span { … }` 就能选中。
   详见 [构建选项](../build-options/#tagnameclass)

## `url()` 里的本地资源会被内联

wxss 拿不到本地文件，`url()` 里写相对路径在真机上就是一张图都出不来。
构建器把样式里的本地资源内联成 data URL。

绝对地址（`/static/x.png`）不受影响，小程序自己会去包里找；网络图也不受影响。

图片很多很大的时候内联会撑爆包体——小程序主包有体积上限。这种资源走 CDN，
或者放进 `assets` 后用绝对路径引用。

## `@import` 会被提到文件头

一个 wxss 由多份样式拼接而成，`@import` 落在文件中间、`@charset` 不在首行，
小程序都不认。构建器会把 `@import` 全部提到最前并保持原有相对顺序，
`@charset` 只保留第一条。压缩后 `@import"x"` 少掉的空格也会被补回来（支付宝不认）。

## class 与 style 的运行时通道

模板里的 class / style 最终都是 `class="{{nodeList[i].class}}"` 这样的绑定，
数据侧跟着发一份。构建器现在会静态判定一个元素到底有没有 class / style 来源：

- 静态 `class="a"`、带插值的 `class="a {{x}}"`
- `[class]` `[class.x]` `[style]` `[style.x]` `[attr.class]`
- `#名字` 的查询 class
- 指令 / 组件的 host 绑定

判定为没有就整条属性不输出，数据侧也不发这个字段——模板里静态结构越多，省得越多。

用 `Renderer2.addClass()` / `setStyle()` 改样式是支持的——它走动态那半通道，
跟静态 class 各自存自己的，最后拼一次。
