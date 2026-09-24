/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpBackend } from '@angular/common/http';
import {
  ApplicationRef,
  ErrorHandler,
  RendererFactory2,
  ɵINJECTOR_SCOPE,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideMiniProgramApp } from './application';
import { ComponentFinderService } from './default/component-finder.service';
import { MiniProgramRendererFactory } from './default/mini-program.renderer.factory';
import { MiniprogramHttpBackend } from './http';
import { PageService } from './page.service';
import { initMiniProgramTestEnv } from './test-util/init-env';

/**
 * `provideMiniProgramApp` —— 取代 `MiniProgramModule` 的 provider 集合。
 *
 * 这里盯住的是「原 NgModule 提供的东西一个都没丢」。原
 * `MiniProgramModule` 的 providers 是：
 *   ɵINJECTOR_SCOPE: 'root' / ErrorHandler / MiniProgramRendererFactory /
 *   RendererFactory2→useExisting / PageService / ComponentFinderService
 * imports 是 ApplicationModule + HttpClientModule。
 *
 * ApplicationModule 经查 `ɵinj = __defineInjector({})`，一个 provider
 * 都没有，纯历史空壳，所以不需要它——本 spec 顺带把这条钉住。
 */
describe('provideMiniProgramApp（取代 MiniProgramModule）', () => {
  beforeEach(() => {
    initMiniProgramTestEnv();
    TestBed.configureTestingModule({
      providers: [provideMiniProgramApp()],
    });
  });

  it('ɵINJECTOR_SCOPE 是 root（少了它 ApplicationRef 找不到）', () => {
    expect(TestBed.inject(ɵINJECTOR_SCOPE as any)).toBe('root');
  });

  it('RendererFactory2 指向 MiniProgramRendererFactory', () => {
    const factory = TestBed.inject(RendererFactory2);

    expect(factory instanceof MiniProgramRendererFactory).toBe(true);
  });

  it('PageService 已注册（JIT 下不可实例化，见注释）', () => {
    // PageService 构造依赖 Injector / EnvironmentInjector / ApplicationRef /
    // @Inject(APP_TOKEN)。本仓库 emitDecoratorMetadata 是关的，
    // ts-node JIT 拿不到前三个的类型，所以真实构造会报 NG0202。
    // 真实应用走 ng-packagr AOT，类型从 AST 解析，没这个问题。
    //
    // 这里能验证的是「provider 存在」：未注册会报
    // NullInjectorError（NG201），而不是 NG0202。
    let code: number | null = null;
    try {
      TestBed.inject(PageService);
    } catch (e: any) {
      code = e?.code ?? null;
    }

    expect(code).not.toBeNull();
    expect(code).not.toBe(201); // 不是「找不到 provider」
  });

  it('ComponentFinderService / ErrorHandler 可正常解析', () => {
    expect(TestBed.inject(ComponentFinderService)).toBeTruthy();
    expect(TestBed.inject(ErrorHandler)).toBeTruthy();
  });

  it('HttpClient 后端是 MiniprogramHttpBackend（原 HttpClientModule 的等价物）', () => {
    expect(TestBed.inject(HttpBackend) instanceof MiniprogramHttpBackend).toBe(
      true,
    );
  });

  it('ApplicationRef 可解析（证明不需要 ApplicationModule）', () => {
    // ApplicationModule.ɵinj 是空的，ApplicationRef 由
    // internalCreateApplication / core 自己装配，不依赖那个 NgModule。
    expect(TestBed.inject(ApplicationRef)).toBeTruthy();
  });
});
