import { Injectable } from '@angular/core';
import { Subject, from, merge } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable()
export class ComponentFinderService<T = unknown> {
  private map = new Map<unknown, T>();
  private subject = new Subject<[unknown, T]>();
  get(component: unknown) {
    return merge(from(this.map), this.subject).pipe(
      filter((item) => item[0] === component),
      map((item) => item[1]),
      take(1)
    );
  }
  /** @internal */
  set(component: unknown, instance: T) {
    this.subject.next([component, instance]);
    return this.map.set(component, instance);
  }
  /** @internal */
  remove(component: unknown) {
    return this.map.delete(component);
  }
}
