---
title: '样式'
---

样式的书写方式与 Angular 浏览器环境基本一致，差异在于产物形态以及若干小程序的硬性限制。

## 两条通道

| 来源                          | 产物                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| `styles` 选项（全局样式）     | `app.wxss`（文件名随平台变化，百度为 `app.css`，支付宝为 `app.acss`） |
| 组件的 `styleUrls` / `styles` | 该组件自己的 `.wxss`                                                  |

同一组件的多份样式（样式文件与内联样式）会合并为一份 wxss。SCSS / Sass / Less
照常可用，预处理器 includePaths 通过 `stylePreprocessorOptions` 配置。

## `ViewEncapsulation` 不生效

组件声明的 `encapsulation` 会被忽略——样式不经过 DOM 注入，而是各自产出一份
wxss，隔离规则由小程序平台决定：

- **自定义组件**默认隔离，父级样式无法作用其中
- **页面**的样式不隔离其自身部分，但各子组件仍各自独立

因此选择器无法命中时，原因通常位于小程序的样式隔离规则，而非 Angular。
需要跨越样式边界时，`::v-deep` 无效；正确做法是把样式写入该组件自身的样式文件，
或者在组件 json 中声明 `styleIsolation`。

`:host` 原样透传至 wxss，在自定义组件中有效。

## 标签选择器无法命中

模板中的 `div` 在 wxml 中是 `view`，`span` 同样是 `view`，`ul` / `li` 也是 `view`。
因此在样式中书写标签选择器会静默失效，构建期给出告警：

```
[样式 pages/home/home-entry.wxss] 样式里的 span 标签选择器在小程序里选不中任何元素
（模板里渲染成 view），请改用 class 选择器
```

构建器**只告警不改写**——更换选择器属于语义决策，编译器不会替开发者改变语义。

两种处理方式：

1. **改用 class 选择器**（推荐）。小程序的样式匹配以 class 为主，标签选择器
   在真机上的性能也更差
2. 使用 `tag-name-*` 辅助类。`tagNameClass: "mapped"`（默认）会为被映射改写的元素补充一个
   `tag-name-div` 形式的 class，样式中书写 `.tag-name-span { … }` 即可命中。
   详见 [构建选项](../build-options/#tagnameclass)

## `url()` 中的本地资源会被内联

wxss 无法访问本地文件，在 `url()` 中书写相对路径时，真机上不会显示任何图片。
构建器会将样式中的本地资源内联为 data URL。

绝对路径（`/static/x.png`）不受影响，小程序会从包内查找；网络图片同样不受影响。

图片数量多、体积大时，内联会显著增大包体——小程序主包存在体积上限。这类资源应
改用 CDN，或者放入 `assets` 后以绝对路径引用。

## `@import` 会被提到文件头

一份 wxss 由多份样式合并而成，`@import` 位于文件中间、`@charset` 不在首行的写法
小程序均不接受。构建器会将全部 `@import` 提前并保持原有相对顺序，
`@charset` 只保留第一条。压缩后 `@import"x"` 中缺失的空格也会被补回（支付宝不接受无空格的写法）。

## class 与 style 的运行时通道

模板中的 class / style 最终都会编译为 `class="{{nodeList[i].class}}"` 形式的绑定，
数据侧同步下发对应字段。构建器会静态判定元素是否存在 class / style 来源：

- 静态 `class="a"`、带插值的 `class="a {{x}}"`
- `[class]` `[class.x]` `[style]` `[style.x]` `[attr.class]`
- `#名字` 的查询 class
- 指令 / 组件的 host 绑定

判定为无来源时整条属性不输出，数据侧也不下发该字段——静态结构越多，产物收益越明显。

通过 `Renderer2.addClass()` / `setStyle()` 修改样式是支持的——它走动态通道，
与静态 class 分别存储，最终合并输出。
