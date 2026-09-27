import { Renderer2, RendererStyleFlags2 } from '@angular/core';
import { AgentNode } from './agent-node';
import {
  markStructuralChange,
  pushPathData,
} from './component-template-hook.factory';

export class MiniProgramRenderer implements Renderer2 {
  root!: AgentNode;
  constructor() {}
  data = Object.create(null);
  destroy() {}

  /**
   * 把一次「叶子写入」翻译成一条路径式 setData key。
   *
   * 前缀 `node.__pathPrefix` 与目标 `node.__mpRef` 由上一次全量序列化
   * （`lViewToWXView`）打上。拿不到前缀说明这个节点从没被序列化过，
   * 路径无从得知 —— 此时**强制走全量兜底**，绝不猜路径。
   *
   * 热路径成本：一次属性读 + 一次缓存查表（命中后不再拼串）。
   */
  private emit(node: AgentNode, suffix: string, value: unknown) {
    const prefix = node.__pathPrefix;
    if (!prefix || !node.__mpRef) {
      markStructuralChange();
      return;
    }
    let key = node.__keyCache[suffix];
    if (key === undefined) {
      key = `${prefix}.${suffix}`;
      node.__keyCache[suffix] = key;
    }
    pushPathData(node.__mpRef, key, value);
  }

  private emitClass(el: AgentNode) {
    this.emit(el, 'class', el.classString());
  }

  private emitStyle(el: AgentNode) {
    this.emit(el, 'style', el.styleString());
  }

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
    // 结构变更：容器内序号会漂移，其他节点的路径前缀随之失效 → 本周期走全量。
    // 注意「新建节点」必然经过这里，所以不存在「写到一个还没 stamp 的新节点」的窗口。
    markStructuralChange();
    parent.appendChild(newChild);
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
    markStructuralChange();
    if (parent) {
      parent.insertBefore(newChild, refChild);
    }
  }
  removeChild(parent: AgentNode, oldChild: AgentNode, isHostElement?: boolean) {
    if (isHostElement) {
      // todo 应该没用
    }
    markStructuralChange();
    if (parent) {
      parent.removeChild(oldChild);
    }
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
    // `toView()` 只把 attribute 里的 class / style 纳入渲染数据，
    // 其他 attribute 不进 nodeList，因此也不需要发。
    if (name === 'class') {
      this.emitClass(el);
    } else if (name === 'style') {
      this.emitStyle(el);
    }
  }
  removeAttribute(el: AgentNode, name: string, namespace?: string | null) {
    delete el.attribute[name];
    if (name === 'class') {
      this.emitClass(el);
    } else if (name === 'style') {
      this.emitStyle(el);
    }
  }
  addClass(el: AgentNode, name: string) {
    el.classList.add(name);
    this.emitClass(el);
  }
  removeClass(el: AgentNode, name: string) {
    el.classList.delete(name);
    this.emitClass(el);
  }
  setStyle(
    el: AgentNode,
    style: string,
    value: string,
    flags?: RendererStyleFlags2
  ) {
    el.style[style] = value;
    this.emitStyle(el);
  }
  removeStyle(el: AgentNode, style: string, flags?: RendererStyleFlags2) {
    delete el.style[style];
    this.emitStyle(el);
  }
  setProperty(el: AgentNode, name: string, value: unknown) {
    el.property[name] = value;
    this.emit(el, `property.${name}`, value);
  }
  setValue(node: AgentNode, value: string) {
    node.value = value;
    this.emit(node, 'value', value);
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
