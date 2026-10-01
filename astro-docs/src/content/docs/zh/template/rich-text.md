---
title: "富文本 innerHTML"
---

小程序没有 `innerHTML`，等价物是 `<rich-text nodes>`。模板里照常写 `[innerHTML]`，构建时自动换成富文本承载。

## 基本用法

```html
<div [innerHTML]="html"></div>
```

```html
<!-- 产物 -->
<view class="" style=""><rich-text nodes="{{nodeList[0].property.innerHTML}}"/></view>
```

绑定的值可以是 HTML 字符串，也可以是 `rich-text` 的 `nodes` 节点数组。

## 子节点会被丢弃

元素上原有的子节点整段不输出，与浏览器里 `innerHTML` 覆盖子节点的行为一致。

```html
<div [innerHTML]="html"><span>这段不会出现</span></div>
```

## 与 wxs 下推一起用

`[innerHTML]` 的表达式命中 wxs 下推时，`nodes` 直接取枝叶数组，逻辑层不参与拼接：

```html
<div [innerHTML]="format.md(text)"></div>
```

```html
<!-- 产物 -->
<rich-text nodes="{{format.md(nodeList[0].property.innerHTML[0])}}"/>
```

## 安全说明

`[innerHTML]` 走 Angular 的 HTML sanitizer（`SecurityContext.HTML`），危险标签/属性在绑定前就被清掉。需要绕过时照旧用 `DomSanitizer.bypassSecurityTrustHtml`。
