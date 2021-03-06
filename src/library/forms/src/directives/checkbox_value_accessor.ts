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
  Input,
  QueryList,
  Renderer2,
  forwardRef,
} from '@angular/core';

import {
  BuiltInControlValueAccessor,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from './control_value_accessor';

export const CHECKBOX_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckBoxGroupValueAccessor),
  multi: true,
};

@Directive({
  selector:
    'checkbox-group[formControlName],checkbox-group[formControl],checkbox-group[ngModel]',
  host: {
    '(bindchange)': 'valueChange($event.detail.value)',
  },
  providers: [CHECKBOX_VALUE_ACCESSOR],
})
export class CheckBoxGroupValueAccessor
  extends BuiltInControlValueAccessor
  implements ControlValueAccessor
{
  @ContentChildren(forwardRef(() => CheckboxControl), { descendants: true })
  children!: QueryList<CheckboxControl>;
  valueChange(list: string[]) {
    if (this.children) {
      this.children.forEach((item) => {
        item.updateChecked(list.some((value) => value === item.value));
      });
    }
    this.onChange(list);
  }
  writeValue(list: string[]) {
    if (this.children) {
      this.children.forEach((item) => {
        item.updateChecked(list.some((value) => value === item.value));
      });
    }
  }
}
/**
 * @description
 * A `ControlValueAccessor` for writing a value and listening to changes on a checkbox input
 * element.
 *
 * @usageNotes
 *
 * ### Using a checkbox with a reactive form.
 *
 * The following example shows how to use a checkbox with a reactive form.
 *
 * ```ts
 * const rememberLoginControl = new FormControl();
 * ```
 *
 * ```
 * <input type="checkbox" [formControl]="rememberLoginControl">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
@Directive({
  selector: 'checkbox',
  host: {},
})
export class CheckboxControl {
  /**
   * @description
   * Tracks the value of the radio input element
   */
  @HostBinding('value') @Input() readonly value!: string | undefined;
  @HostBinding('checked')
  checked: boolean | undefined;
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}
  updateChecked(value: boolean) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'checked', value);
  }
}
