import { ChangeDetectorRef, NgZone, Type } from '@angular/core';
import {
  findCurrentElement,
  findCurrentLView,
  getPageLView,
  lViewLinkToMPComponentRef,
  updateInitValue,
} from '../component-template-hook.factory';
import type { AgentNode } from '../module/renderer-node';
import { ComponentInitFactory, NgCompileComponent } from '../type';
import { WxComponentInstance, WxLifetimes } from './type';

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
        list = [],
        index: number
      ) {
        if (this.__isLink) {
          return;
        }
        if (!(index > -1)) {
          throw new Error('组件索引异常');
        }
        const rootLView = getPageLView(this.getPageId());
        const lView = findCurrentLView(rootLView, list, index);
        const initValue = updateInitValue(lView);
        this.setData({ __wxView: initValue });
        lViewLinkToMPComponentRef(this, lView);
        this.__lView = lView;
        this.__ngComponentInstance = lView[8];
        this.__isLink = true;
      },
    };

    const bootStrapFn = (wxComponentInstance: WxComponentInstance) => {
      return (wxComponentInstance.__waitNgComponentInit = componentInitFactory(
        wxComponentInstance
      ).then((value) => {
        const componentRef = value.componentRef;
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
    Component({
      options: componentOptions.options,
      externalClasses: componentOptions.externalClasses,
      observers: observers,
      properties: {
        componentPath: { value: [], type: Array },
        nodeIndex: { value: NaN, type: Number },
      },
      methods: {
        ...meta.method.reduce((pre: Record<string, Function>, cur) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pre[cur] = function (this: WxComponentInstance, ...args: any[]) {
            let ngZone: NgZone;
            if (this.__lView) {
              ngZone = this.__lView[9]!.get(NgZone);
            } else {
              ngZone = this.__ngComponentInjector.get(NgZone);
            }
            return ngZone.run(() => {
              (this.__ngComponentInstance[cur] as Function).bind(
                this.__ngComponentInstance
              )(...args);
            });
          };
          return pre;
        }, {}),
        ...meta.listeners.reduce((pre: Record<string, Function>, cur) => {
          pre[cur.methodName] = function (
            this: WxComponentInstance,
            event: WechatMiniprogram.BaseEvent
          ) {
            if (this.__lView) {
              const el = findCurrentElement(
                this.__lView,
                event.target.dataset.nodePath,
                event.target.dataset.nodeIndex
              ) as AgentNode;
              el.listener[cur.eventName](event);
            } else {
              throw new Error('未绑定事件');
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
              const lView = getPageLView(this.getPageId());
              const initValue = updateInitValue(lView);
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
        detached(this: WxComponentInstance) {
          if (isComponent) {
            return;
          }
          this.__waitNgComponentInit.then(
            (ref) => {
              this.__ngComponentDestroy!();
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
