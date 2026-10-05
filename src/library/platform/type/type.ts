/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="miniprogram-api-typings" />
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

/**
 * `static mpPageOptions` 里真正会交给微信的定义段：页面生命周期全部保留
 * （除 `onLoad` 在 Angular 实例起来之后调，其余都是用户那份先跑），
 * 只有 `data` 被框架占用。
 */
export type MpPageOptions = Omit<
  WechatMiniprogram.Page.Options<{}, {}>,
  'data'
> &
  ThisType<WechatMiniprogram.Page.Instance<{}, {}>>;

export interface MiniProgramPageOptions {
  mpPageOptions?: MpPageOptions;
}

/**
 * `static mpComponentOptions` 里真正会交给微信的定义段。
 *
 * 只列框架原样透传的那几段。`data` / `properties` / `methods` 不在契约里，
 * 因为这三段在本架构里没有生产者：
 *
 * - 渲染数据全部由 Angular 侧 `setData` 下来（`nodeList` / `hasLoad`），
 *   模板又是 HTML 转换出来的，没有任何一行 wxml 会去读用户声明的字段；
 * - `properties` 那一段被框架占用为 lView 回连通道（`nodePath` /
 *   `nodeIndex`），而组件脱离 Angular 页面就没有 nodePath，`hasLoad`
 *   恒为 `false`，也就无法被原生页面当普通小程序组件用。
 *
 * `TIsPage` 为 `true`（组件即页面）时开放 `methods`：那条路上页面钩子
 * （`onShow` / `onHide` / `onUnload`）就落在 `methods` 里，框架会把用户
 * 写的那份排在前面。
 */
export type MpComponentOptions<TIsPage extends boolean = false> = Pick<
  MpComponentConfig<TIsPage>,
  MpOptionKey<TIsPage>
> &
  ThisType<
    WechatMiniprogram.Component.Instance<
      {},
      {},
      {},
      MpBehaviorIds,
      {},
      TIsPage
    >
  >;

/**
 * 框架最终交给 `Component()` 的完整配置单：用户那几段 + 框架自己补的
 * `data` / `properties` / `methods`。平台工厂子类拼配置时用这个。
 */
export type MpComponentConfig<TIsPage extends boolean = false> =
  WechatMiniprogram.Component.Options<{}, {}, {}, MpBehaviorIds, {}, TIsPage>;

/** 框架不碰、原样交给微信的那几段 */
type MpOptionKey<TIsPage extends boolean> =
  | 'lifetimes'
  | 'pageLifetimes'
  | 'behaviors'
  | 'relations'
  | 'observers'
  | 'options'
  | (TIsPage extends true ? 'methods' : never);

/**
 * `Options` 的 `TBehavior` 默认是 `[]`，直接拿默认值会让 `behaviors`
 * 只能写空数组；这里换成标识符数组，用户才能真的挂 behavior。
 */
type MpBehaviorIds = WechatMiniprogram.Behavior.Identifier[];

export interface MiniProgramComponentOptions<TIsPage extends boolean = false> {
  mpComponentOptions?: MpComponentOptions<TIsPage>;
}
