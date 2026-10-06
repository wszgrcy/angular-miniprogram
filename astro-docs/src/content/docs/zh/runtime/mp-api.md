---
title: '小程序 API'
---

`angular-miniprogram/api` 是一层统一的 API 入口：把各平台不同名字、不同参数、
不同回调形态的小程序 API 收敛成一套 Angular 服务风格的调用。

```ts
import { MpApiService } from 'angular-miniprogram/api';

@Component({ … })
export class DemoComponent {
  private readonly api = inject(MpApiService);

  async go() {
    await this.api.navigateTo({ url: '/pages/detail/detail-entry' });
    const res = await this.api.showModal({ content: '确定？' });
    if (res.confirm) {
      await this.api.showToast({ title: '已确定' });
    }
  }
}
```

用 `await` / `async` 接结果就顺带避开了坑：小程序 API 的**回调里改状态不会刷新视图**，
而 `await` 后面的代码跟模板事件处于同一位置。非要用回调就自己标脏，见
[变更检测与状态](../../getting-started/change-detection/)。

## 三种调用形态

**类型化方法** —— 常用 API 有独立方法，返回值按名字推断：

```ts
api.navigateTo({ url });        // Promise
api.getSystemInfoSync();        // 同步 API 直接返回原始值
api.setStorageSync('k', value); // 同步存储，参数是裸值不是 options 对象
api.getStorageSync<T>('k');
await api.invoke('getStorage', { key: 'k' }); // 异步的那套走 invoke
```

**`invoke(name, options)`** —— 泛化入口，返回 Promise：

```ts
const res = await api.invoke('showToast', { title: 'hi' });
```

**`invoke$(name, options)`** —— 冷流，可 `pipe`：

```ts
api.invoke$('showModal', { content: 'x' }).pipe(catchError(…)).subscribe(…);
```

`invoke` 就是急切订阅的 `invoke$`。名字在当前平台不存在时抛「当前平台(x)不支持 API: y」，
不是静默返回 undefined；`hasApi(name)` 可以先探测。

**回调是旁路观察者**：传 `success` / `fail` / `complete` 不影响返回的 Promise，
回调看到的是同样归一化后的结果。

## 哪些不 Promise 化

按 uni-app 的同一套规则：

- 同步 API（`*Sync`）、上下文对象（`create*` / `*Manager`）、事件注册（`on*` / `off*`）
  直接返回原始值
- **task 类**（`request` / `uploadFile` / `downloadFile` / `connectSocket`）同步返回
  task 句柄——异步 pre 管道对它们不适用（物理限制）

## 平台差异归一

高频差异在调用层内建好了，不用你判断平台：

| API | 归一内容 |
| --- | --- |
| `showModal` | 支付宝 / 钉钉拆成 `alert` / `confirm` |
| `setNavigationBarTitle` | 支付宝系走 `setNavigationBar` |
| 剪贴板 | `setClipboardData` / `setClipboard` |
| `getNetworkType` | 返回值域对齐 |
| `makePhoneCall` | `phoneNumber` → `number` |
| `previewImage` | `current`(url) → 下标 |
| `showActionSheet` | 对象项 → 字符串 |
| `request` | 钉钉走 `httpRequest` |

没收录的差异可以自己补：provide `MP_API_PROTOCOLS`。

## 拦截管道

全局或按 API 名挂 rxjs 管道。推荐用 DI 多 provider 声明式注册（同
`HTTP_INTERCEPTORS` 的路子）：

```ts
import { MP_API_PIPES, blockWith } from 'angular-miniprogram/api';

bootstrapApplication({
  providers: [
    {
      provide: MP_API_PIPES,
      multi: true,
      useValue: {
        // 全局：所有 API
        global: { post: [tap((res) => track(res))] },
        // 作用域：按 API 名
        scoped: {
          navigateTo: {
            pre: [
              map((ctx) =>
                auth.loggedIn() ? ctx : blockWith('未登录')(ctx),
              ),
            ],
          },
        },
      },
    },
  ],
});
```

`pre` 改写参数或阻断，`post` 改写结果 / 埋点 / `catchError`。
阻断用 `blockWith(reason)`（Promise 以 `MpBlockedError` 落定），
**不要用裸 `filter`**——那会空 complete 变成 `EmptyError`。

需要运行时动态注册时用服务方法，返回的句柄 `dispose()` 只撤销自己那一条：

```ts
const guard = api.setPipe('request', { pre: [addToken] });
const tracker = api.setGlobalPipes({ post: [track] });
guard.dispose();
tracker.dispose();
api.removePipe('navigateTo'); // 移除该 API 名下所有作用域管道
api.clearGlobalPipes();       // 清运行时全局，不动 DI 贡献
```

生效顺序：**DI 贡献 → 运行时全局 → 作用域**，各自保持注册顺序。

## AbortSignal 取消

```ts
const controller = new AbortController();
api.invoke('showToast', { title: 'x', signal: controller.signal });
controller.abort(); // in-flight 取消，Promise 以 AbortError 落定

// task 类：signal 自动接 task.abort()
const task = api.invoke('request', { url: '…', signal: controller.signal });
```

未发起就取消 → 不发起，直接 reject。

## 事件流

`on*` 类 API 的 Observable 形态，首次订阅才注册监听：

```ts
this.api.event$('onWindowResize', 'offWindowResize').pipe(takeUntilDestroyed(ref));
```

app 级的 `onAppShow` / `onAppHide` / `onError` / `onUnhandledRejection` 有专门的
服务 `MpAppLifecycleService`，见 [生命周期](../lifecycle/)。

## 全局事件总线

跨页面 / 跨组件的自定义事件，对标 `uni.$on` / `uni.$emit`：

```ts
import { MpEventBus } from 'angular-miniprogram/api';

private readonly bus = inject(MpEventBus);

ngOnInit() {
  const off = this.bus.on<{ id: number }>('order:changed', (p) => this.refresh(p.id));
  this.bus.once('app:resume', () => this.sync());
}

emit() {
  this.bus.emit('order:changed', { id: 1 });
}
```

`on` 返回退订函数。监听方改状态用 signal，写入时 Angular 自己标脏。

## 平台标识

```ts
import { MP_PLATFORM } from 'angular-miniprogram/api';

const platform = inject(MP_PLATFORM); // 'wx' | 'my' | 'tt' | 'swan' | 'qq' | 'dd' | 'jd' | 'ks' | 'xhs'
```

测试里 `{ provide: MP_PLATFORM, useValue: 'zfb' }` 就能模拟任意平台，
不需要伪造全局对象。
