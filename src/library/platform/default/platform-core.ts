/// <reference types="miniprogram-api-typings"/>
import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentRef,
  Type,
} from '@angular/core';
import type {
  AppOptions,
  LView,
  MiniProgramComponentInstance,
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
  MpComponentConfig,
  MpComponentOptions,
  MpPageOptions,
  NodePath,
} from 'angular-miniprogram/platform/type';
import { AgentNode } from './agent-node';
import { ComponentFinderService } from './component-finder.service';
import {
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
import { LVIEW } from './lview-layout';
import {
  collectWxsCallMethods,
  createWxsCallMethodForwarders,
  flushPendingCallMethods,
} from './wxs-runtime';

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
    list: NodePath,
  ) {
    mpComponentInstance.__isLink = true;
    const lView: LView = resolveNodePath(list);
    const injector = lView[LVIEW.INJECTOR]!;
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngComponentInstance = lView[LVIEW.CONTEXT];
    mpComponentInstance.__ngComponentInjector = injector;
    const componentFinderService = injector.get(ComponentFinderService);
    componentFinderService.set(
      mpComponentInstance.__ngComponentInstance,
      mpComponentInstance,
    );
    cleanWhenDestroy(lView, () => {
      componentFinderService.remove(mpComponentInstance.__ngComponentInstance);
    });
    setLViewPath(lView, list);
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__waitLinkResolve();
    // 链接完成，把首屏期间暂存的 callMethod 补发出去；渲染层的 wxs 事件可能在链接前就触发
    flushPendingCallMethods(mpComponentInstance);
    // 传 mpComponentInstance：这次全量序列化会顺手给每个 AgentNode 打上路径前缀和 setData 目标
    const initValue = getPageRefreshContext(lView, mpComponentInstance);
    const diffData = getDiffData(lView, initValue);
    if (Object.keys(diffData).length) {
      mpComponentInstance.setData(diffData);
    }
  }
  /** 监听事件 */
  protected listenerEvent() {
    const _this = this;
    return this.eventPrefixList.reduce((pre: Record<string, Function>, cur) => {
      pre[cur.listener + 'Event'] = function (
        this: MiniProgramComponentInstance,
        event: WechatMiniprogram.BaseEvent,
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
              if (el.listener[name]) {
                el.listener[name](event);
              }
            });
        } else {
          throw new Error('未绑定lView');
        }
      };

      return pre;
    }, {});
  }
  /**
   * 渲染层 `callMethod` 的转发器。小程序要求 `callMethod(name)` 的 `name` 必须已在
   * `Component({methods})` 里存在，所以方法名必须在启动时铺好（从 `.wxs` 源静态提取）。
   * 全局铺而非按组件铺：组件与模块的对应关系运行时不可知，多铺几个只是占位。
   */
  protected wxsCallMethodEvent() {
    return createWxsCallMethodForwarders(collectWxsCallMethods());
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
  ) {
    mpComponentInstance.__isLink = true;
    mpComponentInstance.__ngComponentHostView = componentRef.hostView;
    mpComponentInstance.__ngComponentInstance = componentRef.instance;
    mpComponentInstance.__ngComponentInjector = componentRef.injector;
    const { lView, id }: { lView: LView; id: number } =
      findPageLView(componentRef);
    setLViewPath(lView, [id]);
    mpComponentInstance.__completePath = [id];
    const initValue = getPageRefreshContext(lView, mpComponentInstance);
    const diffData = getDiffData(lView, initValue);
    if (Object.keys(diffData).length) {
      mpComponentInstance.setData(diffData);
    }
    lViewLinkToMPComponentRef(mpComponentInstance, lView);
    mpComponentInstance.__lView = lView;
    mpComponentInstance.__ngDestroy = () => {
      componentRef.destroy();
      removePageLViewLink(id);
      cleanAll(lView);
    };
  }

  /**
   * 页面启动的公共实现。
   *
   * @param component 页面组件
   * @param startPage 真正创建组件的方式
   * @param pageOptions
   *   - `useComponent`：用 `Component()` 而不是 `Page()` 注册
   *   - `pageHook`：`useComponent` 时页面钩子的落点
   */
  protected createPageBootstrap = (
    component: Type<unknown>,
    startPage: (
      instance: MiniProgramComponentInstance,
    ) => ComponentRef<unknown>,
    pageOptions?: {
      useComponent?: boolean;
      /**
       * `useComponent` 时页面钩子落在哪里：
       * - `methods`（组件即页面）：`methods.onShow / onHide / onUnload`
       * - `pageLifetimes`（普通组件挂在页面上，如自定义 tabBar）：`pageLifetimes.show / hide` + `lifetimes.detached`
       */
      pageHook?: 'methods' | 'pageLifetimes';
    },
  ) => {
    const _this = this;
    if (pageOptions?.useComponent) {
      const pageHook = pageOptions.pageHook || 'methods';
      const options = this.getComponentOptions<true>(component) || {};
      // 先拷一份再包：直接写 config.lifetimes.created 会污染组件上静态的
      // mpComponentOptions，同一个组件启动两次就变成包装套娃
      const userLifetimes = { ...options.lifetimes };
      const userPageLifetimes = { ...options.pageLifetimes };
      let componentRef: ComponentRef<unknown>;
      /**
       * 包一层「先跑用户钩子，再做框架动作」，与 Page() 分支的顺序一致：
       * 先 detach 会让用户钩子里改的状态丢掉一次更新。
       */
      const wrapPageHook = (
        userHook: (() => unknown) | undefined,
        action: (this: MiniProgramComponentInstance) => unknown,
      ) =>
        async function (this: MiniProgramComponentInstance): Promise<void> {
          if (userHook) {
            await userHook.bind(this)();
          }
          await action.bind(this)();
        };
      const config: MpComponentConfig<true> = {
        ...options,
        data: { hasLoad: false },
        options: { ...options?.options, multipleSlots: true },
        methods: {
          ...options.methods,
          ...this.listenerEvent(),
          ...this.wxsCallMethodEvent(),
        },
        lifetimes: {
          ...userLifetimes,
          created: function (this: MiniProgramComponentInstance) {
            const app = getApp<AppOptions>();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.__lifeTimePromiseObject = {} as any;
            return (this.__lifeTimePromiseObject['created'] =
              app.__ngStartPagePromise.then(() => {
                componentRef = startPage(this);
                if (userLifetimes.created) {
                  userLifetimes.created.bind(this)();
                }
              }));
          },
          attached: function (this: MiniProgramComponentInstance) {
            return this.__lifeTimePromiseObject['created'].then(() => {
              _this.linkNgComponentWithPage(this, componentRef);
              if (userLifetimes.attached) {
                userLifetimes.attached.bind(this)();
              }
            });
          },
        },
      };
      const methods = config.methods!;
      const lifetimes = config.lifetimes!;
      if (pageHook === 'pageLifetimes') {
        // 普通组件挂在页面上（自定义 tabBar）：页面显隐走 pageLifetimes，组件被拆掉就是 tabbar 销毁
        lifetimes.detached = wrapPageHook(
          userLifetimes.detached,
          _this.pageStatus.destroy,
        );
        config.pageLifetimes = {
          ...userPageLifetimes,
          show: wrapPageHook(
            userPageLifetimes.show,
            _this.pageStatus.attachView,
          ),
          hide: wrapPageHook(
            userPageLifetimes.hide,
            _this.pageStatus.detachView,
          ),
        };
      } else {
        // 组件即页面：微信把页面钩子当普通方法调。
        methods.onShow = wrapPageHook(
          options.methods?.onShow,
          _this.pageStatus.attachView,
        );
        methods.onHide = wrapPageHook(
          options.methods?.onHide,
          _this.pageStatus.detachView,
        );
        methods.onUnload = wrapPageHook(
          options.methods?.onUnload,
          _this.pageStatus.destroy,
        );
      }
      return Component(config);
    }
    const options = this.getPageOptions(component) || {};
    return Page({
      ...options,
      ...this.listenerEvent(),
      ...this.wxsCallMethodEvent(),
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
            const componentRef = startPage(this);
            _this.linkNgComponentWithPage(this, componentRef);
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

  /**
   * 启动一个 standalone 组件作为小程序页面，不需要 NgModule。
   *
   * ```ts
   * // foo.entry.ts
   * export { FooComponent as default } from './foo.component';
   * ```
   *
   * 构建器会替这一行生成 `bootstrapPage(FooComponent)`，显式调用也仍然支持。
   * `useComponent` 不传时按组件是否声明了 `mpComponentOptions` 推断。
   */
  public bootstrapPage = (
    component: Type<unknown>,
    pageOptions?: { useComponent?: boolean },
  ) => {
    return this.createPageBootstrap(
      component,
      (instance) => getApp<AppOptions>().__ngStartPage(component, instance),
      {
        ...pageOptions,
        useComponent:
          pageOptions?.useComponent ?? !!this.getComponentOptions(component),
      },
    );
  };
  protected addNgComponentLinkLogic(config: MpComponentConfig) {
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
          list: NodePath,
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
    let config: MpComponentConfig = {
      ...options,
      data: { hasLoad: false },
      options: { ...options?.options, multipleSlots: true },
      methods: {
        ...this.listenerEvent(),
        ...this.wxsCallMethodEvent(),
      },
    };

    config = this.addNgComponentLinkLogic(config);
    return Component(config);
  };

  /**
   * 自定义 tabBar（微信 `custom-tab-bar/index`）的启动入口。
   * 不能走 `componentRegistry`：那条路上 Angular 实例由父模板创建、小程序组件靠
   * `nodePath` / `nodeIndex` 回连，而 tabbar 的实例是微信框架自己创建的，没人传
   * nodePath，`hasLoad` 会恒为 `false`，tab 栏位置渲染成空白且不报错。
   * 所以按「页面」模型自举，页面钩子落在 `pageLifetimes` 上。
   * 微信是每个 tab 页各挂一个 tabbar 实例，选中态必须放在 root provider 里共享。
   */
  public bootstrapCustomTabbar = (component: Type<unknown>) => {
    return this.createPageBootstrap(
      component,
      (instance) => getApp<AppOptions>().__ngStartPage(component, instance),
      { useComponent: true, pageHook: 'pageLifetimes' },
    );
  };

  protected getPageOptions(component: Type<unknown> & MiniProgramPageOptions) {
    return component.mpPageOptions as MpPageOptions;
  }
  protected getComponentOptions<T extends boolean = false>(
    component: Type<unknown> & MiniProgramComponentOptions<T>,
  ) {
    return component.mpComponentOptions as MpComponentOptions<T>;
  }
}

export const MiniProgramCore = new MiniProgramCoreFactory();
