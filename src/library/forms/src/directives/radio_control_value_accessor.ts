/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentChildren,
  Directive,
  ElementRef,
  HostBinding,
  Injectable,
  Injector,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  forwardRef,
} from '@angular/core';

import {
  BuiltInControlValueAccessor,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from './control_value_accessor';
import { NgControl } from './ng_control';

export const RADIO_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioGroupValueAccessor),
  multi: true,
};

function throwNameError() {
  throw new Error(`
      If you define both a name and a formControlName attribute on your radio button, their values
      must match. Ex: <input type="radio" formControlName="food" name="food">
    `);
}

/**
 * Internal-only NgModule that works as a host for the `RadioControlRegistry` tree-shakable
 * provider. Note: the `InternalFormsSharedModule` can not be used here directly, since it's
 * declared *after* the `RadioControlRegistry` class and the `providedIn` doesn't support
 * `forwardRef` logic.
 */
@NgModule()
export class RadioControlRegistryModule {}

/**
 * @description
 * Class used by Angular to track radio buttons. For internal use only.
 */
@Injectable({ providedIn: RadioControlRegistryModule })
export class RadioControlRegistry {
  private _accessors: any[] = [];

  /**
   * @description
   * Adds a control to the internal registry. For internal use only.
   */
  add(control: NgControl, accessor: RadioControl) {
    this._accessors.push([control, accessor]);
  }

  /**
   * @description
   * Removes a control from the internal registry. For internal use only.
   */
  remove(accessor: RadioControl) {
    for (let i = this._accessors.length - 1; i >= 0; --i) {
      if (this._accessors[i][1] === accessor) {
        this._accessors.splice(i, 1);
        return;
      }
    }
  }

  /**
   * @description
   * Selects a radio button. For internal use only.
   */
  select(accessor: RadioControl) {
    this._accessors.forEach((c) => {
      if (this._isSameGroup(c, accessor) && c[1] !== accessor) {
        c[1].fireUncheck(accessor.value);
      }
    });
  }

  private _isSameGroup(
    controlPair: [NgControl, RadioControl],
    accessor: RadioControl
  ): boolean {
    if (!controlPair[0].control) {
      return false;
    }
    // todo 这个服务不一定保留
    return false;
    // return (
    //   controlPair[0]._parent === accessor._control._parent &&
    //   controlPair[1].name === accessor.name
    // );
  }
}
@Directive({
  selector:
    'radio-group[formControlName],radio-group[formControl],radio-group[ngModel]',
  host: {
    '(bindchange)': 'valueChange($event.detail.value)',
  },
  providers: [RADIO_GROUP_VALUE_ACCESSOR],
})
export class RadioGroupValueAccessor
  extends BuiltInControlValueAccessor
  implements ControlValueAccessor
{
  @ContentChildren(forwardRef(() => RadioControl), { descendants: true })
  children!: QueryList<RadioControl>;
  valueChange(value: string) {
    if (this.children) {
      this.children.forEach((item) => {
        item.checked = item.value === value;
      });
    }
    this.onChange(value);
  }
  writeValue(value: string) {
    if (this.children) {
      this.children.forEach((item) => {
        item.checked = item.value === value;
      });
    }
  }
}
/**
 * @description
 * The `ControlValueAccessor` for writing radio control values and listening to radio control
 * changes. The value accessor is used by the `FormControlDirective`, `FormControlName`, and
 * `NgModel` directives.
 *
 * @usageNotes
 *
 * ### Using radio buttons with reactive form directives
 *
 * The follow example shows how to use radio buttons in a reactive form. When using radio buttons in
 * a reactive form, radio buttons in the same group should have the same `formControlName`.
 * Providing a `name` attribute is optional.
 *
 * {@example forms/ts/reactiveRadioButtons/reactive_radio_button_example.ts region='Reactive'}
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 * todo 写入值可以从这里来,读取的话就需要从上一级,需要处理本组件与group的关系
 */
@Directive({
  selector: 'radio',
  host: {},
})
export class RadioControl {
  /**
   * @description
   * Tracks the value of the radio input element
   */

  @Input('value') readonly value!: string | undefined;
  @HostBinding('checked')
  checked: boolean | undefined;

  constructor(
    renderer: Renderer2,
    elementRef: ElementRef,
    private _registry: RadioControlRegistry,
    private _injector: Injector
  ) {}
}
