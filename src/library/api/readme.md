# angular-miniprogram/api

统一小程序 API 层（对标 uni-app 的 `uni.xxx`），root 单例，Angular 服务风格。

```ts
import { MpApiService, MpEventBus } from 'angular-miniprogram/api';

@Component({ ... })
export class Demo {
  private api = inject(MpApiService);
  private bus = inject(MpEventBus);

  async go() {
    await this.api.navigateTo({ url: '/pages/detail/detail-entry' });
    const res = await this.api.showModal({ content: '确定？' });
    if (res.confirm) {
      await this.api.showToast({ title: '已确定' });
    }
  }
}
```

## 组成

| 导出 | 说明 |
|---|---|
| `MpApiService` | 统一 API 入口：类型化方法 + `invoke(name, options)` 泛化入口 + 拦截器 |
| `MpEventBus` | 全局事件总线（`on/once/off/emit`，`on` 返回退订函数） |
| `MP_PLATFORM` | 运行时平台标识（`wx/my/tt/swan/qq/dd/jd`），可 override 用于测试 |
| `MP_API_PROTOCOLS` | 平台差异协议表，可替换/扩展 |

## 调用管线（rxjs 冷流）

```
invoke$(name, options)
  of(ctx) → pre pipes（改写参数 / blockWith 阻断）
          → switchMap(真正调用)   ← 订阅才发生
          → post pipes（改写结果 / 埋点 / catchError）
          → 平台协议归一化在调用层内完成
```

- `invoke$` 返回冷流，可订阅；`invoke` 返回 Promise（急切订阅）
- **回调是旁路观察者**：传 `success/fail/complete` 不影响返回 Promise，回调看到的是同样归一/改写后的结果
- **task 类**（`request/uploadFile/downloadFile/connectSocket`）同步返回 task（异步 pre 管道不适用，物理限制）
- **同步 API**（`*Sync` / `create*` / `on*` 等）直接返回原始值
- 所有回调经 `ɵChangeDetectionScheduler` 通知变更检测，不依赖 zone

## 管道拦截

管道注册表 `MpPipeRegistry` 是 **root 单例**，由 `MpApiService` 注入（非内部 `new`）。
全局管道优先用 **DI 多 provider 声明式注册**（同 `HTTP_INTERCEPTORS`），而不是运行时调服务。

### 声明式（推荐）

```ts
import { MP_API_PIPES, blockWith } from 'angular-miniprogram/api';

// 应用根 / 库的 provide
providers: [
  {
    provide: MP_API_PIPES,
    multi: true,
    useValue: {
      // 全局：所有 API
      global: { post: [tap((res) => track(res))] },
      // 作用域：按 API 名
      scoped: {
        navigateTo: { pre: [map((ctx) => (auth.loggedIn() ? ctx : blockWith('未登录')(ctx)))] },
      },
    },
  },
  // 可多个贡献，按 provider 顺序叠加
  { provide: MP_API_PIPES, multi: true, useValue: { global: { pre: [addTraceId] } } },
]
```

### 运行时（动态场景）

```ts
// set 返回句柄，dispose() 即撤销本次注册
const guard = api.setPipe('request', {
  pre: [switchMap(async (ctx) => ({ ...ctx, options: { ...ctx.options, headers: { token: await getToken() } } }))],
});

const tracker = api.setGlobalPipes({ post: [tap((res) => track(res))] });

guard.dispose();      // 只撤销自己，不影响其他注册
tracker.dispose();

api.removePipe('navigateTo');   // 移除该 API 名下所有作用域管道
api.clearGlobalPipes();         // 清除运行时全局（不动 DI 贡献）
```

生效顺序：**DI 贡献 → 运行时全局 → 作用域**（各自保持注册顺序）

- `setPipe` / `setGlobalPipes` 返回 `MpPipeHandle`，`dispose()` 幂等
- 每次 set 是一条独立注册记录，互不干扰

- `pre`：`OperatorFunction<MpInvokeContext, MpInvokeContext>[]`，调用前改写参数或阻断
- `post`：`OperatorFunction<any, any>[]`，调用后改写结果 / 埋点 / `catchError`
- `blockWith(reason)` 阻断（reject `MpBlockedError`）；裸 `filter` 会空 complete → `EmptyError`，不推荐

## AbortSignal 取消

```ts
const controller = new AbortController();
api.invoke('showToast', { title: 'x', signal: controller.signal });
controller.abort(); // in-flight 取消，Promise 以 AbortError 落定

// task 类：signal 自动接 task.abort()
const task = api.invoke('request', { url: '...', signal: controller.signal });
```

- 未发起即取消：不发起调用，直接 reject
- in-flight 取消：普通 API reject AbortError；task 类调 `task.abort()`

## 平台协议（已内置的高频差异归一）

- 支付宝：`showModal→alert/confirm`、`setNavigationBarTitle→setNavigationBar`、
  剪贴板、`getNetworkType` 值域、`makePhoneCall phoneNumber→number`、
  `previewImage current(url)→下标`、`showActionSheet` 对象项→字符串
- 钉钉：`request→httpRequest`、`showModal→alert/confirm`、导航栏、剪贴板

未收录的差异可通过 provide `MP_API_PROTOCOLS` 自行补充。
