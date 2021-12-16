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
import { MiniProgramCoreBase } from './type';
import { AgentNode } from './renderer-node';

export class MiniProgramCore extends MiniProgramCoreBase<any> {
  static MINIPROGRAM_GLOBAL = (typeof wx === 'undefined'
    ? undefined
    : wx) as any as WechatMiniprogram.Wx;
  static loadApp<T>(app: T) {
    App(app || {});
    const appInstance = getApp();
    return appInstance;
  }
  static getPageId(component: MiniProgramComponentInstance) {
    return component.getPageId();
  }
  static setComponentInstancePageId(component: MiniProgramComponentInstance) {
    component.__getPageId = () => MiniProgramCore.getPageId(component);
  }
  static override linkNgComponentWithPath(
    this: MiniProgramComponentInstance,
    list: ComponentPath
  ) {
    let rootLView = getPageLView(MiniProgramCore.getPageId(this)) as LView;
    let currentLView = findCurrentLView(rootLView, list);
    cleanWhenDestroy(currentLView);
    setLViewPath(currentLView, list);
    const initValue = getInitValue(currentLView);
    if (initValue) {
      this.setData({ __wxView: updatePath(initValue, list) });
    }
    lViewLinkToMPComponentRef(this, currentLView);
    this.__lView = currentLView;
    this.__ngComponentInstance = currentLView[LVIEW_CONTEXT];
    let injector = getLViewInjector(currentLView);
    this.__ngComponentInjector = injector;
    this.__ngZone = injector.get(NgZone);
    let componentFinderService = injector.get(ComponentFinderService);
    componentFinderService.set(this.__ngComponentInstance, this);
    addDestroyFunction(currentLView, () => {
      componentFinderService.remove(this.__ngComponentInstance);
    });
    MiniProgramCore.setComponentInstancePageId(this);
    this.__isLink = true;
  }
  static override listenerEvent(component: NgCompileComponent) {
    let extraMeta = component.ɵcmpExtraMeta;
    return extraMeta.listeners.reduce((pre: Record<string, Function>, cur) => {
      pre[cur.methodName] = function (
        this: MiniProgramComponentInstance,
        event: any
      ) {
        if (this.__lView) {
          let el = findCurrentElement(
            this.__lView,
            event.target.dataset.nodePath,
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
  static override pageStatus = {
    destroy: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentDestroy) {
        this.__ngComponentDestroy();
      }
    },
    attachView: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentInjector) {
        let applicationRef = this.__ngComponentInjector.get(ApplicationRef);
        applicationRef.attachView(this.__ngComponentHostView);
      }
    },
    detachView: function (this: MiniProgramComponentInstance) {
      if (this.__ngComponentInjector) {
        let applicationRef = this.__ngComponentInjector.get(ApplicationRef);
        applicationRef.detachView(this.__ngComponentHostView);
      }
    },
  };
  static override linkNgComponentWithPage(
    this: MiniProgramComponentInstance,
    componentRef: ComponentRef<any>
  ) {
    this.__ngComponentHostView = componentRef.hostView;
    this.__ngComponentInstance = componentRef.instance;
    this.__ngComponentInjector = componentRef.injector;
    this.__ngZone = componentRef.injector.get(NgZone);
    this.__ngComponentDestroy = () => {
      componentRef.destroy();
    };
    this.__ngComponentInjector.get(ChangeDetectorRef).detectChanges();
    const lView = getPageLView(MiniProgramCore.getPageId(this)) as LView;
    const initValue = getInitValue(lView);
    this.setData({ __wxView: initValue });
    lViewLinkToMPComponentRef(this, lView);
    this.__lView = lView;
    this.__ngComponentInstance = lView[LVIEW_CONTEXT];
    MiniProgramCore.setComponentInstancePageId(this);

    this.__isLink = true;
  }

  static override pageStartup(module: Type<any>, component: Type<any>) {
    let options = MiniProgramCore.getPageOptions(component) || {};
    return Page({
      ...options,
      ...MiniProgramCore.listenerEvent(component as any as NgCompileComponent),
      data: { __wxView: false },
      onLoad: function (this: MiniProgramComponentInstance, query) {
        const app = getApp<AppOptions>();
        let componentRef = app.__ngStartPage(
          module,
          component,
          this
        ).componentRef;
        MiniProgramCore.linkNgComponentWithPage.bind(this)(componentRef);
        if (options.onLoad) {
          options.onLoad.bind(this.__ngComponentInstance)(query);
        }
      },
      onHide: async function (this: MiniProgramComponentInstance) {
        if (options.onHide) {
          await options.onHide.bind(this.__ngComponentInstance)();
        }
        MiniProgramCore.pageStatus.detachView.bind(this)();
      },
      onUnload: async function (this: MiniProgramComponentInstance) {
        if (options.onUnload) {
          await options.onUnload.bind(this.__ngComponentInstance)();
        }
        MiniProgramCore.pageStatus.destroy.bind(this)();
      },
      onShow: async function (this: MiniProgramComponentInstance) {
        if (options.onShow) {
          await options.onShow.bind(this.__ngComponentInstance)();
        }
        MiniProgramCore.pageStatus.attachView.bind(this)();
      },
    });
  }
  static override componentRegistry(component: Type<any>) {
    let options = MiniProgramCore.getComponentOptions(component) || {};
    return Component({
      ...options,
      data: { __wxView: false },
      options: { multipleSlots: true, ...options?.options },
      properties: {
        componentPath: {
          type: Array,
          observer: function (this: MiniProgramComponentInstance, list) {
            if (this.__isLink) {
              return;
            }
            this.__componentPath = list || [];
            if (typeof this.__nodeIndex !== 'undefined') {
              MiniProgramCore.linkNgComponentWithPath.call(this, [
                ...this.__componentPath,
                this.__nodeIndex,
              ]);
            }
          },
        },
        nodeIndex: {
          type: Number,
          observer: function (this: MiniProgramComponentInstance, index) {
            if (this.__isLink) {
              return;
            }
            this.__nodeIndex = index;
            if (typeof this.__componentPath !== 'undefined') {
              MiniProgramCore.linkNgComponentWithPath.call(this, [
                ...this.__componentPath,
                this.__nodeIndex,
              ]);
            }
          },
        },
      },
      methods: {
        ...MiniProgramCore.listenerEvent(
          component as any as NgCompileComponent
        ),
        ...options?.methods,
      },
    });
  }

  static getPageOptions(component: Type<any> & MiniProgramPageOptions) {
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
  static getComponentOptions(
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
