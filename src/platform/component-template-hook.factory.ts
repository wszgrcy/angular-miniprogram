/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InjectFlags,
  ɵangular_packages_core_core_bh,
  ɵangular_packages_core_core_ca,
  ɵɵdirectiveInject,
} from '@angular/core';
import { NoopNode } from './module/renderer-node';
import { PAGE_TOKEN } from './module/token/page.token';

const start = 20;

type LView = ɵangular_packages_core_core_ca;
const initValue = new Map<LView, any>();
function propertyChange(ctx: any) {
  const lView = ɵangular_packages_core_core_bh();
  // const instance = ɵɵdirectiveInject(COMPONENT_TOKEN, InjectFlags.Optional);
  const nodeList = lViewToWXView(lView, ctx.directive);
  ctx = { ...ctx, nodeList: nodeList };
  if (linkMap.has(lView)) {
    linkMap.get(lView).setData({ __wxView: ctx });
  } else {
    initValue.set(lView, ctx);
  }
}
function lViewToWXView(lView: LView, data: any) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList = [];
  for (let index = start; index < end; index++) {
    const item = lView[index];
    if (item instanceof NoopNode) {
      nodeList[index - start] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: any[] = [];
      const viewRefList: any[] = item[8] || [];
      viewRefList.forEach((item, itemIndex) => {
        lContainerList.push({
          nodeList: lViewToWXView(
            item._lView,
            data[index - start][itemIndex].directive
          ),
          componentIndexList: data[index - start][itemIndex].componentIndexList,
        });
      });
      nodeList[index - start] = lContainerList;
    }
  }
  return nodeList;
}
export function updateInitValue(lview: LView) {
  return initValue.get(lview);
}

function computeExpression(value: any) {
  return value;
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
export function getPageLView(id: string) {
  return pageMap.get(id)!;
}

export function findCurrentLView(lview: LView, list: any[], index: number) {
  list = [...list];
  while (list.length) {
    const item = list.shift();
    if (item === 'directive') {
      const index = list.shift();
      const lContainer = lview[index + start];
      const child: number = list.shift();
      const viewRef = lContainer[8][child];
      lview = viewRef['_lView'];
    }
  }

  return lview[index + start];
}
const linkMap = new Map<LView, any>();
export function lViewLinkToMPComponentRef(ref: any, lview: LView) {
  linkMap.set(lview, ref);
}
export function componentTemplateHookFactory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (wx as any).__window.__propertyChange = propertyChange;
  (wx as any).__window.__computeExpression = computeExpression;
  (wx as any).__window.__pageBind = pageBind;
}
