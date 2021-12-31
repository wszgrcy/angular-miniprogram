import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentRef,
  NgModuleRef,
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
  cleanAll,
  cleanWhenDestroy,
  findCurrentElement,
  findPageLView,
  getInitValue,
  lViewLinkToMPComponentRef,
  removePageLViewLink,
  resolveNodePath,
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
    const currentLView: LView = resolveNodePath(list);
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
    mpComponentInstance.__waitLinkResolve();
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
      if (this.__ngDestroy) {
        this.__ngDestroy();
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
    componentRef: ComponentRef<unknown>,
    ngModuleRef: NgModuleRef<unknown>
  ) {
    mpComponentInstance.__isLink = true;
    mpComponentInstance.__ngComponentHostView = componentRef.hostView;
    mpComponentInstance.__ngComponentInstance = componentRef.instance;
    mpComponentInstance.__ngComponentInjector = componentRef.injector;
    mpComponentInstance.__ngZone = componentRef.injector.get(NgZone);
    const { lView, id }: { lView: LView; id: number } =
      findPageLView(componentRef);
    setLViewPath(lView, [id]);
    mpComponentInstance.__completePath = [id];
    const initValue = getInitValue(lView)!;
    mpComponentInstance.setData(updatePath(initValue, [id]));
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngDestroy = () => {
      ngModuleRef.destroy();
      componentRef.destroy();
      removePageLViewLink(id);
      cleanAll(lView);
    };
  }

  public pageStartup = (
    module: Type<unknown>,
    component: Type<unknown>,
    pageOptions?: { useComponent: boolean }
  ) => {
    const _this = this;
    if (pageOptions?.useComponent) {
      const options = this.getComponentOptions<true>(component) || {};
      const config: WechatMiniprogram.Component.Options<{}, {}, {}, {}, true> =
        {
          ...options,
          data: { hasLoad: false },
          options: { ...options?.options, multipleSlots: true },
          methods: {
            ...this.listenerEvent(component),
            onHide: async function (this: MiniProgramComponentInstance) {
              if (options.methods?.onHide) {
                await options.methods.onHide.bind(this)();
              }
              _this.pageStatus.detachView.bind(this)();
            },
            onUnload: async function (this: MiniProgramComponentInstance) {
              if (options.methods?.onUnload) {
                await options.methods.onUnload.bind(this)();
              }
              _this.pageStatus.destroy.bind(this)();
            },
            onShow: async function (this: MiniProgramComponentInstance) {
              if (options.methods?.onShow) {
                await options.methods.onShow.bind(this)();
              }
              _this.pageStatus.attachView.bind(this)();
            },
          },
        };
      config.lifetimes = config.lifetimes || {};
      const oldCreated = config.lifetimes?.created;
      let componentRef: ComponentRef<unknown>,
        ngModuleRef: NgModuleRef<unknown>;
      let resolveFunction!: () => void;
      config.lifetimes.created = function (this: MiniProgramComponentInstance) {
        this.__waitLinkPromise = new Promise<void>((resolve) => {
          resolveFunction = resolve;
        });
        this.__waitLinkResolve = resolveFunction;
        const app = getApp<AppOptions>();
        const result = app.__ngStartPage(module, component, this);
        componentRef = result.componentRef;
        ngModuleRef = result.ngModuleRef;
        if (oldCreated) {
          oldCreated.bind(this)();
        }
      };
      const oldAttached = config.lifetimes.attached;
      config.lifetimes.attached = function (
        this: MiniProgramComponentInstance
      ) {
        _this.linkNgComponentWithPage(this, componentRef, ngModuleRef);
        resolveFunction();
        if (oldAttached) {
          oldAttached.bind(this)();
        }
      };
      return Component(config);
    }
    const options = this.getPageOptions(component) || {};
    return Page({
      ...options,
      ...this.listenerEvent(component),
      data: { hasLoad: false },
      onLoad: function (this: MiniProgramComponentInstance, query) {
        const app = getApp<AppOptions>();
        const { componentRef, ngModuleRef } = app.__ngStartPage(
          module,
          component,
          this
        );
        _this.linkNgComponentWithPage(this, componentRef, ngModuleRef);
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
  protected addNgComponentLinkLogic(
    config: WechatMiniprogram.Component.Options<{}, {}, {}>
  ) {
    const oldCreate = config.lifetimes?.created;
    config.lifetimes = config.lifetimes || {};
    config.lifetimes.created = function (this: MiniProgramComponentInstance) {
      let resolveFunction!: () => void;
      this.__waitLinkPromise = new Promise<void>((resolve) => {
        resolveFunction = resolve;
      });
      this.__waitLinkResolve = resolveFunction;

      if (oldCreate) {
        oldCreate.bind(this)();
      }
    };
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
  protected getComponentOptions<T extends boolean = false>(
    component: Type<unknown> & MiniProgramComponentOptions
  ) {
    type PageLifetimesKey = keyof WechatMiniprogram.Component.PageLifetimes;

    const options: WechatMiniprogram.Component.Options<{}, {}, {}, {}, T> =
      component.mpComponentOptions;
    if (options) {
      const pageLifetimes = options.pageLifetimes;
      for (const key in pageLifetimes) {
        if (Object.prototype.hasOwnProperty.call(pageLifetimes, key)) {
          const element = pageLifetimes[key as PageLifetimesKey];
          if (element instanceof Function) {
            pageLifetimes[key as PageLifetimesKey] = function (
              this: MiniProgramComponentInstance,
              ...args: unknown[]
            ) {
              if (this.__isLink) {
                return (element as Function).bind(this.__ngComponentInstance)(
                  ...args
                );
              } else {
                return this.__waitLinkPromise.then(() => {
                  (element as Function).bind(this.__ngComponentInstance)(
                    ...args
                  );
                });
              }
            };
          }
        }
      }

      type LifetimesKey =
        keyof WechatMiniprogram.Component.Lifetimes['lifetimes'];
      const lifetimes = options.lifetimes;
      for (const key in lifetimes) {
        if (Object.prototype.hasOwnProperty.call(lifetimes, key)) {
          const element = lifetimes[key as LifetimesKey];
          if (element instanceof Function) {
            lifetimes[key as LifetimesKey] = function (
              this: MiniProgramComponentInstance,
              ...args: unknown[]
            ) {
              if (this.__isLink) {
                return (element as Function).bind(this.__ngComponentInstance)(
                  ...args
                );
              } else {
                return this.__waitLinkPromise.then(() => {
                  (element as Function).bind(this.__ngComponentInstance)(
                    ...args
                  );
                });
              }
            };
          }
        }
      }
    }
    return options;
  }
}

export const MiniProgramCore = new MiniProgramCoreFactory();
