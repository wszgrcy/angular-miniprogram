---
title: '节点查询'
---

没有 DOM，也就没有 `querySelector`。要量尺寸、看位置、观察可视区，走小程序的
`createSelectorQuery` / `createIntersectionObserver`，框架给它们包了一层顺手的壳。

## 量一个元素

模板上给元素一个引用名，TS 侧用 `viewChild` 拿 `ElementRef`，`nativeElement` 就是
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

`find()` → 字段方法 → `exec()`，全链路就这三步。

## 只有写了 `#` 的元素能查

`find()` 靠一个编译期发下来的「可查询 class」（形如 `__ar-4-1-0`），
**只有模板上写了 `#名字` 的元素才有**。没写 `#` 的节点压根没发这个 class，
`find()` 直接返回 `null`。

这个 class 取自节点路径，所以：

- **结构一变就作废。** `@for` 插一行，后面所有节点整体位移。每次都要现调 `find()`，
  不要把 class 字符串存下来复用
- `@for` 里的多个实例天然不撞——视图序号就在路径里
- text 节点、comment 节点（`ng-container` 的锚点）查不到，wxml 里没有对应元素

## 量 `@for` 里的每一行

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

`find()` 的作用域自动落在**渲染这个元素的那个小程序实例**上（子组件的 host 元素
属于父模板，那时是父实例），一般不用管。

要显式在某个子组件范围内查，先拿到它的小程序实例：

```ts
const mp = await this.finder.get(childInstance);
this.api.createSelectorQuery(mp).select('.target').boundingClientRect().exec();
```

## `MpApiService` 的查询接口

`angular-miniprogram/api` 里的版本把回调改成了 Promise / Observable：

```ts
import { MpApiService } from 'angular-miniprogram/api';

private readonly api = inject(MpApiService);

async ngAfterViewInit() {
  const rects = await this.api.createSelectorQuery().select('.box').boundingClientRect().exec();
  // rects: MpNodeInfo[]，与 select 的顺序一致
}
```

`select` / `selectAll` / `selectViewport` / `in(component)` / `boundingClientRect` /
`scrollOffset` / `scrollSize` / `fields` 全部保留链式调用，`.raw` 能拿到原生
`SelectorQuery` 当逃生舱。

交叉观察器订阅即 `observe`，退订即 `disconnect`：

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

媒体查询观察器（各家没有原生 API，由 JS 求值 + `onWindowResize` 驱动）：

```ts
this.api
  .createMediaQueryObserver()
  .observe$({ orientation: 'landscape' })
  .subscribe((res) => this.isLandscape.set(res.matches));
```

`observe` 会先以当前匹配结果触发一次，之后只在匹配状态变化时触发。
