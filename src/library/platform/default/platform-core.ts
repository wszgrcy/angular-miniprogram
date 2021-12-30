import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentRef,
  NgZone,
  Type,
} from '@angular/core';
import type {
  AppOptions,
  LView,
  MiniProgramComponentInstance,
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
  NodePath,
} from 'angular-miniprogram/platform/type';
import { AgentNode } from './agent-node';
import { ComponentFinderService } from './component-finder.service';
import 'miniprogram-api-typings';
import {
  INJECTOR,
  LVIEW_CONTEXT,
  cleanWhenDestroy,
  findCurrentElement,
  findCurrentLView,
  getInitValue,
  getPageLView,
  lViewLinkToMPComponentRef,
  removePageLinkLView,
  setLViewPath,
  updatePath,
} from './component-template-hook.factory';

export class MiniProgramCoreFactory {
  public MINIPROGRAM_GLOBAL = wx;
  public loadApp = <T>(app: T) => {
    App(app || {});
    const appInstance = getApp();
    return appInstance;
  };
  public getPageId(component: MiniProgramComponentInstance) {
    return component.getPageId();
  }
  protected eventPrefixList = [
    { listener: 'bind', prefix: 'bind' },
    { listener: 'catch', prefix: 'catch' },
    { listener: 'mutBind', prefix: 'mut-bind' },
    { listener: 'captureBind', prefix: 'capture-bind' },
    { listener: 'captureCatch', prefix: 'capture-catch' },
  ];
  protected getListenerEventMapping(prefix: string, name: string) {
    return [name, prefix + name];
  }

  protected linkNgComponentWithPath(
    mpComponentInstance: MiniProgramComponentInstance,
    list: NodePath
  ) {
    mpComponentInstance.__isLink = true;
    const rootLView: LView = getPageLView(this.getPageId(mpComponentInstance));
    const currentLView: LView = findCurrentLView(rootLView, list);
    const injector = currentLView[INJECTOR]!;
    mpComponentInstance.__lView = currentLView;
    mpComponentInstance.__ngComponentInstance = currentLView[LVIEW_CONTEXT];
    mpComponentInstance.__ngComponentInjector = injector;
    mpComponentInstance.__ngZone = injector.get(NgZone);
    const componentFinderService = injector.get(ComponentFinderService);
    componentFinderService.set(
      mpComponentInstance.__ngComponentInstance,
      mpComponentInstance
    );
    cleanWhenDestroy(currentLView, () => {
      componentFinderService.remove(mpComponentInstance.__ngComponentInstance);
    });
    setLViewPath(currentLView, list);
    lViewLinkToMPComponentRef(mpComponentInstance, currentLView);
    const initValue = getInitValue(currentLView);
    if (initValue) {
      mpComponentInstance.setData(updatePath(initValue, list));
    }
  }

  protected listenerEvent(component: Type<unknown>) {
    const _this = this;
    return this.eventPrefixList.reduce((pre: Record<string, Function>, cur) => {
      pre[cur.listener + 'Event'] = function (
        this: MiniProgramComponentInstance,
        event: WechatMiniprogram.BaseEvent
      ) {
        if (this.__lView) {
          const dataset = event.currentTarget?.dataset || event.target.dataset;
          const currentPath: NodePath = [
            ...(dataset.nodePath || []),
            dataset.nodeIndex,
          ];
          const nodePath = this.__completePath || [];
          const relativePath = currentPath.slice(nodePath.length);
          let el = findCurrentElement(this.__lView, relativePath) as AgentNode;
          if (!(el instanceof AgentNode)) {
            el = el[0];
            if (!(el instanceof AgentNode)) {
              throw new Error('查询代理节点失败');
            }
          }

          const eventName = event.type;
          _this
            .getListenerEventMapping(cur.prefix, eventName)
            .forEach((name) => {
              this.__ngZone.run(() => {
                if (el.listener[name]) {
                  el.listener[name](event);
                }
              });
            });
        } else {
          throw new Error('未绑定lView');
        }
      };

      return pre;
    }, {});
  }
  protected pageStatus = {
    destroy: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentDestroy) {
        this.__ngComponentDestroy();
      }
    },
    attachView: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentInjector && this.__isDetachView) {
        const applicationRef = this.__ngComponentInjector.get(ApplicationRef);
        applicationRef.attachView(this.__ngComponentHostView);
        this.__isDetachView = false;
      }
    },
    detachView: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentInjector) {
        this.__isDetachView = true;
        const applicationRef = this.__ngComponentInjector.get(ApplicationRef);
        applicationRef.detachView(this.__ngComponentHostView);
      }
    },
  };
  protected linkNgComponentWithPage(
    mpComponentInstance: MiniProgramComponentInstance,
    componentRef: ComponentRef<unknown>
  ) {
    mpComponentInstance.__isLink = true;
    mpComponentInstance.__ngComponentHostView = componentRef.hostView;
    mpComponentInstance.__ngComponentInstance = componentRef.instance;
    mpComponentInstance.__ngComponentInjector = componentRef.injector;
    mpComponentInstance.__ngZone = componentRef.injector.get(NgZone);
    mpComponentInstance.__ngComponentDestroy = () => {
      componentRef.destroy();
      removePageLinkLView(this.getPageId(mpComponentInstance));
    };
    mpComponentInstance.__ngComponentInjector
      .get(ChangeDetectorRef)
      .detectChanges();
    const lView = getPageLView(this.getPageId(mpComponentInstance)) as LView;
    const initValue = getInitValue(lView);
    mpComponentInstance.setData(initValue!);
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngComponentInstance = lView[LVIEW_CONTEXT];
  }

  public pageStartup = (module: Type<unknown>, component: Type<unknown>) => {
    const _this = this;
    const options = this.getPageOptions(component) || {};
    return Page({
      ...options,
      ...this.listenerEvent(component),
      data: { hasLoad: false },
      onLoad: function (this: MiniProgramComponentInstance, query) {
        const app = getApp<AppOptions>();
        const componentRef = app.__ngStartPage(
          module,
          component,
          this
        ).componentRef;
        _this.linkNgComponentWithPage(this, componentRef);
        if (options.onLoad) {
          return options.onLoad.bind(this)(query);
        }
      },
      onHide: async function (this: MiniProgramComponentInstance) {
        if (options.onHide) {
          await options.onHide.bind(this)();
        }
        _this.pageStatus.detachView.bind(this)();
      },
      onUnload: async function (this: MiniProgramComponentInstance) {
        if (options.onUnload) {
          await options.onUnload.bind(this)();
        }
        _this.pageStatus.destroy.bind(this)();
      },
      onShow: async function (this: MiniProgramComponentInstance) {
        if (options.onShow) {
          await options.onShow.bind(this)();
        }
        _this.pageStatus.attachView.bind(this)();
      },
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected addNgComponentLinkLogic(config: any) {
    const _this = this;
    config.properties = {
      nodePath: {
        type: null,
        observer: function (
          this: MiniProgramComponentInstance,
          list: NodePath
        ) {
          if (this.__isLink) {
            return;
          }
          if (typeof list === 'string') {
            list = JSON.parse(list);
          }
          this.__nodePath = list || [];
          if (typeof this.__nodeIndex !== 'undefined') {
            this.__completePath = [...this.__nodePath, this.__nodeIndex];
            _this.linkNgComponentWithPath(this, this.__completePath);
          }
        },
      },
      nodeIndex: {
        type: null,
        observer: function (this: MiniProgramComponentInstance, index: number) {
          if (this.__isLink) {
            return;
          }
          if (typeof index === 'string') {
            index = parseInt(index, 10);
          }
          this.__nodeIndex = index;
          if (typeof this.__nodePath !== 'undefined') {
            this.__completePath = [...this.__nodePath, this.__nodeIndex];
            _this.linkNgComponentWithPath(this, this.__completePath);
          }
        },
      },
    };
    return config;
  }
  public componentRegistry = (component: Type<unknown>) => {
    const options = this.getComponentOptions(component) || {};
    let config: WechatMiniprogram.Component.Options<{}, {}, {}> = {
      ...options,
      data: { hasLoad: false },
      options: { ...options?.options, multipleSlots: true },
      methods: {
        ...this.listenerEvent(component),
      },
    };

    config = this.addNgComponentLinkLogic(config);
    return Component(config);
  };

  protected getPageOptions(component: Type<unknown> & MiniProgramPageOptions) {
    type OptionsKey = keyof WechatMiniprogram.Page.Options<{}, {}>;
    const options: WechatMiniprogram.Page.Options<{}, {}> =
      component.mpPageOptions;
    if (options) {
      for (const key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          const element = options[key as OptionsKey];
          if (element instanceof Function) {
            options[key as OptionsKey] = function (
              this: MiniProgramComponentInstance,
              ...args: unknown[]
            ) {
              return (element as Function).bind(this.__ngComponentInstance)(
                ...args
              );
            };
          }
        }
      }
    }
    return options;
  }
  protected getComponentOptions(
    component: Type<unknown> & MiniProgramComponentOptions
  ) {
    type PageLifetimesKey = keyof WechatMiniprogram.Component.PageLifetimes;

    const options: WechatMiniprogram.Component.Options<{}, {}, {}> =
      component.mpComponentOptions;
    if (options) {
      const pageLifetimes = options.pageLifetimes;
      for (const key in pageLifetimes) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          const element = pageLifetimes[key as PageLifetimesKey];
          if (element instanceof Function) {
            pageLifetimes[key as PageLifetimesKey] = function (
              this: MiniProgramComponentInstance,
              ...args: unknown[]
            ) {
              return (element as Function).bind(this.__ngComponentInstance)(
                ...args
              );
            };
          }
        }
      }

      type LifetimesKey =
        keyof WechatMiniprogram.Component.Lifetimes['lifetimes'];
      const lifetimes = options.lifetimes;
      for (const key in lifetimes) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          const element = lifetimes[key as LifetimesKey];
          if (element instanceof Function) {
            lifetimes[key as LifetimesKey] = function (
              this: MiniProgramComponentInstance,
              ...args: unknown[]
            ) {
              return (element as Function).bind(this.__ngComponentInstance)(
                ...args
              );
            };
          }
        }
      }
    }
    return options;
  }
}

export const MiniProgramCore = new MiniProgramCoreFactory();
