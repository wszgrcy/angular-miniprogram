import { DOCUMENT, ɵsetDocument } from '@angular/core';

/**
 * 小程序环境下的 Document 占位物。
 *
 * Angular 的 `createComponentRef` 会无条件调 `getStyleHost()`；小程序里宿主是
 * `AgentNode`，`getRootNode()` 拿不到真根节点，必然落到需要真 `Document` 的分支，
 * `getDocument()` 会抛 NG0210。
 *
 * 返回值只喂给 `sharedStylesHost.addHost()`，而本项目未提供该 provider，所以
 * 唯一硬要求是 `doc().head` 这个属性访问不能抛。
 * 用 `ɵsetDocument` 设模块级 DOCUMENT，覆盖所有 `getDocument()` 调用点。
 */
export const MINI_PROGRAM_FAKE_DOCUMENT = {
  head: {},
  /** i18n 分支解析用：`walkIcuTree` 靠 `nodeType === COMMENT_NODE` 认嵌套 ICU */
  implementation: {
    createHTMLDocument: (): Document => createInertDocument() as never,
  },
} as unknown as Document;

/**
 * ICU 分支解析需要的最小 DOM。`parseIcuCase` 无条件跑 `getInertBodyHelper(getDocument())`，
 * 走的是 `InertDocumentHelper` 那条路：`createHTMLDocument()` → `createElement('template')`
 * → 写 `innerHTML` → 读 `content`。
 * 只给得出纯文本分支：分支里带标签时只能整段当文本返回，渲染会丢标签。
 */
/**
 * 把分支文案切成「文本 / 注释」节点链。嵌套 ICU 在消息里就是 `<!--\uFFFD1\uFFFD-->`，
 * `walkIcuTree` 只在 COMMENT_NODE 分支里认它，当纯文本返回会让嵌套那层整个消失。
 */
function parseIntoNodes(html: string): InertNode | null {
  // DOMParserHelper 会加 `<body><remove></remove>` 前缀，InertDocumentHelper 不加；两种都剥干净
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
          // `content` 是容器，`walkIcuTree` 从 `content.firstChild` 起走，
          // 直接把文本节点当 content 会让整棵分支树静默为空
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
 * 在平台初始化时调用，把 Angular 的 document 指向占位物。必须在任何组件创建之前执行。
 */
export function installFakeDocument(): void {
  ɵsetDocument(MINI_PROGRAM_FAKE_DOCUMENT);
}

/** 作为 provider 用，覆盖 `rootViewInjector.get(DOCUMENT, null)` 那条路。 */
export const FAKE_DOCUMENT_PROVIDER = {
  provide: DOCUMENT,
  useValue: MINI_PROGRAM_FAKE_DOCUMENT,
};

/**
 * 模块加载即安装：只要有人 import 到本模块就立刻装好，早于任何 createComponent 的时机。
 * `installFakeDocument()` 是幂等的，重复调没有副作用。
 */
installFakeDocument();
