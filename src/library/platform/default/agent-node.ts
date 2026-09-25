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
   * 脏标记 + 上次序列化缓存（#6 setData 记录式优化）。
   *
   * 之前每次刷新都对整棵树每个节点重新 toView()（大量临时对象）再深
   * diff。改为：节点变更时标脏，toView() 对未脏节点直接返回上次缓存的
   * 视图对象（引用相等），diff 遇到引用相同即跳过，只重序列化脏节点。
   *
   * 初始为 true：首次渲染必须完整序列化。
   */
  private dirty = true;
  private lastView?: MPTextData | MPElementData;
  constructor(public type: 'element' | 'comment' | 'text') {}
  /** 标记本节点已变更，下次 toView() 需重新序列化 */
  markDirty() {
    this.dirty = true;
  }
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
  toView(): MPTextData | MPElementData {
    // 未脏且已有缓存 → 直接复用同一对象，引用相等让上层 diff 跳过
    if (!this.dirty && this.lastView) {
      return this.lastView;
    }
    const view = this.computeView();
    this.lastView = view;
    this.dirty = false;
    return view;
  }
  private computeView(): MPTextData | MPElementData {
    if (this.type === 'text') {
      return { value: this.value };
    } else {
      return {
        class:
          Array.from(this.classList).join(' ') +
          (this.attribute.class ? ' ' + this.attribute.class : ''),

        style:
          Object.entries(this.style)
            .map(([style, value]) => `${style}:${value}`)
            .join(';') +
          (this.attribute.style ? ';' + this.attribute.style : ''),

        property: { ...this.property },
      };
    }
  }
}
