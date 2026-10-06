---
title: '生命周期'
---

Angular 那一侧的钩子没有任何削减：`constructor` / `ngOnChanges` / `ngOnInit` /
`ngAfterContentInit` / `ngAfterViewInit` / `ngDoCheck` / `ngOnDestroy` 全部照常。

要额外理解的是**它和小程序钩子的相对顺序**，以及「什么时候才拿得到对面那个实例」。

## 页面

页面组件由 `onLoad` 触发创建。顺序：

```text
小程序 onLoad
  └─ 等 app 启动完成（__ngStartPagePromise）
     ├─ new 页面组件          → constructor
     ├─ 与小程序页面实例链接
     ├─ ngOnInit / ngAfterContentInit / ngAfterViewInit
     └─ 你的 static mpPageOptions.onLoad   ← 注意在 Angular 之后
小程序 onShow
  ├─ 你的 onShow                            ← 你的先跑
  └─ attachView（视图挂上，开始变更检测）
小程序 onReady
  └─ 你的 onReady
```

`onHide` / `onUnload` 也是你的那份先跑，框架的 detach / destroy 在后。
这个顺序是刻意的：先 detach 会让用户钩子里改的状态丢掉一次更新。

**只有 `onLoad` 是 Angular 先、你的后**，因为那时 Angular 实例才刚建起来。

## 组件

自定义组件的 Angular 实例由**父组件**创建，小程序侧的 `created` / `attached` 与它
是两条异步线：

```text
小程序 created      ← Angular 实例通常还没建好
  （框架在这里建 __waitLinkPromise）
Angular 侧创建组件   → constructor / ngOnInit / ngAfterContentInit
小程序 attached     ← 在这里完成链接，两边握上手
小程序 ready
```

所以在 `mpComponentOptions.lifetimes.created` 里直接读 `this.__ngComponentInstance`
大概率是 `undefined`。要等：

```ts
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';

static mpComponentOptions: MpComponentOptions = {
  lifetimes: {
    async created(this: MiniProgramComponentInstance) {
      await this.__waitLinkPromise;
      console.log(this.__ngComponentInstance); // 现在有了
    },
  },
};
```

## 从 Angular 侧反向拿实例

```ts
import { ComponentFinderService } from 'angular-miniprogram';

const finder = inject(ComponentFinderService);

async ngAfterViewInit() {
  const mp = await finder.get(this); // Promise
  mp.createSelectorQuery() /* … */;
}
```

`get()` 会等链接完成，所以 `await` 是必需的，也是它比直接读字段可靠的原因。
拿到的小程序实例上挂着 `setData` / `createSelectorQuery` / `getPageId` 这些原生能力。

## app 级

app 级的四个钩子不写在 `main.ts` 里，也没有 `static mpAppOptions` 这种东西，
用服务订阅：

```ts
import { MpAppLifecycleService } from 'angular-miniprogram/api';

private readonly lifecycle = inject(MpAppLifecycleService);

ngOnInit() {
  this.lifecycle.appShow$.subscribe((options) => {
    // options.scene / options.path / options.query
  });
}
```

| 流 | 对应钩子 | 载荷 |
| --- | --- | --- |
| `appShow$` | `onAppShow` | 启动参数（scene / path / query / shareTicket） |
| `appHide$` | `onAppHide` | — |
| `error$` | `onError` | 错误信息字符串 |
| `unhandledRejection$` | `onUnhandledRejection` | `{ reason }` |

都是 `share()` 过的，首次订阅才向平台注册，多个订阅方共用一个监听。
`onError` / `onUnhandledRejection` 平台没有配对的 off，首次订阅后监听常驻。

订阅方改状态用 signal，或者自己 `markForCheck()`——这些流不经过模板事件包装。

## 页面显隐对组件的影响

页面 `onHide` 时框架会 detach 页面视图，`onShow` 再 attach 回来。
组件里的 `pageLifetimes.show` / `hide` / `resize` 照常可用（在
`mpComponentOptions.pageLifetimes` 里声明）。

自定义 tabBar 是每个 tab 页各挂一份组件实例，选中态必须放到外部 service 里，
见 [入口](../../guide/entry/) 的自定义 tabBar 一节。
