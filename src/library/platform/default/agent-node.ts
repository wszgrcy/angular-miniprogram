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
  toView(): MPTextData | MPElementData {
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

        property: this.property,
      };
    }
  }
}
