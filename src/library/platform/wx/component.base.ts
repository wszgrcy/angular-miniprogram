import { ApplicationRef, ChangeDetectorRef, NgZone, Type } from '@angular/core';
import { ComponentFinderService } from '../module/service/component-finder.service';
import {
  addDestroyFunction,
  cleanWhenDestroy,
  findCurrentElement,
  findCurrentLView,
  getInitValue,
  getLViewDirective,
  getPageLView,
  lViewLinkToMPComponentRef,
  setLViewPath,
  updatePath,
} from '../component-template-hook.factory';
import type { LView } from '../internal-type';
import { AgentNode } from '../module/renderer-node';
import {
  ComponentInitFactory,
  ComponentPath,
  NgCompileComponent,
} from '../type';
import { WxComponentInstance, WxLifetimes, PageILifeTime } from './type';

export function generateWxComponent<C>(
  component: Type<C> & NgCompileComponent,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {},
  isComponent: boolean
) {
  const meta = component.ɵcmpExtraMeta;

  return (componentInitFactory: ComponentInitFactory, isPage?: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observers = {
      ['componentPath,nodeIndex']: function (
        this: WxComponentInstance,
        list: ComponentPath = [],
        index: number
      ) {
        if (this.__isLink) {
          return;
        }
        if (!(index > -1)) {
          throw new Error('组件索引异常');
        }
        const rootLView = getPageLView(this.getPageId()) as LView;
        const componentPath = [...list, index];
        const lView = findCurrentLView(rootLView, componentPath) as LView;
        cleanWhenDestroy(lView);
        setLViewPath(lView, componentPath);
        const initValue = getInitValue(lView);
        if (initValue) {
          this.setData({ __wxView: updatePath(initValue, componentPath) });
        }
        lViewLinkToMPComponentRef(this, lView);
        this.__lView = lView;
        this.__ngComponentInstance = lView[8];
        this.__ngZone = getLViewDirective(lView)!.get(NgZone);
        let componentFinderService = getLViewDirective(lView)!.get(
          ComponentFinderService
        );
        componentFinderService.set(this.__ngComponentInstance, this);
        addDestroyFunction(lView, () => {
          componentFinderService.remove(this.__ngComponentInstance);
        });
        this.__isLink = true;
      },
    };

    const bootStrapFn = (wxComponentInstance: WxComponentInstance) => {
      return (wxComponentInstance.__waitNgComponentInit = componentInitFactory(
        wxComponentInstance
      ).then((value) => {
        const componentRef = value.componentRef;
        wxComponentInstance.__ngComponentHostView = componentRef.hostView;
        wxComponentInstance.__ngComponentInstance = componentRef.instance;
        wxComponentInstance.__ngComponentInjector = componentRef.injector;
        wxComponentInstance.__ngZone = componentRef.injector.get(NgZone);
        wxComponentInstance.__ngComponentDestroy = () => {
          componentRef.destroy();
        };
        return componentRef.instance;
      }));
    };
    let lifetimes;
    let pageLifetimes;
    if (!isComponent) {
      type LifetimeKey =
        keyof WechatMiniprogram.Component.Lifetimes['lifetimes'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lifetimes = (
        ['attached', 'detached', 'error', 'moved', 'ready'] as LifetimeKey[]
      ).reduce((pre, lifetime) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pre[lifetime] = function (this: WxComponentInstance, ...args: any[]) {
          this.__waitNgComponentInit.then(
            (instance: WxLifetimes) => {
              if (instance.wxLifetimes && instance.wxLifetimes[lifetime]) {
                (instance.wxLifetimes[lifetime] as Function)(...args);
              }
            },
            (rej) => {
              throw rej;
            }
          );
        };
        return pre;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as { [p in LifetimeKey]: (...args: any[]) => void });
      type PageLifetimeKey = keyof WechatMiniprogram.Component.PageLifetimes;
      pageLifetimes = (['hide', 'resize', 'show'] as PageLifetimeKey[]).reduce(
        (pre, cur) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pre[cur] = function (this: WxComponentInstance, ...args: any[]) {
            this.__waitNgComponentInit.then(
              (instance: WxLifetimes) => {
                if (instance.wxPageLifetimes && instance.wxPageLifetimes[cur]) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (instance.wxPageLifetimes[cur] as any)(...args);
                }
              },
              (rej) => {
                throw rej;
              }
            );
          };
          return pre;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as { [p in PageLifetimeKey]: (...args: any[]) => void }
      );
    }
    let pageILifeTime: Partial<PageILifeTime> = {
      onHide: function (this: WxComponentInstance) {
        if (this.__ngComponentInjector) {
          let applicationRef = this.__ngComponentInjector.get(ApplicationRef);
          applicationRef.detachView(this.__ngComponentHostView);
        }
      },
      onUnload: function (this: WxComponentInstance) {
        if (this.__ngComponentDestroy) {
          this.__ngComponentDestroy!();
        }
      },
      onShow: function (this: WxComponentInstance) {
        if (this.__ngComponentInjector) {
          let applicationRef = this.__ngComponentInjector.get(ApplicationRef);
          applicationRef.attachView(this.__ngComponentHostView);
        }
      },
    };
    Component({
      options: { ...componentOptions.options, multipleSlots: isComponent },
      externalClasses: componentOptions.externalClasses,
      observers: observers,
      properties: {
        componentPath: { value: [], type: Array },
        nodeIndex: { value: NaN, type: Number },
      },
      methods: {
        ...(!isComponent ? pageILifeTime : {}),
        ...meta.listeners.reduce((pre: Record<string, Function>, cur) => {
          pre[cur.methodName] = function (
            this: WxComponentInstance,
            event: WechatMiniprogram.BaseEvent
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
        }, {}),
      },
      data: { __wxView: false },
      lifetimes: {
        ...lifetimes,
        created(this: WxComponentInstance) {
          if (isComponent) {
            return;
          }
          const ref = bootStrapFn(this);
          ref.then(
            (ngComponentInstance) => {
              this.__ngComponentInjector.get(ChangeDetectorRef).detectChanges();
              const lView = getPageLView(this.getPageId()) as LView;
              const initValue = getInitValue(lView);
              this.setData({ __wxView: initValue });
              lViewLinkToMPComponentRef(this, lView);
              this.__lView = lView;
              this.__ngComponentInstance = lView[8];
              this.__isLink = true;
            },
            (rej) => {
              throw rej;
            }
          );
        },
      },
      pageLifetimes: isPage ? pageLifetimes : {},
      export: componentOptions.export,
      behaviors: componentOptions.behaviors,
      relations: componentOptions.relations,
    });
  };
}
