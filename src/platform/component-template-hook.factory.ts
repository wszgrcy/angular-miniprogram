/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InjectFlags,
  ɵangular_packages_core_core_bh,
  ɵangular_packages_core_core_ca,
  ɵɵdirectiveInject,
} from '@angular/core';
import { PAGE_TOKEN } from 'index';
import { COMPONENT_TOKEN } from './module/token/component.token';

function propertyChange(ctx: any) {
  // const lview = ɵangular_packages_core_core_bh();
  // const bindStart = 20;
  // const changeVarObject = list
  //   .filter((item, index) =>
  //     bindingUpdated(lview, bindStart + index, item.value)
  //   )
  //   .reduce(
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     (pre: { [name: string]: Record<string, any> }, cur) => {
  //       pre[viewContextName][cur.name] = cur.value;
  //       return pre;
  //     },
  //     { [viewContextName]: {} }
  //   );
  const instance = ɵɵdirectiveInject(COMPONENT_TOKEN);
  // changeVarObject[viewContextName] = {
  //   ...instance.data[viewContextName],
  //   ...changeVarObject[viewContextName],
  // };
  instance.setData({ __wxView: ctx });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function bindingUpdated(lView: any[], bindingIndex: number, value: any) {
//   const oldValue = lView[bindingIndex];

//   if (Object.is(oldValue, value)) {
//     return false;
//   } else {
//     lView[bindingIndex] = value;
//     return true;
//   }
// }
function computeExpression(value: any) {
  return value;
}
function getPipe(pipeName: string, index: number, ...args: any[]) {
  const lview = ɵangular_packages_core_core_bh();
  const pipeStart = 1;
  const pipeIndex = 20 + pipeStart + index;
  let pipeInstance = lview[pipeIndex];

  if (!pipeInstance) {
    const tview = lview[1];
    const list = tview.pipeRegistry;
    const pipeDef = list!.find((item) => item.name === pipeName);
    const pipeFactory =
      (pipeDef!.type as any).factory || (pipeDef!.type as any)['ɵfac'];
    pipeInstance = pipeFactory();
    lview[pipeIndex] = pipeInstance;
  }
  return pipeInstance.transform(...args);
}
const pageMap = new Map<string, ɵangular_packages_core_core_ca>();
function pageBind() {
  const lview = ɵangular_packages_core_core_bh();
  const wxComponentInstance = ɵɵdirectiveInject(PAGE_TOKEN);
  if (!wxComponentInstance) {
    return;
  }
  const pageId = wxComponentInstance.getPageId();
  pageMap.set(pageId, lview);
}
const wxPageStructMap = new Map();
// todo 定义改为由wx部分定义,因为有不同位置索引
function defineComponent(key: string, value: any) {
  wxPageStructMap.set(key, value);
}
function queryComponent(key: string) {
  return wxPageStructMap.get(key);
}

export function componentTemplateHookFactory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (wx as any).__window.__propertyChange = propertyChange;
  (wx as any).__window.__computeExpression = computeExpression;
  (wx as any).__window.__getPipe = getPipe;
  (wx as any).__window.__pageBind = pageBind;
  (wx as any).__window.__defineComponent = defineComponent;
  (wx as any).__window.__queryComponent = queryComponent;
}
/**
 * todo 改为wxml保存引用索引,通过引用索引找到对应的lview进行绑定并更新
 */
