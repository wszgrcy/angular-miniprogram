import { ɵangular_packages_core_core_bh } from '@angular/core';
import { ɵɵdirectiveInject } from '@angular/core';
import { COMPONENT_TOKEN } from './module/token/component.token';
function propertyChange(
  ctx: any,
  list: { value: any; name: string }[],
  viewContextName: string
) {
  let lview = ɵangular_packages_core_core_bh();
  let bindStart = 20;
  let changeVarObject = list
    .filter((item, index) =>
      bindingUpdated(lview, bindStart + index, item.value)
    )
    .reduce(
      (pre: { [name: string]: Record<string, any> }, cur) => {
        pre[viewContextName][cur.name] = cur.value;
        return pre;
      },
      { [viewContextName]: {} }
    );
  let instance = ɵɵdirectiveInject(COMPONENT_TOKEN);
  changeVarObject[viewContextName] = {
    ...instance.data[viewContextName],
    ...changeVarObject[viewContextName],
  };
  instance.setData(changeVarObject);
}
function bindingUpdated(lView: any[], bindingIndex: number, value: any) {
  const oldValue = lView[bindingIndex];

  if (Object.is(oldValue, value)) {
    return false;
  } else {
    lView[bindingIndex] = value;
    return true;
  }
}
export function componentTemplateHookFactory() {
  (wx as any).__window.__propertyChange = propertyChange;
}
