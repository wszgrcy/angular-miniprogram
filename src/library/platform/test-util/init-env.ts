/* eslint-disable @typescript-eslint/no-explicit-any */
import { APP_ID, Injectable, NgModule } from '@angular/core';
import { TestBed, TestComponentRenderer } from '@angular/core/testing';

import { provideMiniProgramApp } from '../application';
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
  // provider 列表不再手工镜像，直接用库里的 provideMiniProgramApp()，
  // 避免两边不同步（以前 MiniProgramModule 改一处就要跟着改这里）。
  providers: [
    { provide: APP_ID, useValue: 'mini-program-test' },
    provideMiniProgramApp(),
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
