export class NoopNode {
  selector!: any;
  name!: string;
  parent!: NoopNode;
  nextSibling!: NoopNode | undefined;
  attribute: Record<string, string> = {};
  style: Record<string, string> = {};
  property: Record<string, string> = {};
  classList = new Set<string>();
  value!: string;
  children: NoopNode[] = [];
  constructor(public type: 'element' | 'comment' | 'text') {}
  addChild(child: NoopNode) {
    const preChildIndex = this.children.length - 1;
    const pos = this.children.push(child);
    child.parent = this;
    if (preChildIndex > -1) {
      this.children[pos].nextSibling = child;
    }
  }
  setParent(parent: NoopNode) {
    const oldParent = this.parent;
    if (oldParent) {
      const index = oldParent.children.findIndex((item) => item === this);
      if (index === -1) {
        throw new Error('没有在之前的父级上找到该节点' + this);
      }
      oldParent.children.splice(index, 1);
    }
    parent.addChild(this);
  }
  insertBefore(newChild: NoopNode, refChild: NoopNode) {
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
  removeChild(child: NoopNode) {
    const index = this.children.findIndex((item) => item === child);
    if (index === 0) {
      child.nextSibling = undefined;
    } else if (index + 1 === this.children.length) {
      child.nextSibling = undefined;
      this.children[index - 1].nextSibling = undefined;
    } else {
      child.nextSibling = undefined;
      this.children[index - 1].nextSibling = this.children[index + 1];
    }
    this.children.splice(index, 1);
  }
}
