---
title: '生命周期'
---

Angular 一侧的钩子没有任何削减：`constructor` / `ngOnChanges` / `ngOnInit` /
`ngAfterContentInit` / `ngAfterViewInit` / `ngDoCheck` / `ngOnDestroy` 全部照常执行。

需要额外理解的是**它与小程序钩子的相对顺序**，以及何时才能获取到对应的实例。

## 页面

页面组件由 `onLoad` 触发创建。顺序：

```text
小程序 onLoad
  └─ 等待应用启动完成（__ngStartPagePromise）
     ├─ 创建页面组件        → constructor
     ├─ 与小程序页面实例链接
     ├─ ngOnInit / ngAfterContentInit / ngAfterViewInit
     └─ mpPageOptions.onLoad                ← 位于 Angular 之后
小程序 onShow
  ├─ mpPageOptions.onShow                   ← 声明的钩子先执行
  └─ attachView（挂载视图，开始变更检测）
小程序 onReady
  └─ mpPageOptions.onReady
```

`onHide` / `onUnload` 同样先执行声明的钩子，框架的 detach / destroy 在后。
这个顺序是刻意设计的：先 detach 会导致用户钩子中修改的状态丢失一次更新。

**只有 `onLoad` 是 Angular 先、声明的钩子后**，因为此时 Angular 实例才刚创建完成。

## 组件

自定义组件的 Angular 实例由**父组件**创建，小程序侧的 `created` / `attached` 与其
属于两条异步链路：

```text
小程序 created      ← 此时 Angular 实例通常尚未创建
  （框架在此创建 __waitLinkPromise）
Angular 侧创建组件   → constructor / ngOnInit / ngAfterContentInit
小程序 attached     ← 在此完成链接，两侧建立关联
小程序 ready
```

因此在 `mpComponentOptions.lifetimes.created` 中直接读取 `this.__ngComponentInstance`
通常得到 `undefined`，需要等待：

```ts
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';

static mpComponentOptions: MpComponentOptions = {
  lifetimes: {
    async created(this: MiniProgramComponentInstance) {
      await this.__waitLinkPromise;
      console.log(this.__ngComponentInstance); // 此时可获取
    },
  },
};
```

## 从 Angular 侧反向获取实例

```ts
import { ComponentFinderService } from 'angular-miniprogram';

const finder = inject(ComponentFinderService);

async ngAfterViewInit() {
  const mp = await finder.get(this); // Promise
  mp.createSelectorQuery() /* … */;
}
```

`get()` 会等待链接完成，因此必须 `await`，这也是它比直接读取字段更可靠的原因。
获取到的小程序实例上提供 `setData` / `createSelectorQuery` / `getPageId` 等原生能力。

## 应用级

应用级的四个钩子不书写在 `main.ts` 中，也不存在 `static mpAppOptions`，
需要通过服务订阅：

```ts
import { MpAppLifecycleService } from 'angular-miniprogram/api';

private readonly lifecycle = inject(MpAppLifecycleService);

ngOnInit() {
  this.lifecycle.appShow$.subscribe((options) => {
    // options.scene / options.path / options.query
  });
}
```

| 流                    | 对应钩子               | 载荷                                           |
| --------------------- | ---------------------- | ---------------------------------------------- |
| `appShow$`            | `onAppShow`            | 启动参数（scene / path / query / shareTicket） |
| `appHide$`            | `onAppHide`            | —                                              |
| `error$`              | `onError`              | 错误信息字符串                                 |
| `unhandledRejection$` | `onUnhandledRejection` | `{ reason }`                                   |

这些流都经过 `share()`，首次订阅时才向平台注册，多个订阅方共用同一个监听。
`onError` / `onUnhandledRejection` 在平台侧没有配对的 off 方法，首次订阅后监听常驻。

订阅方修改状态应使用 signal，或者自行 `markForCheck()`——这些流不经过模板事件包装。

## 页面显隐对组件的影响

页面 `onHide` 时框架会 detach 页面视图，`onShow` 时再 attach 回来。
组件中的 `pageLifetimes.show` / `hide` / `resize` 照常可用（在
`mpComponentOptions.pageLifetimes` 中声明）。

自定义 tabBar 会为每个 tab 页各挂载一份组件实例，选中态必须存放在外部 service 中，
见 [入口](../../guide/entry/) 的自定义 tabBar 一节。
