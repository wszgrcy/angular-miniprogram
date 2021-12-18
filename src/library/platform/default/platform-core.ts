import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentRef,
  NgZone,
  Type,
} from '@angular/core';
import { ComponentFinderService } from './component-finder.service';
import 'miniprogram-api-typings';
import type {
  LView,
  ComponentPath,
  MiniProgramComponentInstance,
  NgCompileComponent,
  AppOptions,
  MiniProgramPageOptions,
  MiniProgramComponentOptions,
} from 'angular-miniprogram/platform/type';

import {
  addDestroyFunction,
  cleanWhenDestroy,
  findCurrentElement,
  findCurrentLView,
  getInitValue,
  getLViewInjector,
  getPageLView,
  lViewLinkToMPComponentRef,
  LVIEW_CONTEXT,
  setLViewPath,
  updatePath,
} from './component-template-hook.factory';
import { AgentNode } from './renderer-node';

export class MiniProgramCoreFactory {
  public MINIPROGRAM_GLOBAL = (typeof wx === 'undefined'
    ? undefined
    : wx) as any as WechatMiniprogram.Wx;
  public loadApp = <T>(app: T) => {
    App(app || {});
    const appInstance = getApp();
    return appInstance;
  };
  public getPageId(component: MiniProgramComponentInstance) {
    return component.getPageId();
  }
  protected setComponentInstancePageId(
    component: MiniProgramComponentInstance
  ) {
    component.__getPageId = () => this.getPageId(component);
  }
  protected linkNgComponentWithPath(
    mpComponentInstance: MiniProgramComponentInstance,
    list: ComponentPath
  ) {
    mpComponentInstance.__isLink = true;
    let rootLView = getPageLView(this.getPageId(mpComponentInstance)) as LView;
    let currentLView = findCurrentLView(rootLView, list);
    cleanWhenDestroy(currentLView);
    setLViewPath(currentLView, list);
    const initValue = getInitValue(currentLView);
    if (initValue) {
      mpComponentInstance.setData(updatePath(initValue, list));
    }
    lViewLinkToMPComponentRef(mpComponentInstance, currentLView);
    mpComponentInstance.__lView = currentLView;
    mpComponentInstance.__ngComponentInstance = currentLView[LVIEW_CONTEXT];
    let injector = getLViewInjector(currentLView);
    mpComponentInstance.__ngComponentInjector = injector;
    mpComponentInstance.__ngZone = injector.get(NgZone);
    let componentFinderService = injector.get(ComponentFinderService);
    componentFinderService.set(
      mpComponentInstance.__ngComponentInstance,
      mpComponentInstance
    );
    addDestroyFunction(currentLView, () => {
      componentFinderService.remove(mpComponentInstance.__ngComponentInstance);
    });
    this.setComponentInstancePageId(mpComponentInstance);
  }

  protected listenerEvent(component: NgCompileComponent) {
    let extraMeta = component.ɵcmpExtraMeta;
    return extraMeta.listeners.reduce((pre: Record<string, Function>, cur) => {
      pre[cur.methodName] = function (
        this: MiniProgramComponentInstance,
        event: any
      ) {
        if (this.__lView) {
          let el = findCurrentElement(
            this.__lView,
            event.currentTarget?.dataset?.nodePath ||
              event.target.dataset.nodePath,
            event.currentTarget?.dataset?.nodeIndex ||
              event.target.dataset.nodeIndex
          ) as AgentNode;
          if (!(el instanceof AgentNode)) {
            el = el[0];
            if (!(el instanceof AgentNode)) {
              throw new Error('查询代理节点失败');
            }
          }
          cur.eventName.forEach((name) => {
            this.__ngZone.run(() => {
              el.listener[name](event);
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
        let applicationRef = this.__ngComponentInjector.get(ApplicationRef);
        applicationRef.attachView(this.__ngComponentHostView);
        this.__isDetachView = false;
      }
    },
    detachView: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentInjector) {
        this.__isDetachView = true;
        let applicationRef = this.__ngComponentInjector.get(ApplicationRef);
        applicationRef.detachView(this.__ngComponentHostView);
      }
    },
  };
  protected linkNgComponentWithPage(
    mpComponentInstance: MiniProgramComponentInstance,
    componentRef: ComponentRef<any>
  ) {
    mpComponentInstance.__ngComponentHostView = componentRef.hostView;
    mpComponentInstance.__ngComponentInstance = componentRef.instance;
    mpComponentInstance.__ngComponentInjector = componentRef.injector;
    mpComponentInstance.__ngZone = componentRef.injector.get(NgZone);
    mpComponentInstance.__ngComponentDestroy = () => {
      componentRef.destroy();
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
    this.setComponentInstancePageId(mpComponentInstance);
    mpComponentInstance.__isLink = true;
  }

  public pageStartup = (module: Type<any>, component: Type<any>) => {
    let self = this;
    let options = this.getPageOptions(component) || {};
    return Page({
      ...options,
      ...this.listenerEvent(component as any as NgCompileComponent),
      data: { hasLoad: false },
      onLoad: function (this: MiniProgramComponentInstance, query) {
        const app = getApp<AppOptions>();
        let componentRef = app.__ngStartPage(
          module,
          component,
          this
        ).componentRef;
        self.linkNgComponentWithPage(this, componentRef);
        if (options.onLoad) {
          options.onLoad.bind(this.__ngComponentInstance)(query);
        }
      },
      onHide: async function (this: MiniProgramComponentInstance) {
        if (options.onHide) {
          await options.onHide.bind(this.__ngComponentInstance)();
        }
        self.pageStatus.detachView.bind(this)();
      },
      onUnload: async function (this: MiniProgramComponentInstance) {
        if (options.onUnload) {
          await options.onUnload.bind(this.__ngComponentInstance)();
        }
        self.pageStatus.destroy.bind(this)();
      },
      onShow: async function (this: MiniProgramComponentInstance) {
        if (options.onShow) {
          await options.onShow.bind(this.__ngComponentInstance)();
        }
        self.pageStatus.attachView.bind(this)();
      },
    });
  };
  protected addNgComponentLinkLogic(config: any) {
    let self = this;
    config.properties = {
      componentPath: {
        type: null,
        observer: function (
          this: MiniProgramComponentInstance,
          list: ComponentPath
        ) {
          if (this.__isLink) {
            return;
          }
          if (typeof list === 'string') {
            list = JSON.parse(list);
          }
          this.__componentPath = list || [];
          if (typeof this.__nodeIndex !== 'undefined') {
            self.linkNgComponentWithPath(this, [
              ...this.__componentPath,
              this.__nodeIndex,
            ]);
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
          if (typeof this.__componentPath !== 'undefined') {
            self.linkNgComponentWithPath(this, [
              ...this.__componentPath,
              this.__nodeIndex,
            ]);
          }
        },
      },
    };
    return config;
  }
  public componentRegistry = (component: Type<any>) => {
    let options = this.getComponentOptions(component) || {};
    let config: WechatMiniprogram.Component.Options<{}, {}, {}> = {
      ...options,
      data: { hasLoad: false },
      options: { ...options?.options, multipleSlots: true },
      methods: {
        ...options?.methods,
        ...this.listenerEvent(component as any as NgCompileComponent),
      },
    };

    config = this.addNgComponentLinkLogic(config);
    return Component(config);
  };

  protected getPageOptions(component: Type<any> & MiniProgramPageOptions) {
    type OptionsKey = keyof WechatMiniprogram.Page.Options<{}, {}>;
    let options: WechatMiniprogram.Page.Options<{}, {}> =
      component.mpPageOptions;
    if (options) {
      for (const key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          const element = options[key as OptionsKey];
          if (element instanceof Function) {
            options[key as OptionsKey] = function (
              this: MiniProgramComponentInstance
            ) {
              return (element as Function).bind(this.__ngComponentInstance)(
                ...arguments
              );
            };
          }
        }
      }
    }
    return options;
  }
  protected getComponentOptions(
    component: Type<any> & MiniProgramComponentOptions
  ) {
    type PageLifetimesKey = keyof WechatMiniprogram.Component.PageLifetimes;

    let options: WechatMiniprogram.Component.Options<{}, {}, {}> =
      component.mpComponentOptions;
    if (options) {
      let pageLifetimes = options.pageLifetimes;
      for (const key in pageLifetimes) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          const element = pageLifetimes[key as PageLifetimesKey];
          if (element instanceof Function) {
            pageLifetimes[key as PageLifetimesKey] = function (
              this: MiniProgramComponentInstance
            ) {
              return (element as Function).bind(this.__ngComponentInstance)(
                ...arguments
              );
            };
          }
        }
      }

      type LifetimesKey =
        keyof WechatMiniprogram.Component.Lifetimes['lifetimes'];
      let lifetimes = options.lifetimes;
      for (const key in lifetimes) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          const element = lifetimes[key as LifetimesKey];
          if (element instanceof Function) {
            lifetimes[key as LifetimesKey] = function (
              this: MiniProgramComponentInstance
            ) {
              return (element as Function).bind(this.__ngComponentInstance)(
                ...arguments
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
