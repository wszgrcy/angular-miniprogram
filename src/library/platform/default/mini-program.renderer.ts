import { Renderer2, RendererStyleFlags2 } from '@angular/core';
import { AgentNode } from './renderer-node';

export class MiniProgramRenderer implements Renderer2 {
  root!: AgentNode;
  inputRoot = this.element;
  constructor(private element: AgentNode | undefined, private def: unknown) {}
  data = Object.create(null);
  destroy() {}
  createElement(name: string, namespace?: string | null) {
    const element = new AgentNode('element');
    element.name = name;
    element.classList.add(`tag-name-${name}`);
    return element;
  }
  createComment(value: string) {
    const comment = new AgentNode('comment');
    comment.value = value;
    return comment;
  }
  createText(value: string) {
    const text = new AgentNode('text');
    text.value = value;
    return text;
  }
  destroyNode() {}
  appendChild(parent: AgentNode, newChild: AgentNode) {
    parent.children.push(newChild);
    newChild.parent = parent;
  }
  insertBefore(
    parent: AgentNode,
    newChild: AgentNode,
    refChild: AgentNode,
    isMove?: boolean
  ) {
    if (isMove) {
      // todo 应该没用
    }
    parent.insertBefore(newChild, refChild);
  }
  removeChild(parent: AgentNode, oldChild: AgentNode, isHostElement?: boolean) {
    if (isHostElement) {
      // todo 应该没用
    }
    parent.removeChild(oldChild);
  }
  selectRootElement(
    selectorOrNode: string | unknown,
    preserveContent?: boolean
  ) {
    const root = new AgentNode('element');
    root.selector = selectorOrNode;
    this.root = root;
    return root;
  }
  parentNode(node: AgentNode) {
    return node.parent;
  }
  nextSibling(node: AgentNode) {
    return node.nextSibling;
  }
  setAttribute(
    el: AgentNode,
    name: string,
    value: string,
    namespace?: string | null
  ) {
    el.attribute[name] = value;
  }
  removeAttribute(el: AgentNode, name: string, namespace?: string | null) {
    delete el.attribute[name];
  }
  addClass(el: AgentNode, name: string) {
    el.classList.add(name);
  }
  removeClass(el: AgentNode, name: string) {
    el.classList.delete(name);
  }
  setStyle(
    el: AgentNode,
    style: string,
    value: string,
    flags?: RendererStyleFlags2
  ) {
    el.style[style] = value;
  }
  removeStyle(el: AgentNode, style: string, flags?: RendererStyleFlags2) {
    delete el.style[style];
  }
  setProperty(el: AgentNode, name: string, value: unknown) {
    el.property[name] = value;
  }
  setValue(node: AgentNode, value: string) {
    node.value = value;
  }
  listen(
    target: AgentNode,
    eventName: string,
    callback: (event: WechatMiniprogram.BaseEvent) => boolean | void
  ) {
    if (!(target instanceof AgentNode)) {
      throw new Error('不支持其他类型监听');
    }
    target.listener[eventName] = callback;
    return () => {};
  }
}
