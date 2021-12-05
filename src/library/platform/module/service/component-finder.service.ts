import { Injectable, Type } from '@angular/core';

@Injectable()
export class ComponentFinderService<T> {
  private map = new Map<Type<any>, T>();
  get(component: Type<any>) {
    return this.map.get(component);
  }
  set(component: Type<any>, instance: T) {
    return this.map.set(component, instance);
  }
  remove(component: Type<any>) {
    return this.map.delete(component);
  }
}
