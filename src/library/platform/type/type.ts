/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  ComponentRef,
  Injector,
  NgModuleRef,
  Type,
  ViewRef,
} from '@angular/core';
import type { LView } from './internal-type';

export interface AppOptions {
  /** 启动一个 standalone 组件作为页面 */
  __ngStartPage<C>(
    component: Type<C>,
    miniProgramComponentInstance: any
  ): {
    componentRef: ComponentRef<C>;
  };
  /**
   * @deprecated 仍用于 `pageStartup(module, component)` 的 NgModule 启动方式，
   * 新代码请用 `bootstrapPage(StandaloneComponent)`。
   */
  __ngStartPageWithModule<M, C>(
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
  /** zoneless 变更检测调度器，取代原来的 `__ngZone` */
  __ngChangeDetectionScheduler: ChangeDetectionScheduler;
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
  /** @private */
  __lifeTimePromiseObject: Record<
    'onLoad' | 'onShow' | 'created',
    Promise<void>
  >;
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
