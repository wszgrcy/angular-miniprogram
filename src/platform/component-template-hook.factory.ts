import {
  ɵangular_packages_core_core_bh,
  ɵɵdirectiveInject,
} from '@angular/core';
import { COMPONENT_TOKEN } from './module/token/component.token';

function propertyChange(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: { value: any; name: string }[],
  viewContextName: string
) {
  const lview = ɵangular_packages_core_core_bh();
  const bindStart = 20;
  const changeVarObject = list
    .filter((item, index) =>
      bindingUpdated(lview, bindStart + index, item.value)
    )
    .reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pre: { [name: string]: Record<string, any> }, cur) => {
        pre[viewContextName][cur.name] = cur.value;
        return pre;
      },
      { [viewContextName]: {} }
    );
  const instance = ɵɵdirectiveInject(COMPONENT_TOKEN);
  changeVarObject[viewContextName] = {
    ...instance.data[viewContextName],
    ...changeVarObject[viewContextName],
  };
  instance.setData(changeVarObject);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (wx as any).__window.__propertyChange = propertyChange;
}
