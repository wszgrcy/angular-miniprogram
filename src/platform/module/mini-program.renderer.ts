import { Renderer2, RendererStyleFlags2 } from '@angular/core';
import { AgentNode } from './renderer-node';

export class MiniProgramRenderer implements Renderer2 {
  root!: AgentNode;
  inputRoot = this.element;
  constructor(
    private element: AgentNode | undefined,
    private def: any,
    private index: number
  ) {
    // console.log('---初始化---', element, def);
  }
  data = Object.create(null);
  destroy() {}
  createElement(name: string, namespace?: string | null) {
    // console.log(this.index, '创建元素', name, namespace);
    const element = new AgentNode('element');
    element.name = name;
    element.classList.add(`tag-name-${name}`);
    return element;
  }
  createComment(value: string) {
    // console.log('创建评论', value);
    const comment = new AgentNode('comment');
    comment.value = value;
    return comment;
  }
  createText(value: string) {
    // console.log('创建文本');
    const text = new AgentNode('text');
    text.value = value;
    return text;
  }
  destroyNode() {
    // console.log('销毁节点');
  }
  appendChild(parent: AgentNode, newChild: AgentNode) {
    // console.log('添加子', parent, newChild);
    parent.children.push(newChild);
    newChild.parent = parent;
  }
  insertBefore(
    parent: AgentNode,
    newChild: AgentNode,
    refChild: AgentNode,
    isMove?: boolean
  ) {
    // console.log('插入之前', parent, newChild, refChild, isMove);
    if (isMove) {
      console.log('移动?');
    }
    parent.insertBefore(newChild, refChild);
  }
  removeChild(parent: AgentNode, oldChild: AgentNode, isHostElement?: boolean) {
    // console.log('移除子', parent, oldChild, isHostElement);
    if (isHostElement) {
      console.log('是Host', oldChild);
    }
    parent.removeChild(oldChild);
  }
  selectRootElement(
    selectorOrNode: string | unknown,
    preserveContent?: boolean
  ) {
    // console.log(this.index, '选择根元素', selectorOrNode, preserveContent);

    const root = new AgentNode('element');
    root.selector = selectorOrNode;
    this.root = root;
    return root;
  }
  parentNode(node: AgentNode) {
    // console.log('父节点', node);

    return node.parent;
  }
  nextSibling(node: AgentNode) {
    // console.log('下一个兄弟节点', node);

    return node.nextSibling;
  }
  setAttribute(
    el: AgentNode,
    name: string,
    value: string,
    namespace?: string | null
  ) {
    // console.log('设置属性', el, name, value, namespace);

    el.attribute[name] = value;
  }
  removeAttribute(el: AgentNode, name: string, namespace?: string | null) {
    // console.log('移除属性', el);
    delete el.attribute[name];
  }
  addClass(el: AgentNode, name: string) {
    // console.log('添加类', el, name);
    el.classList.add(name);
  }
  removeClass(el: AgentNode, name: string) {
    // console.log('移除类', el, name);
    el.classList.delete(name);
  }
  setStyle(
    el: AgentNode,
    style: string,
    value: any,
    flags?: RendererStyleFlags2
  ) {
    // console.log('设置样式', el, style, value, flags);
    el.style[style] = value;
  }
  removeStyle(el: AgentNode, style: string, flags?: RendererStyleFlags2) {
    // console.log('移除样式', el, style, flags);
    delete el.style[style];
  }
  setProperty(el: AgentNode, name: string, value: any) {
    // console.log('设置属性', name, value);
    el.property[name] = value;
  }
  setValue(node: AgentNode, value: string) {
    // console.log('设置值', node, value);
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
    // console.log('---监听', target, eventName, callback);
    return () => {};
  }
}
