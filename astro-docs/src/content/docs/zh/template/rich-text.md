---
title: '富文本 innerHTML'
---

小程序没有 `innerHTML`，对应能力由 `<rich-text nodes>` 提供。模板中照常书写 `[innerHTML]`，构建时自动改为富文本承载。

## 基本用法

```html
<div [innerHTML]="html"></div>
```

```html
<!-- 产物 -->
<view class="" style=""
  ><rich-text nodes="{{nodeList[0].property.innerHTML}}"
/></view>
```

绑定的值可以是 HTML 字符串，也可以是 `rich-text` 的 `nodes` 节点数组。

## 子节点会被丢弃

元素原有的子节点整段不输出，与浏览器中 `innerHTML` 覆盖子节点的行为一致。

```html
<div [innerHTML]="html"><span>这段不会出现</span></div>
```

## 与 wxs 下推配合使用

当 `[innerHTML]` 的表达式命中 wxs 下推时，`nodes` 直接取叶子数组，逻辑层不参与拼接：

```html
<div [innerHTML]="format.md(text)"></div>
```

```html
<!-- 产物 -->
<rich-text nodes="{{format.md(nodeList[0].property.innerHTML[0])}}" />
```

## 安全说明

`[innerHTML]` 经过 Angular 的 HTML sanitizer（`SecurityContext.HTML`），危险标签与属性在绑定前即被清除。需要绕过时仍使用 `DomSanitizer.bypassSecurityTrustHtml`。
