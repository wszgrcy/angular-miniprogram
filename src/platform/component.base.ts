import {
  ChangeDetectorRef,
  ComponentRef,
  NgZone,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
  Type,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ComponentInitFactory, WxComponentInstance, WxLifetimes } from './type';
import { strictEquals } from './utils';

export function generateWxComponent<C>(
  component: Type<C>,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {}
) {
  const inputs: Record<string, string[] | string> = (component as any).ɵcmp
    .inputs;
  const outputs: Record<string, string> = (component as any).ɵcmp.outputs;
  let fnList: string[] = [];
  let tmpComponent = component.prototype;
  while (tmpComponent) {
    if (tmpComponent.constructor && tmpComponent.constructor === Object) {
      break;
    }
    let list = Object.getOwnPropertyNames(tmpComponent).filter(
      (item) => !/(constructor)/.test(item)
    );
    fnList.push(...list);
    tmpComponent = tmpComponent.__proto__;
  }
  return (componentInitFactory: ComponentInitFactory, isPage?: boolean) => {
    const inputNameList = Object.keys(inputs);
    let observers: Record<string, (...args: any[]) => any> | undefined =
      undefined;
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

    let bootStrapFn = (wxComponentInstance: WxComponentInstance) => {
      return (wxComponentInstance.__waitNgComponentInit = componentInitFactory(
        wxComponentInstance
      ).then((value) => {
        let componentRef = value.componentRef;
        wxComponentInstance.__ngComponentInstance = componentRef.instance;
        wxComponentInstance.__ngComponentInjector = componentRef.injector;
        wxComponentInstance.__ngZone = componentRef.injector.get(NgZone);
        wxComponentInstance.__ngComponentRef = componentRef;

        let subscriptionList: Subscription[] = [];
        wxComponentInstance.__ngComponentDestroy = () => {
          componentRef.destroy();
          subscriptionList.forEach((item) => {
            item.unsubscribe();
          });
        };

        Object.keys(outputs).forEach((output) => {
          let ob: Observable<{
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
        wxComponentInstance.__unchangedInputs = new Set<string>(
          Object.keys(inputs)
        );
        wxComponentInstance.__firstChange = true;
        return componentRef.instance;
      }));
    };
    type LifetimeKey = keyof WechatMiniprogram.Component.Lifetimes['lifetimes'];
    let lifetimes: { [p in LifetimeKey]: (...args: any[]) => any } = (
      ['attached', 'detached', 'error', 'moved', 'ready'] as LifetimeKey[]
    ).reduce((pre, lifetime) => {
      pre[lifetime] = function () {
        this.__waitNgComponentInit.then((instance: WxLifetimes) => {
          if (instance.wxLifetimes && instance.wxLifetimes[lifetime]) {
            (instance.wxLifetimes[lifetime] as any)(...Array.from(arguments));
          }
        });
      };
      return pre;
    }, {} as any);
    type PageLifetimeKey = keyof WechatMiniprogram.Component.PageLifetimes;
    let pageLifetimes: { [p in PageLifetimeKey]: (...args: any[]) => any } = (
      ['hide', 'resize', 'show'] as PageLifetimeKey[]
    ).reduce((pre, cur) => {
      pre[cur] = function () {
        this.__waitNgComponentInit.then((instance: WxLifetimes) => {
          if (instance.wxPageLifetimes && instance.wxPageLifetimes[cur]) {
            (instance.wxPageLifetimes[cur] as any)(...Array.from(arguments));
          }
        });
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
      methods: fnList.reduce((pre: Record<string, any>, cur) => {
        pre[cur] = function (this: WxComponentInstance) {
          let ngZone = this.__ngComponentInjector.get(NgZone);
          return ngZone.run(() => {
            this.__ngComponentInstance[cur].apply(
              this.__ngComponentInstance,
              Array.from(arguments)
            );
          });
        };
        return pre;
      }, {}),
      data: {},
      lifetimes: {
        ...lifetimes,
        created(this: WxComponentInstance) {
          let ref = bootStrapFn(this);
          ref.then((ngComponentInstance) => {
            if (this.__firstChangeFunction) {
              this.__firstChangeFunction(ngComponentInstance);
            }
            this.__ngComponentInjector.get(ChangeDetectorRef).detectChanges();
          });
        },
        detached(this: WxComponentInstance) {
          this.__waitNgComponentInit.then((ref) => {
            this.__ngComponentDestroy();
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

function valueChange(
  wxComponentInstance: WxComponentInstance,
  changeList: any[] = [],
  inputNameList: string[] = []
) {
  let changeObject = changeList.reduce((pre, cur, index) => {
    pre[inputNameList[index]] = cur;
    return pre;
  }, Object.create(null));
  let ngComponentInstance: OnChanges & Record<string, any> =
    wxComponentInstance.__ngComponentInstance;
  let componentRef: ComponentRef<any> = wxComponentInstance.__ngComponentRef;
  if (typeof ngComponentInstance == 'undefined') {
    wxComponentInstance.__firstChangeFunction =
      wxComponentInstance.__firstChangeFunction ||
      (() => valueChange(wxComponentInstance));
    wxComponentInstance.__initialInputValues =
      wxComponentInstance.__initialInputValues || new Map();

    for (const propertyName in changeObject) {
      if (Object.prototype.hasOwnProperty.call(changeObject, propertyName)) {
        const value = changeObject[propertyName];
        wxComponentInstance.__initialInputValues.set(propertyName, value);
      }
    }
    return;
  }
  if (wxComponentInstance.__firstChange) {
    wxComponentInstance.__firstChange = false;
    wxComponentInstance.__initialInputValues!.forEach((value, key) => {
      if (!(key in changeObject)) {
        changeObject[key] = value;
      }
    });
    wxComponentInstance.__initialInputValues = undefined;
  } else {
    for (const key in changeObject) {
      if (Object.prototype.hasOwnProperty.call(changeObject, key)) {
        const value = changeObject[key];
        if (strictEquals(value, ngComponentInstance[key])) {
          delete changeObject[key];
        }
      }
    }
  }
  let simpleChanges: SimpleChanges = {};
  for (const propertyName in changeObject) {
    if (Object.prototype.hasOwnProperty.call(changeObject, propertyName)) {
      const currentValue = changeObject[propertyName];
      const firstChange =
        wxComponentInstance.__unchangedInputs.has(propertyName);
      if (firstChange) {
        wxComponentInstance.__unchangedInputs.delete(propertyName);
      }
      const previousValue = firstChange
        ? undefined
        : ngComponentInstance[propertyName];
      simpleChanges[propertyName] = new SimpleChange(
        previousValue,
        currentValue,
        firstChange
      );
      ngComponentInstance[propertyName] = currentValue;
    }
  }

  if (ngComponentInstance.ngOnChanges && Object.keys(simpleChanges).length) {
    ngComponentInstance.ngOnChanges(simpleChanges);
    componentRef.changeDetectorRef.detectChanges();
  }
}
