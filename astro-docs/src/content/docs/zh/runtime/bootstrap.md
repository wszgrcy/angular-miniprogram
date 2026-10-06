---
title: '启动与依赖注入'
---

## `bootstrapApplication()` 的签名不一样

浏览器版是 `bootstrapApplication(AppComponent, config)`。小程序没有「启动组件」——
每个页面、每个自定义组件都是小程序运行时自己创建的，所以这里的第一个参数是配置本身：

```ts
import { bootstrapApplication } from 'angular-miniprogram';

bootstrapApplication();
```

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withMiniProgramRequest } from 'angular-miniprogram';

bootstrapApplication({
  providers: [
    // 重新装配 HttpClient 时，withMiniProgramRequest() 必须跟着，见 HTTP 那一页
    provideHttpClient(withMiniProgramRequest(), withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'zh-CN' },
  ],
});
```

它只创建 `ApplicationRef`（已挂载视图的容器 + 变更调度入口），不 bootstrap 任何组件。
页面组件由各 `*.entry.ts` 的 `export default` 逐个 `attachView` 进来。

`main.ts` 里只调一次。它之前的代码会先跑，这一点有实际影响：多语言的译文必须在
第一个页面渲染之前就位（见 [多语言](../i18n/)）。

## 内置的 provider

`bootstrapApplication()` 已经装好了小程序需要的东西，不需要你重复提供：

| 提供 | 用途 |
| --- | --- |
| `RendererFactory2` → `MiniProgramRenderer` | 把 `Renderer2` 的调用落到渲染层数据 |
| `ComponentFinderService` | Angular 实例 ↔ 小程序实例互查 |
| `PageService` | 页面自举 |
| `HttpClient` + 小程序 backend | 见 [HTTP 请求](../http/) |
| `ErrorHandler` | 错误进 `console.error` |
| `DOCUMENT` 占位物 | Angular 22 建组件时会无条件读它，见 [不支持与受限的能力](../../getting-started/limitations/) |

`provideMiniProgramApp()` / `provideMiniProgramStartup()` 是它的内部组成，
正常用法不需要直接引。

## 拿小程序侧的实例

三个注入 token：

```ts
import { APP_TOKEN, PAGE_TOKEN, MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram';

export class FooComponent {
  /** 小程序 App 实例（getApp() 的返回） */
  private readonly app = inject(APP_TOKEN);
  /** 当前页面所属的小程序页面 / 组件实例 */
  private readonly page = inject(PAGE_TOKEN);
  /** 平台全局对象：wx / my / tt / swan … */
  private readonly mp = inject(MINIPROGRAM_GLOBAL_TOKEN);
}
```

`PAGE_TOKEN` 只在页面组件的注入器里有值。自定义组件里要拿自己那个小程序实例，
用 `ComponentFinderService`：

```ts
import { ComponentFinderService } from 'angular-miniprogram';

const finder = inject(ComponentFinderService);
const mpInstance = await finder.get(this); // Promise，不是 Observable
```

`get()` 会等链接完成——Angular 实例与小程序实例的关联是异步建立的，
`await` 之前拿到 `undefined` 是正常时序，不是 bug。

## app 级生命周期

`onAppShow` / `onAppHide` / `onError` / `onUnhandledRejection` 不写在 `main.ts` 里，
用 `MpAppLifecycleService` 订阅，见 [生命周期](../lifecycle/)。页面级的 `onShow` /
`onHide` 用 `static mpPageOptions`，见 [原生配置](../native-options/)。

## 依赖注入本身没有变化

`inject()`、`providedIn: 'root'`、组件级 provider、`InjectionToken`、
`resolveFunction` 这些全部照常。唯一要留意的是**root injector 的生命周期等于
小程序进程**：小程序切后台被回收、或热重载，进程内状态可能已经换了。
跨页面共享状态用 service 没问题，但别假设进程一直活着。
