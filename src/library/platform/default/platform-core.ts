/// <reference types="miniprogram-api-typings"/>
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
import {
  INJECTOR,
  LVIEW_CONTEXT,
  cleanAll,
  cleanWhenDestroy,
  findCurrentElement,
  findPageLView,
  getDiffData,
  getPageRefreshContext,
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
    const appInstance = getApp() as unknown as AppOptions;

    appInstance.__ngStartPagePromise = new Promise((resolve) => {
      appInstance.__ngStartPageResolve = resolve;
    });
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
    const lView: LView = resolveNodePath(list);
    const injector = lView[INJECTOR]!;
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngComponentInstance = lView[LVIEW_CONTEXT];
    mpComponentInstance.__ngComponentInjector = injector;
    const ngZone = injector.get(NgZone);
    mpComponentInstance.__ngZone = ngZone;
    const componentFinderService = injector.get(ComponentFinderService);
    componentFinderService.set(
      mpComponentInstance.__ngComponentInstance,
      mpComponentInstance
    );
    cleanWhenDestroy(lView, () => {
      componentFinderService.remove(mpComponentInstance.__ngComponentInstance);
    });
    setLViewPath(lView, list);
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__waitLinkResolve();
    ngZone.runOutsideAngular(() => {
      const initValue = getPageRefreshContext(lView);
      const diffData = getDiffData(lView, initValue);
      if (Object.keys(diffData).length) {
        mpComponentInstance.setData(diffData);
      }
    });
  }
  /** 监听事件 */
  protected listenerEvent() {
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
    const ngZone = componentRef.injector.get(NgZone);
    mpComponentInstance.__ngZone = ngZone;
    const { lView, id }: { lView: LView; id: number } =
      findPageLView(componentRef);
    setLViewPath(lView, [id]);
    mpComponentInstance.__completePath = [id];
    ngZone.runOutsideAngular(() => {
      const initValue = getPageRefreshContext(lView);
      const diffData = getDiffData(lView, initValue);
      if (Object.keys(diffData).length) {
        mpComponentInstance.setData(diffData);
      }
    });
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
            ...options.methods,
            ...this.listenerEvent(),
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
              return _this.pageStatus.attachView.bind(this)();
            },
          },
        };
      config.lifetimes = config.lifetimes || {};
      const oldCreated = config.lifetimes.created;
      let componentRef: ComponentRef<unknown>,
        ngModuleRef: NgModuleRef<unknown>;
      config.lifetimes.created = function (this: MiniProgramComponentInstance) {
        const app = getApp<AppOptions>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.__lifeTimePromiseObject = {} as any;
        return (this.__lifeTimePromiseObject['created'] =
          app.__ngStartPagePromise.then(() => {
            const result = app.__ngStartPage(module, component, this);
            componentRef = result.componentRef;
            ngModuleRef = result.ngModuleRef;
            if (oldCreated) {
              oldCreated.bind(this)();
            }
          }));
      };
      const oldAttached = config.lifetimes.attached;
      config.lifetimes.attached = function (
        this: MiniProgramComponentInstance
      ) {
        return this.__lifeTimePromiseObject['created'].then(() => {
          _this.linkNgComponentWithPage(this, componentRef, ngModuleRef);
          if (oldAttached) {
            oldAttached.bind(this)();
          }
        });
      };
      return Component(config);
    }
    const options = this.getPageOptions(component) || {};
    return Page({
      ...options,
      ...this.listenerEvent(),
      data: { hasLoad: false },

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
      onLoad: function (this: MiniProgramComponentInstance, query) {
        const app = getApp<AppOptions>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.__lifeTimePromiseObject = {} as any;
        return (this.__lifeTimePromiseObject['onLoad'] =
          app.__ngStartPagePromise.then(() => {
            const { componentRef, ngModuleRef } = app.__ngStartPage(
              module,
              component,
              this
            );
            _this.linkNgComponentWithPage(this, componentRef, ngModuleRef);
            if (options.onLoad) {
              return options.onLoad.bind(this)(query);
            }
          }));
      },
      onShow: function (this: MiniProgramComponentInstance) {
        return (this.__lifeTimePromiseObject['onShow'] =
          this.__lifeTimePromiseObject['onLoad'].then(async () => {
            if (options.onShow) {
              await options.onShow.bind(this)();
            }
            return _this.pageStatus.attachView.bind(this)();
          }));
      },
      onReady: function (this: MiniProgramComponentInstance) {
        return this.__lifeTimePromiseObject.onShow.then(() => {
          if (options.onReady) {
            return options.onReady.bind(this)();
          }
        });
      },
    });
  };
  protected addNgComponentLinkLogic(
    config: WechatMiniprogram.Component.Options<{}, {}, {}>
  ) {
    config.lifetimes = config.lifetimes || {};
    const oldCreate = config.lifetimes.created;
    config.lifetimes.created = function (this: MiniProgramComponentInstance) {
      this.__waitLinkPromise = new Promise<void>((resolve) => {
        this.__waitLinkResolve = resolve;
      });

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
        ...this.listenerEvent(),
      },
    };

    config = this.addNgComponentLinkLogic(config);
    return Component(config);
  };

  protected getPageOptions(component: Type<unknown> & MiniProgramPageOptions) {
    return component.mpPageOptions as WechatMiniprogram.Page.Options<{}, {}>;
  }
  protected getComponentOptions<T extends boolean = false>(
    component: Type<unknown> & MiniProgramComponentOptions
  ) {
    return component.mpComponentOptions as WechatMiniprogram.Component.Options<
      {},
      {},
      {},
      {},
      T
    >;
  }
}

export const MiniProgramCore = new MiniProgramCoreFactory();
