---
title: '内容投影'
---

`ng-content` 编译为小程序的 `<slot>`。由于渲染层在构建期静态生成，投影规则比浏览器环境的
Angular 更严格。

## 默认插槽

```html
<!-- 子组件 -->
<div class="card">
  <ng-content></ng-content>
</div>
```

```html
<!-- 父组件 -->
<app-card>任意内容</app-card>
```

## 具名插槽：仅支持 `[slot="名字"]`

Angular 的 `ng-content` 的 `select` 支持任意 CSS 选择器，本构建器**只支持
`[slot="名字"]` 一种形式**，其它写法在构建期直接报错：

```
ng-content未匹配到指定格式的select,value:.header,需要格式为[slot="xxxx"]
```

```html
<!-- 子组件 -->
<ng-content select="[slot='head']"></ng-content>
<ng-content select="[slot='body']"></ng-content>
```

```html
<!-- 父组件：用 slot 属性对应 -->
<app-panel>
  <view slot="head">标题</view>
  <view slot="body">正文</view>
</app-panel>
```

需要按属性或 class 分流内容时，改为为每个插槽定义独立的名称。

## 兜底内容

`ng-content` 标签内的内容即兜底内容，仅在父组件未向该插槽投影内容时渲染：

```html
<ng-content select="[slot='head']">
  <view class="fallback">没传标题</view>
</ng-content>
```

产物为「兜底模板 + 条件渲染」：

```html
<block wx:if="{{nodeList[1].length}}">
  <template is="projectionFallback_1" data="{{...nodeList[1][0] }}"></template>
</block>
<block wx:else><slot name="head"></slot></block>
```

判定依据是兜底容器是否存在视图。Angular 仅在插槽为空时创建兜底内容，因此产物中最多
出现一份。

**兜底内容定义在子组件的模板中，其样式也必须写在子组件的样式文件里。** 小程序自定义
组件默认开启样式隔离，父组件的样式无法作用于兜底内容；反之，投影进来的内容由宿主组件
的样式负责。
