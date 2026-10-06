---
title: '内容投影'
---

`ng-content` 编译成小程序的 `<slot>`。因为渲染层是静态生成的，投影规则比浏览器版
Angular 紧一些。

## 默认插槽

```html
<!-- 子组件 -->
<div class="card">
  <ng-content></ng-content>
</div>
```

```html
<!-- 父组件 -->
<app-card>随便放点什么</app-card>
```

## 具名插槽：只认 `[slot="名字"]`

Angular 的 `select` 支持任意 CSS 选择器，这里**只支持 `[slot="名字"]` 一种形式**，
其它写法构建期直接报错：

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

按属性、按 class 挑选内容这类需求，改成「一个属性一个插槽」来表达。

## 兜底内容

`ng-content` 里写的内容就是兜底，只在父级没往这个插槽投影时渲染：

```html
<ng-content select="[slot='head']">
  <view class="fallback">没传标题</view>
</ng-content>
```

产物是「兜底模板 + 二选一」：

```html
<block wx:if="{{nodeList[1].length}}">
  <template is="projectionFallback_1" data="{{...nodeList[1][0] }}"></template>
</block>
<block wx:else><slot name="head"></slot></block>
```

判据是兜底容器有没有视图——Angular 只在插槽空着时创建那一份，所以最多一份。

**兜底内容写在子组件的模板里，样式也得在子组件的样式文件里。** 小程序自定义组件
默认样式隔离，父级的样式选不中兜底那段；反过来，投影进来的那部分归宿主的样式管。

## 一个文件里放多个组件

投影 demo 常见的摆法是一个文件放「子组件 + 几个宿主」。产物按「文件名-组件名」拆，
每个组件各出一份 wxml/wxss/js：

```text
src/pages/home/projection/projection.components.ts
  → pages/home/projection/projection.components-ProjChildComponent.wxml
  → pages/home/projection/projection.components-ProjDefaultComponent.wxml
  …
```

入口名仍由文件名推导，`usingComponents` 里引的是宿主组件那一份。文件被入口认领时的
边界见 [入口](../../guide/entry/)。
