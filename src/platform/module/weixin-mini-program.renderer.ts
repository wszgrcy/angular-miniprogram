import { Renderer2, RendererStyleFlags2 } from '@angular/core';
import { NoopNode } from './renderer-node';

export class WeixinMiniProgramRenderer implements Renderer2 {
  root!: NoopNode;
  inputRoot = this.element;
  constructor(
    private element: NoopNode | undefined,
    private lview: any,
    private index: number
  ) {
    console.log('---初始化---', element, lview);
  }
  data = Object.create(null);
  destroy() {}
  createElement(name: string, namespace?: string | null) {
    console.log(this.index, '创建元素', name, namespace);
    const element = new NoopNode('element');
    element.name = name;
    return element;
  }
  createComment(value: string) {
    console.log('创建评论', value);
    const comment = new NoopNode('comment');
    comment.value = value;
    return comment;
  }
  createText(value: string) {
    console.log('创建文本');
    const text = new NoopNode('text');
    text.value = value;
    return text;
  }
  destroyNode() {
    console.log('销毁节点');
  }
  appendChild(parent: NoopNode, newChild: NoopNode) {
    console.log('添加子', parent, newChild);
    parent.children.push(newChild);
    newChild.parent = parent;
  }
  insertBefore(
    parent: NoopNode,
    newChild: NoopNode,
    refChild: NoopNode,
    isMove?: boolean
  ) {
    console.log('插入之前', parent, newChild, refChild, isMove);

    let index: number;
    index = parent.children.findIndex((item) => (item = refChild));
    parent.children.splice(index, 0, newChild);
  }
  removeChild(parent: NoopNode, oldChild: NoopNode, isHostElement?: boolean) {
    console.log('移除子', parent, oldChild, isHostElement);

    const index = parent.children.findIndex((item) => item === oldChild);
    parent.children.splice(index, 1);
  }
  selectRootElement(
    selectorOrNode: string | unknown,
    preserveContent?: boolean
  ) {
    console.log(this.index, '选择根元素', selectorOrNode, preserveContent);

    const root = new NoopNode('element');
    root.selector = selectorOrNode;
    this.root = root;
    return root;
  }
  parentNode(node: NoopNode) {
    console.log('父节点', node);

    return node.parent;
  }
  nextSibling(node: NoopNode) {
    console.log('下一个兄弟节点', node);

    return node.nextSibling;
  }
  setAttribute(
    el: NoopNode,
    name: string,
    value: string,
    namespace?: string | null
  ) {
    console.log('设置属性', el, name, value, namespace);

    el.attribute[name] = value;
  }
  removeAttribute(el: NoopNode, name: string, namespace?: string | null) {
    console.log('移除属性', el);
    delete el.attribute[name];
  }
  addClass(el: NoopNode, name: string) {
    console.log('添加类', el, name);
    el.classList.add(name);
  }
  removeClass(el: NoopNode, name: string) {
    console.log('移除类', el, name);
    el.classList.delete(name);
  }
  setStyle(
    el: NoopNode,
    style: string,
    value: any,
    flags?: RendererStyleFlags2
  ) {
    console.log('设置样式', el, style, value, flags);
    el.style[style] = value;
  }
  removeStyle(el: NoopNode, style: string, flags?: RendererStyleFlags2) {
    console.log('移除样式', el, style, flags);
    delete el.style[style];
  }
  setProperty(el: NoopNode, name: string, value: any) {
    console.log('设置属性', name, value);
    el.property[name] = value;
  }
  setValue(node: NoopNode, value: string) {
    console.log('设置值', node, value);
    node.value = value;
  }
  listen(
    target: 'window' | 'document' | 'body' | any,
    eventName: string,
    callback: (event: any) => boolean | void
  ) {
    console.log('监听', target, eventName, callback);
    return () => {};
  }
}
