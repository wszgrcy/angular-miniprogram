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
   * `Node` 的 nodeType 常量。Angular 的 `walkIcuTree` / `applyCreateOpCodes`
   * 都会读它们，全局 `Node` 直接指到本类，所以常量挂在这里。
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
   * 每次都是整体重设一个串，不切割、不解析。
   */
  attribute: Record<string, string> = {};
  /**
   * 动态 class（`addClass` / `removeClass`）。与 `attribute.class` 各自存自己的：
   * 动态那半是逐个 token 增删，属性那半每次整体重设一个串，两边只在 {@link classString} 见一次面。
   */
  classList = new Set<string>();
  /** 动态 style（`setStyle` / `removeStyle`），与 {@link classList} 对称 */
  style: Record<string, string> = {};
  property: Record<string, unknown> = {};
  value!: string;
  children: AgentNode[] = [];
  listener: Record<string, Function> = {};

  /**
   * 路径式 setData 用：本节点相对「所属 MP 实例数据根」的 dotted 前缀，
   * 例 `nodeList[3]`、`nodeList[5][2].nodeList[1]`。由 `lViewToWXView` 序列化时打上。
   * `null` 表示还没被序列化过，此时渲染器退回全量刷新。
   */
  __pathPrefix: string | null = null;
  /** 路径式 setData 用：`setData` 的目标（小程序组件/页面实例）。 */
  __mpRef: unknown = null;
  /** `suffix -> 完整 setData key` 缓存，避免每次变更重复拼串 */
  __keyCache: Record<string, string> = {};

  /**
   * 可查询 class，空串表示本节点不可查询。由 `lViewToWXView` 只给模板上带 `#` 的节点打上。
   * 取值是 `__pathPrefix` 的下标序列：`nodeList[4][1].nodeList[0]` → `__ar-4-1-0`。
   * 用全路径而不是视图内局部下标，因为内嵌模板被内联进同一棵 shadow tree，局部下标会撞车。
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
    // `refChild` 为空就是追加（`insertBefore(x, null)` 等价于 `appendChild`），不是异常。
    // Angular 的 i18n 插入路径就依赖这一点
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
   * 两个 class 来源的唯一合并点：动态那半 + 属性那串，各自原样。
   * 路径式 setData 需要能只重算这一个字段，而不是造一整个 `toView()` 对象。
   */
  classString(): string {
    return clsx([...this.classList], this.attribute.class);
  }

  /**
   * 两个 style 来源的唯一合并点，与 {@link classString} 同构。
   * 属性那半在前、动态那半在后，与浏览器里的生效顺序一致。
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
   * 以本节点为起点开一条小程序节点查询，语义对齐原生 `select`，返回原生 `NodesRef`。
   * 作用域自动落在渲染本节点的那个 MP 实例上。
   * 返回 `null`：模板上没写 `#`、还没序列化过、或 text / comment 节点。
   * class 会随结构变更而变，所以每次都要现调 `find()`，不要存下来复用。
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
        // 空串不发：白占 setData 体积。真改到了 `emitClass` / `emitStyle` 会把 key 补上去
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
 * `buildPlatformDefine` 已经把 `Node` 这个标识符在编译期换成 `<平台>.AgentNode`，
 * 运行时压根不存在 `Node`，所以这里只需把 `AgentNode` 放进能力表。
 */
(globalThis as Record<string, unknown>).AgentNode = AgentNode;
