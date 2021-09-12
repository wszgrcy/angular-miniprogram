import {
  ComponentRef,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { WxComponentInstance } from './type';
import { strictEquals } from './utils';

export function valueChange(
  wxComponentInstance: WxComponentInstance,
  changeList: any[] = [],
  inputNameList: string[] = []
) {
  const changeObject = changeList.reduce((pre, cur, index) => {
    pre[inputNameList[index]] = cur;
    return pre;
  }, Object.create(null));
  const ngComponentInstance: OnChanges & Record<string, any> =
    wxComponentInstance.__ngComponentInstance;
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
