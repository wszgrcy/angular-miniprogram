import {
  ChangeDetectorRef,
  NgZone,
  Type,
  ɵangular_packages_core_core_ca,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  ComponentInitFactory,
  NgCompileComponent,
  WxComponentInstance,
  WxLifetimes,
} from './type';

export function generateWxComponent<C>(
  component: Type<C> & NgCompileComponent,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {},
  isComponent: boolean
) {
  const outputs = component.ɵcmp.outputs;
  const fnList: string[] = [];
  let tmpComponent = component.prototype;
  while (tmpComponent) {
    if (tmpComponent.constructor && tmpComponent.constructor === Object) {
      break;
    }
    const list = Object.getOwnPropertyNames(tmpComponent).filter(
      (item) => !/(constructor)/.test(item)
    );
    fnList.push(...list);
    tmpComponent = tmpComponent.__proto__;
  }
  return (componentInitFactory: ComponentInitFactory, isPage?: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observers: Record<string, (...args: any[]) => void> | undefined = {
      ['componentIndexList,cpIndex']: function (
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
        const lview: ɵangular_packages_core_core_ca = (
          wx as any
        ).__window.__getPageLView(this.getPageId());
        const currentLView = (wx as any).__window.__findCurrentLView(
          lview,
          list,
          index
        );
        const initValue = (wx as any).__window.__updateInitValue(currentLView);
        this.setData({ __wxView: initValue });
        (wx as any).__window.__lviewLinkToMPComponentRef(this, currentLView);
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
        wxComponentInstance.__ngComponentRef = componentRef;

        const subscriptionList: Subscription[] = [];
        wxComponentInstance.__ngComponentDestroy = () => {
          componentRef.destroy();
          subscriptionList.forEach((item) => {
            item.unsubscribe();
          });
        };

        Object.keys(outputs).forEach((output) => {
          const ob: Observable<{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            detail?: any;
            options?: WechatMiniprogram.Component.TriggerEventOption;
          }> = componentRef.instance[output];
          subscriptionList.push(
            ob.subscribe((result) => {
              wxComponentInstance.triggerEvent(
                output,
                result.detail,
                result.options
              );
            })
          );
        });
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        },
        {} as { [p in PageLifetimeKey]: (...args: any[]) => void }
      );
    }
    Component({
      options: componentOptions.options,
      externalClasses: componentOptions.externalClasses,
      observers: observers,
      properties: {
        componentIndexList: { value: [], type: Array },
        cpIndex: { value: NaN, type: Number },
      },
      methods: fnList.reduce((pre: Record<string, Function>, cur) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pre[cur] = function (this: WxComponentInstance, ...args: any[]) {
          const ngZone = this.__ngComponentInjector.get(NgZone);
          return ngZone.run(() => {
            (this.__ngComponentInstance[cur] as Function).bind(
              this.__ngComponentInstance
            )(...args);
          });
        };
        return pre;
      }, {}),
      data: {},
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
              const lview: ɵangular_packages_core_core_ca = (
                wx as any
              ).__window.__getPageLView(this.getPageId());
              const initValue = (wx as any).__window.__updateInitValue(lview);
              this.setData({ __wxView: initValue });
              (wx as any).__window.__lviewLinkToMPComponentRef(this, lview);
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
              this.__ngComponentDestroy();
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
