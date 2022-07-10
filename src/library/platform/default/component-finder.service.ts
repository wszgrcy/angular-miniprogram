import { Injectable } from '@angular/core';

@Injectable()
export class ComponentFinderService<T = unknown> {
  private map = new Map<unknown, T>();
  private mapPromise = new Map<unknown, Function>();
  async get(component: unknown) {
    if (this.map.has(component)) {
      return this.map.get(component);
    }
    let fn: Function;
    const promise = new Promise((res) => {
      fn = res;
    });
    this.mapPromise.set(component, fn!);
    return promise.then((result) => {
      this.mapPromise.delete(component);
      return result;
    });
  }
  /** @internal */
  set(component: unknown, instance: T): void {
    if (this.mapPromise.has(component)) {
      this.mapPromise.get(component)!();
    }
    this.map.set(component, instance);
  }
  /** @internal */
  remove(component: unknown) {
    return this.map.delete(component);
  }
}
