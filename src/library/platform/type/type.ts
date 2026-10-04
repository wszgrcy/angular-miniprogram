/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentRef, Injector, Type, ViewRef } from '@angular/core';
import type { LView } from './internal-type';

export interface AppOptions {
  /** 启动一个 standalone 组件作为页面 */
  __ngStartPage<C>(
    component: Type<C>,
    miniProgramComponentInstance: any,
  ): ComponentRef<C>;
  __ngStartPageResolve: Function;
  __ngStartPagePromise: Promise<void>;
}

export interface MiniProgramComponentVariable<NG_COMPONENT_INSTANCE = unknown> {
  /** @public */
  __ngComponentInstance: NG_COMPONENT_INSTANCE;
  /** page使用 */
  __ngComponentHostView: ViewRef;
  __ngComponentInjector: Injector;
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
  /**
   * 运行时模板名。无名字时用 `null`，**不能用 `undefined`**
   * —— 微信 `setData` 对路径式 key 上的 `undefined` 直接拒绝，
   * 会让整个 setData 调用失败、界面冻结。
   * 详见 `component-template-hook.factory.ts` 里的推导注释。
   */
  __templateName: string | null;
  nodePath: NodePath;
  index: number;
  hasLoad?: boolean;
}
export interface MPElementData {
  class: string;
  style: string;
  property: Record<string, any>;
  /**
   * `setAttribute` 那侧的静态属性，剔掉 class / style（已由上面两个字段承载）。
   *
   * 只为静态 `i18n-<attr>` 存在：那条属性的译文由 Angular 建元素时
   * setAttribute 写进来，wxml 得能从数据里读到它。
   */
  attribute: Record<string, any>;
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
