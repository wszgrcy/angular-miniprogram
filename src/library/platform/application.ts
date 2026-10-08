import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
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
 * 小程序 app 级 provider，不再需要 NgModule 这个壳：HttpClient 走官方
 * `provideHttpClient(withMiniProgramRequest())`，页面注册改用 app initializer。
 * 不需要 `ApplicationModule`：它的 `ɵinj` 是空的，`ApplicationRef` 等由 `ɵinternalCreateApplication` 自己装配。
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
 * 启动钩子：把 `__ngStartPage` 装到小程序 App 对象上。单独拆出来是因为 `PageService` 的构造依赖
 * 在 ts-node JIT 下无法实例化（本仓库关掉了 `emitDecoratorMetadata`），测试环境只要 `provideMiniProgramApp()`。
 */
export function provideMiniProgramStartup(): EnvironmentProviders {
  return makeEnvironmentProviders([
    /**
     * 时序：`platformMiniProgram()` 里的 `loadApp()` 已经调过 `App()` 并建好 `__ngStartPagePromise`，
     * 页面会等这个 promise；本 initializer 跑完时 `__ngStartPage` 已就位并 resolve。
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
 * 与浏览器版的差别：没有启动组件。小程序的每个页面 / 自定义组件都由运行时各自创建，
 * 这里只建 ApplicationRef，不 bootstrap 任何组件。
 *
 * ```ts
 * bootstrapApplication({ providers: [provideHttpClient(withInterceptors([myInterceptor]))] });
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
