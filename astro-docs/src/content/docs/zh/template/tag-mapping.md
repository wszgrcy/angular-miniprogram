---
title: "标签映射"
---

小程序只有 `view / text / image / button / input …` 这几个内置组件，HTML 的语义标签直接写进 wxml 属于未知标签（不报错，但也不渲染）。构建时会自动把一批 HTML 标签改名。

## 映射成 `view`

模板里照常写，产物里是 `<view>`：

| 分类 | 标签 |
| --- | --- |
| 块级 / 分区 | `div` `p` `h1`~`h6` `hgroup` `header` `footer` `main` `nav` `section` `article` `aside` `figure` `figcaption` `address` `blockquote` `details` `summary` `dialog` `fieldset` `legend` `iframe` `br` `hr` |
| 行内语义 | `span` `b` `strong` `i` `em` `u` `s` `small` `mark` `code` `pre` `kbd` `samp` `var` `sub` `sup` `cite` `q` `abbr` `dfn` `time` `del` `ins` `bdi` `bdo` `ruby` `rp` `rt` `wbr` `output` |
| 列表 | `ul` `ol` `li` `dl` `dt` `dd` `menu` |
| 表格 | `table` `caption` `col` `colgroup` `thead` `tbody` `tfoot` `tr` `th` `td` |

```html
<!-- 模板 -->
<ul class="list"><li *ngFor="let it of list">{{it}}</li></ul>
```

```html
<!-- 产物 -->
<view class="list"><view wx:for="...">{{...}}</view></view>
```

## 一对一改名

| HTML | 小程序 |
| --- | --- |
| `img` | `image` |

## 原样透传

`view` `text` `input` `textarea` `button` `form` `scroll-view` `swiper` `video` `canvas` 等小程序同名组件，以及所有自定义组件标签，都原样输出。

## 不映射的标签

下面这些在小程序里有个「名字不同、用法也完全不同」的对应物，静默换标签只会把问题藏得更深，所以保持原样输出，需要你自己写小程序标签：

| HTML | 小程序对应物 | 为什么不敢自动换 |
| --- | --- | --- |
| `a` | `navigator` | `href` 对 `url`，属性名不一样 |
| `select` / `option` / `datalist` | `picker` | 数据源、事件模型完全是另一套 |
| `source` / `track` | `audio` / `video` | 是子资源声明，不是同名元素 |
