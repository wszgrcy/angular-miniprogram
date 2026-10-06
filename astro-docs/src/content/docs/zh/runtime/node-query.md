---
title: '节点查询'
---

小程序环境没有 DOM，也不提供 `querySelector`。测量尺寸、获取位置、观察可视区需要使用
小程序的 `createSelectorQuery` / `createIntersectionObserver`，框架对其做了一层封装。

## 测量单个元素

模板上给元素一个引用名，TS 侧用 `viewChild` 获取 `ElementRef`，`nativeElement` 即
框架的 `AgentNode`：

```ts
import { Component, ElementRef, viewChild } from '@angular/core';
import { AgentNode } from 'angular-miniprogram';

@Component({
  standalone: true,
  template: `<view #box>内容</view><button (tap)="measure()">量一下</button>`,
})
export class BoxComponent {
  readonly box = viewChild<ElementRef<AgentNode>>('box');

  measure() {
    const ref = this.box()?.nativeElement.find();
    if (!ref) {
      return; // 节点不存在 / 还没序列化
    }
    ref
      .boundingClientRect((rect) => console.log(rect.width, rect.height))
      .exec();
  }
}
```

`find()` → 字段方法 → `exec()`，完整链路只有这三步。

## 可查询元素的范围

`find()` 依赖编译期下发的可查询 class（形如 `__ar-4-1-0`），
**只有模板中声明了 `#名字` 的元素才具备该 class**。未书写 `#` 的节点不会下发该 class，
`find()` 直接返回 `null`。

该 class 取自节点路径，因此：

- **模板结构变化后立即失效。** `@for` 插入一行会导致其后所有节点整体位移。每次都需要
  重新调用 `find()`，不应缓存 class 字符串复用
- `@for` 中的多个实例不会冲突，视图序号包含在路径中
- text 节点、comment 节点（`ng-container` 的锚点）无法查询，wxml 中没有对应元素

## 测量 `@for` 中的每一行

```ts
readonly rows = viewChildren<ElementRef<AgentNode>>('row');

measureAll() {
  const nodes = this.rows().map((r) => r.nativeElement);
  Promise.all(nodes.map((n) => this.rectOf(n)));
}
```

```html
@for (item of list(); track item.id) {
<view #row>{{ item.name }}</view>
}
```

## 组件内查询

`find()` 的作用域自动定位到**渲染该元素的小程序实例**上（子组件的 host 元素
属于父模板，此时为父实例），通常无需干预。

若需要显式限定在某个子组件范围内查询，需要先获取该组件的小程序实例：

```ts
const mp = await this.finder.get(childInstance);
this.api.createSelectorQuery(mp).select('.target').boundingClientRect().exec();
```

## `MpApiService` 的查询接口

`angular-miniprogram/api` 中的封装将回调改为 Promise / Observable：

```ts
import { MpApiService } from 'angular-miniprogram/api';

private readonly api = inject(MpApiService);

async ngAfterViewInit() {
  const rects = await this.api.createSelectorQuery().select('.box').boundingClientRect().exec();
  // rects: MpNodeInfo[]，与 select 的顺序一致
}
```

`select` / `selectAll` / `selectViewport` / `in(component)` / `boundingClientRect` /
`scrollOffset` / `scrollSize` / `fields` 均保留链式调用；通过 `.raw` 可以获取原生
`SelectorQuery` 作为兜底手段。

交叉观察器的订阅方法为 `observe`，取消订阅方法为 `disconnect`：

```ts
this.api
  .createIntersectionObserver()
  .relativeToViewport({ bottom: 200 })
  .observe$('.lazy-item')
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe((res) => {
    if (res.intersectionRatio > 0) {
      this.loadMore();
    }
  });
```

媒体查询观察器（各平台均无原生 API，由 JS 求值并依赖 `onWindowResize` 驱动）：

```ts
this.api
  .createMediaQueryObserver()
  .observe$({ orientation: 'landscape' })
  .subscribe((res) => this.isLandscape.set(res.matches));
```

`observe` 会先以当前匹配结果触发一次，之后只在匹配状态变化时触发。
