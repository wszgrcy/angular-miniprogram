import type {
  MPElementData,
  MPTextData,
} from 'angular-miniprogram/platform/type';

export class AgentNode {
  selector!: string | unknown;
  name!: string;
  parent!: AgentNode | undefined;
  nextSibling!: AgentNode | undefined;
  attribute: Record<string, string> = {};
  style: Record<string, string> = {};
  property: Record<string, unknown> = {};
  classList = new Set<string>();
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
        throw new Error('没有在之前的父级上找到该节点' + this);
      }
      oldParent.children.splice(index, 1);
    }
    parent.appendChild(this);
  }
  insertBefore(newChild: AgentNode, refChild: AgentNode) {
    const refIndex = this.children.findIndex((item) => item === refChild);
    if (refIndex === -1) {
      throw new Error('未找到引用子节点' + refChild);
    }

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
   * 聚合后的 class 串。
   *
   * 单独抽出来是因为 `addClass`/`removeClass` 这类**增量** API
   * 最终要发的是整个聚合串——路径式 setData 需要能只重算这一个字段，
   * 而不是造一整个 `toView()` 对象。
   */
  classString(): string {
    return (
      Array.from(this.classList).join(' ') +
      (this.attribute.class ? ' ' + this.attribute.class : '')
    );
  }

  /** 聚合后的 style 串，语义与 `toView()` 里的拼接逐字一致 */
  styleString(): string {
    return (
      Object.entries(this.style)
        .map(([style, value]) => `${style}:${value}`)
        .join(';') + (this.attribute.style ? ';' + this.attribute.style : '')
    );
  }

  toView(): MPTextData | MPElementData {
    if (this.type === 'text') {
      return { value: this.value };
    } else {
      return {
        class: this.classString(),
        style: this.styleString(),
        property: { ...this.property },
      };
    }
  }
}
