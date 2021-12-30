/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ComponentRef,
  Injector,
  NgModuleRef,
  NgZone,
  Type,
  ViewRef,
} from '@angular/core';
import { LView } from './internal-type';

export interface AppOptions {
  __ngStartPage<M, C>(
    module: Type<M>,
    component: Type<C>,
    miniProgramComponentInstance: any
  ): {
    componentRef: ComponentRef<C>;
    ngModuleRef: NgModuleRef<M>;
  };
}

export interface MiniProgramComponentVariable {
  __ngComponentInstance: unknown;
  /** page使用 */
  __ngComponentHostView: ViewRef;
  __ngComponentInjector: Injector;
  __ngZone: NgZone;
  /** 小程序组件是否与lview链接成功 */
  __isLink: boolean;
  __lView: LView;
  __nodePath: NodePath;
  __nodeIndex: number;
  __isDetachView: boolean;
  __completePath: NodePath;
  __waitLinkPromise: Promise<void>;
  __waitLinkResolve: () => void;
}
export interface MiniProgramComponentMethod {
  __ngDestroy: () => void;
}

export interface MPView {
  nodeList: (MPView[] | MPElementData | MPTextData)[];
  __templateName: string | undefined;
  nodePath: NodePath;
  index: number;
  hasLoad?: boolean;
}
export interface MPElementData {
  class: string;
  style: string;
  property: Record<string, any>;
}

export interface MPTextData {
  value: string;
}

export type NodePath = ('directive' | number)[];
export interface MiniProgramComponentBuiltIn {
  getPageId(): string;
  setData(data: Partial<Record<string, any>>): void;
}
export type MiniProgramComponentInstance = MiniProgramComponentVariable &
  MiniProgramComponentMethod &
  MiniProgramComponentBuiltIn &
  MiniProgramPageOptions &
  MiniProgramComponentOptions;

export interface MiniProgramPageOptions {
  mpPageOptions?: any;
}
export interface MiniProgramComponentOptions {
  mpComponentOptions?: any;
}
