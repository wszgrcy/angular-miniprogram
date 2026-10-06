---
title: '启动与依赖注入'
---

## `bootstrapApplication()` 的签名差异

浏览器环境为 `bootstrapApplication(AppComponent, config)`。小程序不存在启动组件——
每个页面、每个自定义组件都由小程序运行时自行创建，因此这里的第一个参数即为配置本身：

```ts
import { bootstrapApplication } from 'angular-miniprogram';

bootstrapApplication();
```

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withMiniProgramRequest } from 'angular-miniprogram';

bootstrapApplication({
  providers: [
    // 重新装配 HttpClient 时必须同时提供 withMiniProgramRequest()，见 HTTP 请求一节
    provideHttpClient(
      withMiniProgramRequest(),
      withInterceptors([authInterceptor]),
    ),
    { provide: LOCALE_ID, useValue: 'zh-CN' },
  ],
});
```

它只创建 `ApplicationRef`（已挂载视图的容器与变更调度入口），不 bootstrap 任何组件。
页面组件由各 `*.entry.ts` 的 `export default` 逐个 `attachView` 挂载。

在 `main.ts` 中只调用一次。其之前的代码会先执行，这一点有实际影响：多语言的译文必须在
第一个页面渲染之前就位（见 [多语言](../i18n/)）。

## 内置的 provider

`bootstrapApplication()` 已提供小程序运行所需的 provider，无需重复提供：

| 提供                                       | 用途                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `RendererFactory2` → `MiniProgramRenderer` | 把 `Renderer2` 的调用落到渲染层数据                                                            |
| `ComponentFinderService`                   | Angular 实例 ↔ 小程序实例互查                                                                 |
| `PageService`                              | 页面自举                                                                                       |
| `HttpClient` + 小程序 backend              | 见 [HTTP 请求](../http/)                                                                       |
| `ErrorHandler`                             | 错误进 `console.error`                                                                         |
| `DOCUMENT` 占位实现                        | Angular 22 创建组件时会无条件读取，见 [不支持与受限的能力](../../getting-started/limitations/) |

`provideMiniProgramApp()` / `provideMiniProgramStartup()` 是其内部组成，
常规用法无需直接引用。

## 获取小程序侧实例

三个注入 token：

```ts
import {
  APP_TOKEN,
  PAGE_TOKEN,
  MINIPROGRAM_GLOBAL_TOKEN,
} from 'angular-miniprogram';

export class FooComponent {
  /** 小程序 App 实例（getApp() 的返回） */
  private readonly app = inject(APP_TOKEN);
  /** 当前页面所属的小程序页面 / 组件实例 */
  private readonly page = inject(PAGE_TOKEN);
  /** 平台全局对象：wx / my / tt / swan … */
  private readonly mp = inject(MINIPROGRAM_GLOBAL_TOKEN);
}
```

`PAGE_TOKEN` 仅在页面组件的注入器中有值。自定义组件中需要获取自身的小程序实例时，
使用 `ComponentFinderService`：

```ts
import { ComponentFinderService } from 'angular-miniprogram';

const finder = inject(ComponentFinderService);
const mpInstance = await finder.get(this); // Promise，不是 Observable
```

`get()` 会等待链接完成——Angular 实例与小程序实例的关联是异步建立的，
在 `await` 之前读取到 `undefined` 属于正常时序，而非缺陷。

## 应用级生命周期

`onAppShow` / `onAppHide` / `onError` / `onUnhandledRejection` 不书写在 `main.ts` 中，
通过 `MpAppLifecycleService` 订阅，见 [生命周期](../lifecycle/)。页面级的 `onShow` /
`onHide` 使用 `static mpPageOptions`，见 [原生配置](../native-options/)。

## 依赖注入本身没有变化

`inject()`、`providedIn: 'root'`、组件级 provider、`InjectionToken`、
`resolveFunction` 等用法全部照常。唯一需要留意的是**root injector 的生命周期等于
小程序进程**：小程序切后台被回收或热重载时，进程内状态可能已经变化。
跨页面共享状态使用 service 没有问题，但不应假设进程持续存活。
