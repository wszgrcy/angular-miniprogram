/// <reference types="miniprogram-api-typings"/>
import type {
  MPElementData,
  MPTextData,
} from 'angular-miniprogram/platform/type';
import clsx from 'clsx';

/** `find()` 需要的最小宿主能力，page 实例与自定义组件实例都满足 */
interface QueryHost {
  createSelectorQuery(): WechatMiniprogram.SelectorQuery;
}

export class AgentNode {
  /**
   * `Node` 的 nodeType 常量。
   *
   * `walkIcuTree` 的 `switch (node.nodeType)` 与 `applyCreateOpCodes` 的
   * `Node.COMMENT_NODE` 都不在 `ngDevMode` 守卫里，缺了直接 `ReferenceError`。
   * 下面把全局 `Node` 直接指到本类，所以常量得挂在这里。
   */
  static readonly ELEMENT_NODE = 1;
  static readonly TEXT_NODE = 3;
  static readonly COMMENT_NODE = 8;

  selector!: unknown;
  name!: string;
  parent!: AgentNode | undefined;
  nextSibling!: AgentNode | undefined;
  /**
   * 原样存一份 attribute，只有 `class` / `style` 会参与渲染。
   *
   * `class` / `style` 每次都是整体重设一个串（`setAttribute` 就是这个语义），
   * 没有单个 token / 声明的增删，所以不切割、不解析，存什么就拼什么。
   */
  attribute: Record<string, string> = {};
  /**
   * 动态 class（`Renderer2.addClass` / `removeClass`：`[class]`、`[class.x]`、
   * `class="a {{x}}"` 插值）。
   *
   * 与 `attribute.class`（模板静态 class / 指令 host class / `[attr.class]`）
   * 各自存自己的：动态那半是逐个 token 增删，属性那半每次整体重设一个串，
   * 两边只在 {@link classString} 见一次面。
   *
   * 标签改写标记（`tag-name-div` 那种）不在这里：那是编译期烘进 wxml 的
   * 字面量，运行时压根不知道映射表。
   */
  classList = new Set<string>();
  /** 动态 style（`setStyle` / `removeStyle`），与 {@link classList} 对称 */
  style: Record<string, string> = {};
  property: Record<string, unknown> = {};
  value!: string;
  children: AgentNode[] = [];
  listener: Record<string, Function> = {};

  /**
   * 路径式 setData 用：本节点相对「所属 MP 实例数据根」的 dotted 前缀。
   *
   * 例：`nodeList[3]`、`nodeList[5][2].nodeList[1]`
   *
   * 由 `lViewToWXView` 在序列化时顺手打上——它本来就要遍历
   * `lView[HEADER_OFFSET .. bindingStartIndex]` 并看到每个节点，
   * 所以打标签是零额外遍历成本。
   *
   * 数组下标用方括号，与 `diffNodeData` 已跑通的 key 形式一致。
   *
   * `null` 表示还没被序列化过（路径未知），此时渲染器会退回全量刷新。
   */
  __pathPrefix: string | null = null;
  /**
   * 路径式 setData 用：`setData` 的目标（小程序组件/页面实例）。
   * 与 `__pathPrefix` 同时由序列化过程打上。
   */
  __mpRef: unknown = null;
  /** `suffix -> 完整 setData key` 缓存，避免每次变更重复拼串 */
  __keyCache: Record<string, string> = {};

  /**
   * 可查询 class，空串表示「本节点不可查询」。
   *
   * 由 `lViewToWXView` 在序列化时打上，且**只给模板上带 `#` 的节点**——
   * 没 `#` 的节点没有查询需求，多发一份纯属浪费 setData 体积。
   *
   * 取值是 `__pathPrefix` 的下标序列：`nodeList[4][1].nodeList[0]` →
   * `__ar-4-1-0`。用全路径而不是视图内局部下标，是因为内嵌模板被
   * `<template is>` 内联进**同一棵** shadow tree，局部下标会内外撞车；
   * 全路径顺带让 `@for` 的多实例天然不撞（视图序号就在路径里）。
   *
   * 它和所标注的节点出自同一次遍历、同一次 setData，所以不可能对不上。
   */
  __refClass = '';

  constructor(public type: 'element' | 'comment' | 'text') {}
  appendChild(child: AgentNode) {
    const lastChildIndex = this.children.length - 1;
    this.children.push(child);
    child.parent = this;
    if (lastChildIndex > -1) {
      this.children[lastChildIndex].nextSibling = child;
    }
  }
  setParent(parent: AgentNode) {
    const oldParent = this.parent;
    if (oldParent) {
      const index = oldParent.children.findIndex((item) => item === this);
      if (index === -1) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        throw new Error('没有在之前的父级上找到该节点' + this);
      }
      oldParent.children.splice(index, 1);
    }
    parent.appendChild(this);
  }
  insertBefore(newChild: AgentNode, refChild?: AgentNode | null) {
    /**
     * `refChild` 为空就是追加 —— DOM 的既定语义（`Node.insertBefore(x, null)`
     * 等价于 `appendChild(x)`），不是异常。
     *
     * Angular 的 i18n 插入路径就依赖这一点：`ɵɵi18nStart` 传给
     * `nativeInsertBefore` 的 `insertInFrontOf`，在父节点不是
     * `ElementContainer` 时恒为 `null`。
     */
    if (refChild == null) {
      this.appendChild(newChild);
      return;
    }
    const refIndex = this.children.findIndex((item) => item === refChild);
    if (refIndex === -1) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      throw new Error('未找到引用子节点' + refChild);
    }

    newChild.parent = this;
    if (refIndex === 0) {
      newChild.nextSibling = refChild;
    } else {
      this.children[refIndex - 1].nextSibling = newChild;
      newChild.nextSibling = refChild;
    }
    this.children.splice(refIndex, 0, newChild);
  }
  removeChild(child: AgentNode) {
    const index = this.children.findIndex((item) => item === child);
    if (index === 0) {
      this.children.shift();
    } else if (index + 1 === this.children.length) {
      this.children[index - 1].nextSibling = undefined;
      this.children.pop();
    } else {
      this.children[index - 1].nextSibling = this.children[index + 1];
      this.children.splice(index, 1);
    }
    child.nextSibling = undefined;
    child.parent = undefined;
  }
  /**
   * 两个 class 来源的**唯一**合并点：动态那半 + 属性那串，各自原样。
   *
   * 单独抽出来是因为 `addClass`/`removeClass` 这类**增量** API
   * 最终要发的是整个聚合串——路径式 setData 需要能只重算这一个字段，
   * 而不是造一整个 `toView()` 对象。
   */
  classString(): string {
    return clsx([...this.classList], this.attribute.class);
  }

  /**
   * 两个 style 来源的**唯一**合并点，与 {@link classString} 同构。
   *
   * 属性那半在前、动态那半在后：CSS 里同一个声明块内后写的赢，而 Angular
   * 就是先写静态 style 属性、后写动态绑定，这个顺序就是浏览器里的生效顺序。
   */
  styleString(): string {
    const dynamic = Object.entries(this.style)
      .map(([prop, value]) => `${prop}:${value}`)
      .join(';');
    // Angular 递过来的静态 style 串自带尾分号，不剔掉会拼出 `;;`
    const attr = (this.attribute.style ?? '').replace(/;+$/, '');
    return [attr, dynamic].filter((part) => !!part).join(';');
  }

  /**
   * 以本节点为起点开一条小程序节点查询，语义对齐原生 `select`。
   *
   * 返回的就是原生 `NodesRef`，后面 `.boundingClientRect()` / `.exec()`
   * 怎么拼由调用方决定。作用域自动落在**渲染本节点的那个 MP 实例**上
   * （子组件的 host 元素属于父模板，所以那时是父实例）。
   *
   * 返回 `null` 的情况：
   * - 模板上没写 `#`（编译期就没发这个 class）
   * - 还没序列化过，或 lView 还没 link 上 MP 实例（子组件的 link 是异步的）
   * - text / comment 节点（wxml 里是裸插值或注释锚点，没有可选中元素）
   *
   * class 会随结构变更而变（`ng-for` 插一个，后面节点整体位移），
   * 所以**每次都要现调 `find()`**，不要把 class 字符串存下来复用。
   */
  find(): WechatMiniprogram.NodesRef | null {
    if (!this.__refClass || !this.__mpRef) {
      return null;
    }
    return (this.__mpRef as QueryHost)
      .createSelectorQuery()
      .select(`.${this.__refClass}`);
  }

  toView(): MPTextData | MPElementData {
    if (this.type === 'text') {
      return { value: this.value };
    } else {
      const cls = this.classString();
      const style = this.styleString();
      return {
        /**
         * 空串不发。
         *
         * 绝大多数元素从头到尾没碰过 class / style，发一个空串就是白占
         * setData 体积（也是每轮全量 diff 白比一次）。真有人改到了，
         * `emitClass` / `emitStyle` 会把这个 key 补上去，不依赖首次就发。
         *
         * key 集合因此是「按节点稳定」的：同一个节点要么一直有、要么
         * 从无到有，不会在两轮之间反复抖，`diffNodeData` 的折叠判定不受影响。
         */
        ...(cls ? { class: cls } : null),
        // 没 `#` 的节点连这个 key 都不发，wxml 那侧读不到就渲染成空
        ...(this.__refClass ? { refClass: this.__refClass } : null),
        ...(style ? { style: style } : null),
        property: { ...this.property },
        // class / style 已由上面两个字段汇总，原样再塞一份纯属浪费 setData 体积
        attribute: Object.fromEntries(
          Object.entries(this.attribute).filter(
            ([key]) => key !== 'class' && key !== 'style',
          ),
        ),
      };
    }
  }
}

/**
 * 把 `AgentNode` 挂上全局能力表，供编译期重定义后的 `Node` 指过来。
 *
 * ## 为什么是「挂表 + define」而不是 `globalThis.Node = AgentNode`
 *
 * 小程序里没有 `Node`，也不需要有个全局叫这个名字。`buildPlatformDefine`
 * 已经把 `Node` 这个标识符在编译期换成 `<平台>.AgentNode`（见
 * `builder/vite/index.ts`），运行时压根不存在 `Node`，所以这里只需要把
 * `AgentNode` 放进能力表即可——不去占一个本不存在的浏览器全局名。
 *
 * 和 `AbortController` 是同一套两步：define 负责把裸引用指过去，表里
 * 必须得有值，缺一步就是 undefined。
 *
 * 这里的 `globalThis` 会被 define 换成同一个能力表，所以两边天然对齐。
 * 没跑过 define 的环境（vitest 直连库源码）里这句只是往真 globalThis 上
 * 挂个属性，`Node` 由测试环境自己接上，见 `test-util/init-env.ts`。
 */
(globalThis as Record<string, unknown>).AgentNode = AgentNode;
