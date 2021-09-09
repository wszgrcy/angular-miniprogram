import { Renderer2 } from '@angular/core';
class NoopNode {}
export class WeixinMiniProgramRenderer implements Renderer2 {
  constructor() {}
  data: { [key: string]: any } = Object.create(null);
  destroy() {}
  createElement(name: string, namespace?: string | null) {
    return new NoopNode();
  }
  createComment(value: string) {
    return new NoopNode();
  }
  createText(value: string) {
    return new NoopNode();
  }
  destroyNode() {}
  appendChild(parent: any, newChild: any) {}
  insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean) {}
  removeChild() {}
  selectRootElement(selectorOrNode: string | any, preserveContent?: boolean) {
    return new NoopNode();
  }
  parentNode(node: any) {
    return new NoopNode();
  }
  nextSibling() {}
  setAttribute(
    el: any,
    name: string,
    value: string,
    namespace?: string | null
  ) {}
  removeAttribute() {}
  addClass() {}
  removeClass() {}
  setStyle() {}
  removeStyle() {}
  setProperty() {}
  setValue(node: any, value: string) {}
  listen() {
    return () => {};
  }
}
