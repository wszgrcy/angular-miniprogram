/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ComponentRef,
  Injector,
  NgModuleRef,
  NgZone,
  Type,
  ViewRef,
} from '@angular/core';
import type { LView } from './internal-type';

export interface AppOptions {
  __ngStartPage<M, C>(
    module: Type<M>,
    component: Type<C>,
    miniProgramComponentInstance: any
  ): {
    componentRef: ComponentRef<C>;
    ngModuleRef: NgModuleRef<M>;
  };
  __ngStartPageResolve: Function;
  __ngStartPagePromise: Promise<void>;
}

export interface MiniProgramComponentVariable<NG_COMPONENT_INSTANCE = unknown> {
  /** @public */
  __ngComponentInstance: NG_COMPONENT_INSTANCE;
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
  /** @public 等待链接完成,用于Component组件的created周期使用等待,其他的直接使用__ngComponentInstance获得实例 */
  __waitLinkPromise: Promise<void>;
  /** @private */
  __waitLinkResolve: () => void;
  __lifeTimePromiseObject: Record<'onLoad' | 'onShow', Promise<void>>;
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
export type MiniProgramComponentInstance<NG_COMPONENT_INSTANCE = unknown> =
  MiniProgramComponentVariable<NG_COMPONENT_INSTANCE> &
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
