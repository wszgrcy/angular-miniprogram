import { Renderer2 } from '@angular/core';

class NoopNode {}
export class WeixinMiniProgramRenderer implements Renderer2 {
  constructor() {}
  data = Object.create(null);
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
  appendChild() {}
  insertBefore() {}
  removeChild() {}
  selectRootElement(
    selectorOrNode: string | unknown,
    preserveContent?: boolean
  ) {
    return new NoopNode();
  }
  parentNode(node: unknown) {
    return new NoopNode();
  }
  nextSibling() {}
  setAttribute(
    el: unknown,
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
  setValue(node: unknown, value: string) {}
  listen() {
    return () => {};
  }
}
