import { Injectable } from '@angular/core';

@Injectable()
export class ComponentFinderService<T> {
  private map = new Map<unknown, T>();
  get(component: unknown) {
    return this.map.get(component);
  }
  set(component: unknown, instance: T) {
    return this.map.set(component, instance);
  }
  remove(component: unknown) {
    return this.map.delete(component);
  }
}
