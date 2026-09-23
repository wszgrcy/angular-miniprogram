import { DOCUMENT, ɵsetDocument } from '@angular/core';

/**
 * 小程序环境下的 Document 占位物。
 *
 * ## 为什么需要
 *
 * Angular 22 起（commit cdda51a3b2 "support bootstrapping Angular
 * applications underneath shadow roots"），`createComponentRef` 会
 * **无条件**调用 `getStyleHost()`：
 *
 * ```ts
 * const styleHost = getStyleHost(
 *   hostElement,
 *   () => rootViewInjector.get(DOCUMENT, null) ?? getDocument(),
 * );
 * ```
 *
 * 而 `getStyleHost` 的分支是：
 *
 * ```ts
 * const rootNode = node.getRootNode?.();
 * if (documentSupported && rootNode instanceof Document) return rootNode.head; // 不调 doc()
 * else if (!rootNode)                          return doc().head;  // ← 小程序走这条
 * else if (shadowRootSupported && …)           return rootNode;    // 不调 doc()
 * else                                         return doc().head;  // 或这条
 * ```
 *
 * 小程序里宿主是 `AgentNode`，既不是 `Document` 也不是 `ShadowRoot`，
 * `getRootNode()` 拿不到真根节点，必然落到需要真 `Document` 的分支，
 * 于是 `getDocument()` 抛 NG0210：
 *
 *   "The document object is not available in this context.
 *    Make sure the DOCUMENT injection token is provided."
 *
 * 注意 ng17~ng21 都没有这段代码，所以这个报错是 21→22 升级带进来的，
 * 不是配置改动导致的。
 *
 * ## 为什么占位物可以这么空
 *
 * `getStyleHost` 的返回值只喂给 `sharedStylesHost.addHost(styleHost)`，
 * 而 `SHARED_STYLES_HOST` 本项目并未提供（组件样式走 wxml/wxss，
 * 不用 DOM 注入），所以 `sharedStylesHost` 为 null，返回值直接被丢弃。
 *
 * 唯一硬要求是 `doc().head` 这个属性访问不能抛，所以给个 `head` 占位。
 *
 * ## 为什么用 ɵsetDocument 而不是只 provider DOCUMENT
 *
 * `getDocument()` 的实现是：
 *
 * ```ts
 * if (DOCUMENT !== undefined) return DOCUMENT;
 * else if (typeof document !== 'undefined') return document;
 * throw new RuntimeError(MISSING_DOCUMENT, ...);
 * ```
 *
 * `ɵsetDocument` 设的是这个**模块级** DOCUMENT，因此覆盖所有调用点，
 * 不只是 injector 那一条路。两者都上，避免哪天又冒出个直接调
 * `getDocument()` 的新代码路径。
 */
export const MINI_PROGRAM_FAKE_DOCUMENT = {
  head: {},
} as unknown as Document;

/**
 * 在平台初始化时调用，把 Angular 的 document 指向占位物。
 *
 * 必须在任何组件创建之前执行（platform 建立阶段即可）。
 */
export function installFakeDocument(): void {
  ɵsetDocument(MINI_PROGRAM_FAKE_DOCUMENT);
}

/**
 * 作为 provider 用，覆盖 `rootViewInjector.get(DOCUMENT, null)` 那条路。
 */
export const FAKE_DOCUMENT_PROVIDER = {
  provide: DOCUMENT,
  useValue: MINI_PROGRAM_FAKE_DOCUMENT,
};

/**
 * 模块加载即安装。
 *
 * 只靠 platformMiniProgram() 里调用是不够的：那条路依赖调用方在
 * page bootstrap 之前正确建立了 platform。一旦调用方的 main.ts 走了
 * 别的引导方式、或者用的是旧产物，就会漏装，微信里直接 NG0210。
 *
 * 放在模块顶层，只要有人 import 到本模块（platform 的 index 会带进来），
 * 就立刻装好——早于任何 createComponent 的可能时机。
 * installFakeDocument() 是幂等的（重复 setDocument 同一个对象），
 * 所以顶层调一次 + platformMiniProgram 再调一次没有副作用。
 */
installFakeDocument();
