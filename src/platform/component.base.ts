import { NgZone, Type } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ComponentInitFactory, WxComponentInstance } from './type';
import { valueChange } from './value-change';

type ComponentLifetimeKey =
  keyof WechatMiniprogram.Component.Lifetimes['lifetimes'];
type PageLifetimeKey = keyof WechatMiniprogram.Component.PageLifetimes;
type PageLifetimeKey2 = keyof WechatMiniprogram.Page.ILifetime; // 此类生命周期需要放到 methods 里

export function generateWxComponent<C>(
  component: Type<C>,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {}
) {
  const inputs: Record<string, string[] | string> = (component as any).ɵcmp
    .inputs;
  const outputs: Record<string, string> = (component as any).ɵcmp.outputs;
  const methodKeys: string[] = [];

  let tmpComponent = component.prototype;

  while (tmpComponent) {
    if (tmpComponent.constructor === Object) {
      break;
    }
    const list: string[] = Object.getOwnPropertyNames(tmpComponent).filter(
      (item) => !/(constructor)/.test(item)
    );
    methodKeys.push(...list);
    tmpComponent = tmpComponent.__proto__;
  }

  return (componentInitFactory: ComponentInitFactory, isPage?: boolean) => {
    const inputNameList = Object.keys(inputs);
    let observers: Record<string, (...args: any[]) => any> | undefined;
    if (inputNameList.length) {
      observers = {
        [inputNameList.join(',')]: function (
          this: WxComponentInstance,
          ...list
        ) {
          valueChange(this, list, inputNameList);
        },
      };
    }

    const bootstrapFn = (wxComponentInstance: WxComponentInstance) => {
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
          const obs: Observable<{
            detail?: any;
            options?: WechatMiniprogram.Component.TriggerEventOption;
          }> = componentRef.instance[output];
          subscriptionList.push(
            obs.subscribe((result) => {
              wxComponentInstance.triggerEvent(
                output,
                result.detail,
                result.options
              );
            })
          );
        });

        wxComponentInstance.__unchangedInputs = new Set<string>(
          Object.keys(inputs)
        );
        wxComponentInstance.__firstChange = true;
        return componentRef.instance;
      }));
    };

    const componentLifetimeKeys: ComponentLifetimeKey[] = [
      'created',
      'attached',
      'detached',
      'error',
      'moved',
      'ready',
    ];
    const pageLifetimeKeys: PageLifetimeKey[] = ['hide', 'resize', 'show'];
    const pageLifetimeKeys2: PageLifetimeKey2[] = [
      'onLoad',
      'onShow',
      'onReady',
      'onHide',
      'onUnload',
      'onPullDownRefresh',
      'onReachBottom',
      'onShareAppMessage',
      'onShareTimeline',
      'onPageScroll',
      'onTabItemTap',
      'onResize',
      'onAddToFavorites',
    ];

    const lifetimes: { [p in ComponentLifetimeKey]: (...args: any[]) => any } =
      componentLifetimeKeys.reduce((pre, lifetime) => {
        pre[lifetime] = function () {
          this.__waitNgComponentInit.then((instance: any) =>
            this.__ngZone.run(() => {
              instance[lifetime]?.(...arguments);
            })
          );
        };
        return pre;
      }, {} as any);

    const pageLifetimes: { [p in PageLifetimeKey]: (...args: any[]) => any } =
      pageLifetimeKeys.reduce((pre, cur) => {
        pre[cur] = function () {
          this.__waitNgComponentInit.then((instance: any) =>
            this.__ngZone.run(() => {
              instance[cur]?.(...arguments);
            })
          );
        };
        return pre;
      }, {} as any);

    Component({
      options: componentOptions.options,
      externalClasses: componentOptions.externalClasses,
      observers: observers,
      properties: Object.keys(inputs).reduce(
        (pre: Record<string, any>, cur) => {
          pre[cur] = { value: null, type: null };
          return pre;
        },
        {}
      ),
      methods: methodKeys
        .filter(
          (key) =>
            !componentLifetimeKeys.includes(key as ComponentLifetimeKey) &&
            !pageLifetimeKeys.includes(key as PageLifetimeKey)
        )
        .reduce((pre: Record<string, any>, cur) => {
          pre[cur] = function (this: WxComponentInstance) {
            if (pageLifetimeKeys2.includes(cur as PageLifetimeKey2)) {
              // 如果是 on 开头的页面生命周期
              this.__waitNgComponentInit.then(() =>
                this.__ngZone.run(() => {
                  this.__ngComponentInstance[cur].apply(
                    this.__ngComponentInstance,
                    arguments
                  );
                })
              );
            } else {
              return this.__ngZone.run(() => {
                this.__ngComponentInstance[cur].apply(
                  this.__ngComponentInstance,
                  arguments
                );
              });
            }
          };
          return pre;
        }, {}),
      data: {},
      lifetimes: {
        ...lifetimes,
        created(this: WxComponentInstance) {
          const ref = bootstrapFn(this);
          ref.then((ngComponentInstance) => {
            this.__firstChangeFunction?.(ngComponentInstance);
            lifetimes.created?.apply(this, arguments as any);
          });
        },
        detached(this: WxComponentInstance) {
          this.__waitNgComponentInit.then(() => {
            this.__ngComponentDestroy();
            lifetimes.detached?.apply(this, arguments as any);
          });
        },
      },
      pageLifetimes: isPage ? pageLifetimes : {},
      export: componentOptions.export,
      behaviors: componentOptions.behaviors,
      relations: componentOptions.relations,
    });
  };
}
