import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  ApplicationRef,
  EnvironmentProviders,
  ErrorHandler,
  RendererFactory2,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  ɵINJECTOR_SCOPE,
  ɵinternalCreateApplication,
} from '@angular/core';
import type { AppOptions } from 'angular-miniprogram/platform/type';
import {
  ComponentFinderService,
  MiniProgramRendererFactory,
} from 'angular-miniprogram/platform/wx';
import { withMiniProgramRequest } from './http';
import { PageService } from './page.service';
import { platformMiniProgram } from './platform-miniprogram';

/**
 * 小程序 app 级 provider —— 取代原来的 `MiniProgramModule`。
 *
 * 内容一一对应原 NgModule 的 `providers` + `imports`，只是不再需要
 * NgModule 这个壳：
 *
 *   MiniProgramModule.providers        → 下面的数组
 *   MiniProgramModule.imports:
 *     ApplicationModule                → 不需要（其 ɵinj 是空的，见下）
 *     HttpClientModule               → 官方 provideHttpClient(withMiniProgramRequest())
 *   MiniProgramModule.constructor 里的
 *     pageService.register()          → provideAppInitializer(...)
 *
 * 关于 `ApplicationModule`：查 `@angular/core` 编译产物，它的
 * `ɵinj = __defineInjector({})` —— **一个 provider 都没有**，纯历史空壳。
 * `ApplicationRef` 等由 `ɵinternalCreateApplication` 自己装配，
 * 所以这里不需要它。
 */
export function provideMiniProgramApp(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
    { provide: ErrorHandler, useFactory: () => new ErrorHandler() },
    MiniProgramRendererFactory,
    {
      provide: RendererFactory2,
      useExisting: MiniProgramRendererFactory,
    },
    PageService,
    ComponentFinderService,
    // 用官方 provideHttpClient + 本库的 backend feature，不遮蔽官方名字。
    provideHttpClient(withMiniProgramRequest(), withInterceptorsFromDi()),
  ]);
}

/**
 * 启动钩子：把 `__ngStartPage` 装到小程序 App 对象上。
 *
 * 单独拆出来（不放进 `provideMiniProgramApp()`）的原因：
 *
 * `PageService` 的构造依赖在 **ts-node JIT** 下无法实例化（本仓库
 * `emitDecoratorMetadata` 是关的，JIT 拿不到构造参数类型，报
 * NG0202）。真实应用走 ng-packagr AOT，类型从 AST 解析，没这个问题。
 *
 * 所以：
 *   - `bootstrapApplication()` 带上本钩子
 *   - 测试环境（`initMiniProgramTestEnv`）只要 `provideMiniProgramApp()`，
 *     不自动跑 register
 */
export function provideMiniProgramStartup(): EnvironmentProviders {
  return makeEnvironmentProviders([
    /**
     * 原来 `pageService.register()` 挂在 `MiniProgramModule` 的构造函数上，
     * 靠 NgModule 被实例化来触发。去掉 NgModule 后改用 app initializer。
     *
     * 时序仍然成立：`platformMiniProgram()` 里的 `loadApp()` 已经调过
     * `App()` 并建好 `__ngStartPagePromise`，页面会等这个 promise；
     * 本 initializer 跑完时 `__ngStartPage` 已就位并 resolve。
     */
    provideAppInitializer(() => {
      inject(PageService).register();
    }),
  ]);
}

/** `bootstrapApplication` 的配置。比 Angular 的 `ApplicationConfig` 多一个 `app`。 */
export interface MiniProgramApplicationConfig
  extends Omit<ApplicationConfig, 'providers'> {
  /** app 级 provider（拦截器、HttpClient 配置等） */
  providers?: ApplicationConfig['providers'];
  /** 透传给小程序 `App(options)` 的选项 */
  app?: AppOptions;
}

/**
 * Provider 化的小程序启动，对标 `bootstrapApplication(App, appConfig)`。
 *
 * ## 与浏览器版的差别：没有启动组件
 *
 * 浏览器版是 `bootstrapApplication(AppComponent, config)` —— 有一个
 * 贯穿全应用的根组件。小程序没有这个东西：每个页面 / 自定义组件都是
 * 小程序运行时各自创建的，Angular 侧对应的是 `PageService.__ngStartPage`
 * 里那套 `createComponent` + `applicationRef.attachView`。
 *
 * 好在 Angular 本身就支持不传 rootComponent（`_debug_node-chunk` 里）：
 *
 * ```js
 * // rootComponent 是可选的
 * if (config.rootComponent !== undefined) {
 *   appRef.bootstrap(config.rootComponent);
 * }
 * ```
 *
 * 所以我们只建 ApplicationRef，不 bootstrap 任何组件。ApplicationRef
 * 在这里的作用是「已挂载视图的容器 + 变更调度入口」，页面组件后续
 * 逐个 attach 进来。
 *
 * 用法：
 *
 * ```ts
 * bootstrapApplication({
 *   providers: [provideHttpClient(withInterceptors([myInterceptor]))]
 * });
 * ```
 */
export function bootstrapApplication(
  config: MiniProgramApplicationConfig = {},
): Promise<ApplicationRef> {
  const { providers = [], app, ...rest } = config;

  const platformRef = platformMiniProgram([], app ?? {});

  return ɵinternalCreateApplication({
    // 故意不传 rootComponent：小程序没有启动组件。
    appProviders: [
      provideMiniProgramApp(),
      provideMiniProgramStartup(),
      ...providers,
    ],
    platformRef,
    ...rest,
  });
}
