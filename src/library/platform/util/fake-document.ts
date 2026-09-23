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
/**
 * 本模块刻意不引用全局 `Document` 类型：小程序库不该依赖 DOM 类型，
 * 且 tsconfig.spec.json 也没挂 dom lib。用本地最小形状 + 消费点 cast。
 */
export interface FakeDocumentLike {
  head: unknown;
}

export const MINI_PROGRAM_FAKE_DOCUMENT: FakeDocumentLike = {
  head: {},
};

/**
 * 在平台初始化时调用，把 Angular 的 document 指向占位物。
 *
 * 必须在任何组件创建之前执行（platform 建立阶段即可）。
 */
export function installFakeDocument(): void {
  ɵsetDocument(MINI_PROGRAM_FAKE_DOCUMENT as never);
}

/**
 * 作为 provider 用，覆盖 `rootViewInjector.get(DOCUMENT, null)` 那条路。
 */
export const FAKE_DOCUMENT_PROVIDER = {
  provide: DOCUMENT,
  useValue: MINI_PROGRAM_FAKE_DOCUMENT,
};
