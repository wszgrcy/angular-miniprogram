/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InjectFlags,
  ɵangular_packages_core_core_bh,
  ɵangular_packages_core_core_ca,
  ɵɵdirectiveInject,
} from '@angular/core';
import { NoopNode } from './module/renderer-node';
import { COMPONENT_TOKEN } from './module/token/component.token';
import { PAGE_TOKEN } from './module/token/page.token';

type LView = ɵangular_packages_core_core_ca;
const initValue = new Map<LView, any>();
function propertyChange(ctx: any) {
  const lview = ɵangular_packages_core_core_bh();
  const tview = lview[1];
  const instance = ɵɵdirectiveInject(COMPONENT_TOKEN, InjectFlags.Optional);
  for (let i = 20; i < tview.bindingStartIndex; i++) {
    const element = lview[i];
    if (element instanceof NoopNode) {
      console.log(element.type, i - 20);
    }
  }

  if (linkMap.has(lview)) {
    linkMap.get(lview).setData({ __wxView: ctx });
  } else {
    initValue.set(lview, ctx);
  }
}
function updateInitValue(lview: LView) {
  return initValue.get(lview);
}

function computeExpression(value: any) {
  return value;
}
// todo未来会淘汰
function getPipe(pipeName: string, index: number, ...args: any[]) {
  return args[0];
}
const pageMap = new Map<string, LView>();
function pageBind() {
  const lview = ɵangular_packages_core_core_bh();
  const wxComponentInstance = ɵɵdirectiveInject(
    PAGE_TOKEN,
    InjectFlags.Optional
  );

  if (!wxComponentInstance) {
    return;
  }

  const pageId = wxComponentInstance.getPageId();
  if (pageMap.has(pageId)) {
    return;
  }
  pageMap.set(pageId, lview);
}
function getPageLView(id: string) {
  return pageMap.get(id);
}

function findCurrentLView(lview: LView, list: any[], index: number) {
  const tview = lview[1];
  while (list.length) {
    const item = list.shift();
    if (item === 'directive') {
      const index = list.shift();
      let lContainerIndex = 0;
      for (let i = 20; i < tview.bindingStartIndex; i++) {
        const element = lview[i];

        if (element[1] === true) {
          if (index === lContainerIndex) {
            const child: number = list.shift();
            lview = element[8][child]['_lView'];
            break;
          }
          lContainerIndex++;
        }
      }
    }
  }

  let maybeLViewIndex = 0;
  for (let i = 20; i < tview.bindingStartIndex; i++) {
    const element = lview[i];
    if (element instanceof Array || element.length || element[0]) {
      if (index === maybeLViewIndex) {
        return element as LView;
      }
      maybeLViewIndex++;
    }
  }
  throw new Error('没有找到lview');
}
const linkMap = new Map<LView, any>();
function lviewLinkToMPComponentRef(ref: any, lview: LView) {
  linkMap.set(lview, ref);
}
export function componentTemplateHookFactory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (wx as any).__window.__propertyChange = propertyChange;
  (wx as any).__window.__computeExpression = computeExpression;
  (wx as any).__window.__getPipe = getPipe;
  (wx as any).__window.__pageBind = pageBind;
  (wx as any).__window.__getPageLView = getPageLView;
  (wx as any).__window.__updateInitValue = updateInitValue;
  (wx as any).__window.__findCurrentLView = findCurrentLView;
  (wx as any).__window.__lviewLinkToMPComponentRef = lviewLinkToMPComponentRef;
}
