---
title: '标签映射'
---

小程序的内置组件只有 `view / text / image / button / input …`，将 HTML 的语义标签直接写进 wxml 属于未知标签（不报错，但也不会渲染）。构建时会自动重命名一批 HTML 标签。

## 映射成 `view`

模板中照常书写，产物中为 `<view>`：

| 分类        | 标签                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 块级 / 分区 | `div` `p` `h1`~`h6` `hgroup` `header` `footer` `main` `nav` `section` `article` `aside` `figure` `figcaption` `address` `blockquote` `details` `summary` `dialog` `fieldset` `legend` `iframe` `br` `hr` |
| 行内语义    | `span` `b` `strong` `i` `em` `u` `s` `small` `mark` `code` `pre` `kbd` `samp` `var` `sub` `sup` `cite` `q` `abbr` `dfn` `time` `del` `ins` `bdi` `bdo` `ruby` `rp` `rt` `wbr` `output`                   |
| 列表        | `ul` `ol` `li` `dl` `dt` `dd` `menu`                                                                                                                                                                     |
| 表格        | `table` `caption` `col` `colgroup` `thead` `tbody` `tfoot` `tr` `th` `td`                                                                                                                                |

```html
<!-- 模板 -->
<ul class="list">
  <li *ngFor="let it of list">{{it}}</li>
</ul>
```

```html
<!-- 产物 -->
<view class="list"><view wx:for="...">{{...}}</view></view>
```

## 一对一改名

| HTML  | 小程序  |
| ----- | ------- |
| `img` | `image` |

## 原样透传

`view` `text` `input` `textarea` `button` `form` `scroll-view` `swiper` `video` `canvas` 等小程序同名组件，以及所有自定义组件标签，都原样输出。

## 不映射的标签

下列标签在小程序中的对应物名称与用法均不相同，静默替换标签会掩盖问题，因此保持原样输出，需要开发者自行书写小程序标签：

| HTML                             | 小程序对应物      | 不做自动替换的原因            |
| -------------------------------- | ----------------- | ----------------------------- |
| `a`                              | `navigator`       | `href` 对 `url`，属性名不一样 |
| `select` / `option` / `datalist` | `picker`          | 数据源、事件模型完全是另一套  |
| `source` / `track`               | `audio` / `video` | 是子资源声明，不是同名元素    |
