/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 测试环境直接 import，是故意偏离官方做法的。
 *
 * 正式工程里 `@angular/localize/init` 是 **polyfill**，由构建器按 angular.json
 * 的 `polyfills` 注入（见 `builder/vite/index.ts` 的 `resolveLocalizeInit`），
 * 源码里直接 import 会被 CLI 警告。但 vitest 这一侧没有 polyfill 入口可配，
 * 而 ICU / i18n 的语义（元数据剥离、译文查找）只有这一份实现，
 * 另搭兜底就是第二套语义、迟早漂开。所以只在测试里破例。
 */
// eslint-disable-next-line import-x/no-unassigned-import
import '@angular/localize/init';
import { APP_ID, Injectable, NgModule } from '@angular/core';
import { TestBed, TestComponentRenderer } from '@angular/core/testing';

import { provideMiniProgramApp } from '../application';
import { AgentNode } from '../default/agent-node';
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
 * 测试环境里手工补上 define 的那条映射。
 *
 * ## 和 `agent-node.ts` 里那句不是重复
 *
 * 两边写的是**不同的名字**，是同一条映射的两端：
 *
 * ```
 * buildPlatformDefine:   Node  ──编译期替换──▶  <平台>.AgentNode
 * agent-node.ts:         负责让 <平台>.AgentNode 真的存在
 * 这里:                  没有编译期替换，所以让 Node 这个源头名字直接指过去
 * ```
 *
 * `agent-node.ts` 挂的是**目标名** `AgentNode`（产物里 `Node` 被换掉后指的就是它）；
 * 这里挂的是**源名** `Node`——vitest 直连库源码、不过构建器，Angular 里读的字面
 * 就是 `Node.TEXT_NODE`，没人替换它。少了这句，`Node.TEXT_NODE` 是 undefined，
 * `walkIcuTree` 的 `case Node.TEXT_NODE` 静默落空，ICU 整片渲染不出来。
 *
 * 顺带顶掉了原先这里的 `g.Node = class Node {}` 兜底：那是给
 * `getDebugNode()` 的 `instanceof Node` 用的空类，不带 nodeType 常量。
 * 换成 `AgentNode` 之后它不但多余，还会在抢跑时把常量抹掉、让 ICU 静默坏掉。
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
