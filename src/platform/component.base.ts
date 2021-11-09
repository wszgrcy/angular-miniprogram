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
import {
  ComponentInitFactory,
  NgCompileComponent,
  WxComponentInstance,
  WxLifetimes,
} from './type';
import { strictEquals } from './utils';

export function generateWxComponent<C>(
  component: Type<C> & NgCompileComponent,
  componentOptions: Partial<
    WechatMiniprogram.Component.Options<{}, {}, {}>
  > = {},
  isComponent: boolean
) {
  const inputs = component.ɵcmp.inputs;
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
    const inputNameList = Object.keys(inputs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let observers: Record<string, (...args: any[]) => void> | undefined =
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
        wxComponentInstance.__unchangedInputs = new Set<string>(
          Object.keys(inputs)
        );
        wxComponentInstance.__firstChange = true;
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
        ...Object.keys(inputs).reduce(
          (pre, cur) => {
            pre[cur] = { value: null, type: null };
            return pre;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {} as Record<string, any>
        ),
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
          console.log('组件索引列表', this.properties.componentIndexList);
          console.log('当前上下文的组件', this.properties.cpIndex);

          if (isComponent) {
            // todo 将组件的结构预定义出来
            // todo 找父级,投影可能被影响,也可能不影响
            const parentThis = this.selectOwnerComponent();
            // 查找出自身的位置,并且在lview上确定,
            // 也就是根据查找自身位置的路径,查lview

            return;
          }
          const ref = bootStrapFn(this);
          ref.then(
            (ngComponentInstance) => {
              if (this.__firstChangeFunction) {
                this.__firstChangeFunction(ngComponentInstance);
              }
              this.__ngComponentInjector.get(ChangeDetectorRef).detectChanges();
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

function valueChange(
  wxComponentInstance: WxComponentInstance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeList: any[] = [],
  inputNameList: string[] = []
) {
  const changeObject = changeList.reduce((pre, cur, index) => {
    pre[inputNameList[index]] = cur;
    return pre;
  }, Object.create(null));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ngComponentInstance: OnChanges & Record<string, any> =
    wxComponentInstance.__ngComponentInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const componentRef: ComponentRef<any> = wxComponentInstance.__ngComponentRef;
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
  const simpleChanges: SimpleChanges = {};
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
