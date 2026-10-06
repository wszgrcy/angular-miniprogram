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
  /** i18n 分支解析用：`walkIcuTree` 靠 `nodeType === COMMENT_NODE` 认嵌套 ICU */
  implementation: {
    createHTMLDocument: (): Document => createInertDocument() as never,
  },
} as unknown as Document;

/**
 * ICU 分支解析需要的最小 DOM。
 *
 * `parseIcuCase` 无条件跑 `getInertBodyHelper(getDocument())`，拿不到就
 * `Cannot read properties of undefined (reading 'createHTMLDocument')`。两个候选实现里：
 *
 * - `DOMParserHelper`：要 `window.DOMParser`，小程序没有，`isDOMParserAvailable()`
 *   自己 catch 掉，不会选它；
 * - `InertDocumentHelper`：`doc.implementation.createHTMLDocument()` →
 *   `createElement('template')` → 写 `innerHTML` → 读 `content`。
 *
 * 所以只需把第二条这条路搭起来。`walkIcuTree` 真正读的字段只有
 * `nodeType` / `nodeName` / `textContent` / `firstChild` / `nextSibling`（元素额外要
 * `tagName` / `attributes` / `namespaceURI`），这里只给得出**纯文本分支**：
 * 分支里带标签时这里只能整段当文本返回，渲染会丢标签。
 */
/**
 * 把分支文案切成「文本 / 注释」节点链。
 *
 * 注释节点不是可选项：嵌套 ICU 在消息里就是 `<!--\uFFFD1\uFFFD-->`，
 * `walkIcuTree` 只在 `case Node.COMMENT_NODE` 分支里认它
 * （`NESTED_ICU = /\uFFFD(\d+)\uFFFD/`）。当纯文本返回的话外层分支会渲染出
 * 字面量 `<!--1-->`，嵌套的那层则整个不存在。
 *
 * 仍然只认这两种节点：分支里带真标签时只能整段当文本，渲染会丢标签。
 */
function parseIntoNodes(html: string): InertNode | null {
  // DOMParserHelper 会加 `<body><remove></remove>` 前缀，InertDocumentHelper
  // 不加；两种形态都剥干净
  const body = html
    .replace(/^<body>/, '')
    .replace(/^<remove><\/remove>/, '')
    .replace(/<\/body>$/, '');

  const head: InertNode = {
    nodeType: 11,
    nodeName: '#document-fragment',
    textContent: '',
    firstChild: null,
    nextSibling: null,
  };
  let tail = head;
  let rest = body;
  while (rest.length) {
    const open = rest.indexOf('<!--');
    const close = open === -1 ? -1 : rest.indexOf('-->', open + 4);
    if (open === -1 || close === -1) {
      tail.nextSibling = makeText(rest);
      break;
    }
    if (open > 0) {
      tail.nextSibling = makeText(rest.slice(0, open));
      tail = tail.nextSibling;
    }
    tail.nextSibling = {
      nodeType: 8,
      nodeName: '#comment',
      textContent: rest.slice(open + 4, close),
      firstChild: null,
      nextSibling: null,
    };
    tail = tail.nextSibling;
    rest = rest.slice(close + 3);
  }
  return head.nextSibling;
}

function makeText(text: string): InertNode {
  return {
    nodeType: 3,
    nodeName: '#text',
    textContent: text,
    firstChild: null,
    nextSibling: null,
  };
}

function createInertDocument() {
  return {
    createElement(tag: string) {
      // `InertDocumentHelper` 只会要 template；其余一律不给，避免默默走空
      if (tag !== 'template') {
        throw new Error(`i18n DOM 占位物不造 <${tag}>`);
      }
      let content: InertNode | null = null;
      return {
        // getTemplateContent 认这两项，缺一个整棵分支树会被静默跳过
        nodeType: 1,
        nodeName: 'TEMPLATE',
        set innerHTML(html: string) {
          // `content` 是**容器**，`walkIcuTree` 从 `content.firstChild` 起走。
          // 直接把文本节点当 content 会让它一上来就拿到 null，整棵分支树静默为空。
          content = {
            nodeType: 11,
            nodeName: '#document-fragment',
            textContent: '',
            firstChild: parseIntoNodes(html),
            nextSibling: null,
          };
        },
        get content() {
          return content;
        },
      };
    },
  };
}

interface InertNode {
  nodeType: number;
  nodeName: string;
  textContent: string;
  firstChild: InertNode | null;
  nextSibling: InertNode | null;
}

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
