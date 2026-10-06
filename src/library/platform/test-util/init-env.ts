/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 测试环境直接 import，是故意偏离官方做法的。
 * 正式工程里 `@angular/localize/init` 是 polyfill，由构建器按 angular.json 注入；
 * vitest 这一侧没有 polyfill 入口可配，而 ICU / i18n 的语义只有这一份实现，
 * 另搭兜底就是第二套语义。所以只在测试里破例。
 */
// eslint-disable-next-line import-x/no-unassigned-import
import '@angular/localize/init';
import { APP_ID, Injectable, NgModule } from '@angular/core';
import { TestBed, TestComponentRenderer } from '@angular/core/testing';

import { provideMiniProgramApp } from '../application';
import { AgentNode } from '../default/agent-node';
import { platformMiniProgram } from '../platform-miniprogram';

/**
 * 小程序测试环境初始化。Angular 的测试初始化走 TestBed，不需要 bootstrap NgModule：
 *
 *   TestBed.initTestEnvironment([TestModule], platformMiniProgram(), opts)
 *   TestBed.createComponent(Cmp)
 *   fixture.detectChanges()
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
  // provider 列表不手工镜像，直接用库里的 provideMiniProgramApp()，避免两边不同步
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
 * 测试环境里手工补上 define 的那条映射。
 * 与 `agent-node.ts` 里那句不是重复，是同一条映射的两端：那边挂目标名 `AgentNode`，
 * 这里挂源名 `Node`——vitest 直连库源码、不过构建器，Angular 里读的字面就是 `Node.TEXT_NODE`。
 * 少了这句，`Node.TEXT_NODE` 是 undefined，ICU 整片渲染不出来。
 */
(globalThis as Record<string, unknown>).Node = AgentNode;

export function initMiniProgramTestEnv(): void {
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
    },
  );
}
