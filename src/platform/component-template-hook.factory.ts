/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InjectFlags,
  ɵangular_packages_core_core_bh,
  ɵangular_packages_core_core_ca,
  ɵɵdirectiveInject,
} from '@angular/core';
import { AgentNode } from './module/renderer-node';
import { PAGE_TOKEN } from './module/token/page.token';

const start = 20;

type LView = ɵangular_packages_core_core_ca;
const initValue = new Map<LView, any>();
export function propertyChange() {
  const lView = ɵangular_packages_core_core_bh();
  const nodeList = lViewToWXView(lView);
  const ctx = { nodeList: nodeList };
  if (linkMap.has(lView)) {
    linkMap.get(lView).setData({ __wxView: ctx });
  } else {
    initValue.set(lView, ctx);
  }
}
function lViewToWXView(lView: LView, parentComponentPath: any[] = []) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList = [];
  for (let index = start; index < end; index++) {
    const item = lView[index];
    if (item instanceof AgentNode) {
      nodeList[index - start] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: any[] = [];
      const viewRefList: any[] = item[8] || [];
      viewRefList.forEach((item, itemIndex) => {
        const componentPath = [
          ...parentComponentPath,
          'directive',
          index - start,
          itemIndex,
        ];
        lContainerList.push({
          context: item._lView[8],
          nodeList: lViewToWXView(item._lView, componentPath),
          componentPath: componentPath,
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

const pageMap = new Map<string, LView>();
export function pageBind() {
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
export function findCurrentElement(
  lview: LView,
  list: (string | number)[] = [],
  index: number
) {
  list = [...list];
  while (list.length) {
    const item = list.shift();
    if (item === 'directive') {
      const index = list.shift() as number;
      const lContainer = lview[index + start];
      const child = list.shift() as number;
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
export function componentTemplateHookFactory() {}
