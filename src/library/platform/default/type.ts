import { ComponentRef, Type } from '@angular/core';
import type {
  NodePath,
  MiniProgramComponentInstance,
  NgCompileComponent,
} from 'angular-miniprogram/platform/type';

export abstract class MiniProgramCoreBase<T> {
  // todo 类型
  static componentRegistry(component: Type<any>, options: any) {}
  static pageStartup(module: Type<any>, component: Type<any>, options: any) {}
  static linkNgComponentWithPath(
    this: MiniProgramComponentInstance,
    list: NodePath
  ) {}
  static linkNgComponentWithPage(
    this: MiniProgramComponentInstance,
    componentRef: ComponentRef<any>
  ) {}
  static listenerEvent: (
    component: NgCompileComponent
  ) => Record<string, Function>;
  static pageStatus: {
    destroy: (this: MiniProgramComponentInstance) => void;
    attachView: (this: MiniProgramComponentInstance) => void;
    detachView: (this: MiniProgramComponentInstance) => void;
  };
}
