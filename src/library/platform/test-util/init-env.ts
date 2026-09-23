/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  APP_ID,
  ApplicationModule,
  ErrorHandler,
  Injectable,
  NgModule,
  RendererFactory2,
  ɵINJECTOR_SCOPE,
} from '@angular/core';
import { TestBed, TestComponentRenderer } from '@angular/core/testing';

import { ComponentFinderService } from '../default/component-finder.service';
import { MiniProgramRendererFactory } from '../default/mini-program.renderer.factory';
import { PageService } from '../page.service';
import { platformMiniProgram } from '../platform-miniprogram';

/**
 * 小程序测试环境初始化。
 *
 * ## 正确姿势（参考 opentui-angular 的做法）
 *
 * Angular 的测试初始化**不是** `bootstrapModule(SomeModule)`，而是：
 *
 *   TestBed.initTestEnvironment([TestModule], platformMiniProgram(), opts)
 *   TestBed.createComponent(Cmp)
 *   fixture.detectChanges()
 *
 * 之前我走 `platformMiniProgram().bootstrapModule(M)`，于是必须把
 * `MiniProgramModule` 拉进来，撞上它 `constructor(pageService)` 在
 * ts-node JIT 下 NG0202。TestBed 这条路**不需要 bootstrap NgModule**，
 * 组件由 TestBed 自己编译、DI 由它接管，问题自然消失。
 */

/** 小程序没有 DOM，root element 的插入/移除都是空操作 */
@Injectable()
export class MiniProgramTestComponentRenderer extends TestComponentRenderer {
  override insertRootElement(rootElId: string, tagName?: string): void {
    void rootElId;
    void tagName;
  }
  override removeAllRootElements(): void {}
}

@NgModule({
  // ApplicationInitStatus 等由 ApplicationModule 提供
  imports: [ApplicationModule],
  providers: [
    { provide: APP_ID, useValue: 'mini-program-test' },
    // 镜像 MiniProgramModule 的 provider 列表，但**不带它的 ctor**。
    // 少了 ɵINJECTOR_SCOPE 会导致 ApplicationRef 找不到（作用域不对）。
    { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
    MiniProgramRendererFactory,
    { provide: RendererFactory2, useExisting: MiniProgramRendererFactory },
    PageService,
    ComponentFinderService,
    // MiniProgramModule 用 factory 提供 ErrorHandler；TestBed 这条路不
    // 经过它，这里补一条同语义的。
    { provide: ErrorHandler, useFactory: () => new ErrorHandler(), deps: [] },
    {
      provide: TestComponentRenderer,
      useClass: MiniProgramTestComponentRenderer,
    },
  ],
})
export class MiniProgramTestModule {}

/** 每个 spec 的 beforeEach 里调一次 */
/**
 * `ComponentFixture` 构造时会调 `getDebugNode()`，后者引用 DOM 的
 * `Node` **类**（`nativeNode instanceof Node`）。小程序没有，
 * 且 `installFakeDocument()` 只补了 `document`，没补 `Node`。
 *
 * 给一个空类即可——`instanceof` 只需要类存在，
 * 我们的节点不是它的实例，走的是非 DOM 分支。
 */
function ensureDomNodeGlobal(): void {
  const g = globalThis as any;
  if (typeof g.Node === 'undefined') {
    g.Node = class Node {};
  }
}

export function initMiniProgramTestEnv(): void {
  ensureDomNodeGlobal();
  try {
    (TestBed as any).platform?.destroy?.();
  } catch {
    /* 还没建过，忽略 */
  }
  TestBed.resetTestEnvironment();
  TestBed.initTestEnvironment(
    [MiniProgramTestModule],
    platformMiniProgram([]) as any,
    {
      errorOnUnknownElements: false,
      errorOnUnknownProperties: false,
    }
  );
}
