/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectFlags, ɵɵdirectiveInject } from '@angular/core';
import { ComponentPath, MPElementData, MPTextData, MPView } from './type';
import { LView } from './internal-type';
import { AgentNode } from './module/renderer-node';
import { PAGE_TOKEN } from './module/token/page.token';

const start = 20;

const initValue = new Map<LView, any>();
export function propertyChange(context: any) {
  const lView = findCurrentComponentLView(context);
  let lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath);
  const ctx: Partial<MPView> = { nodeList: nodeList, componentPath: lviewPath };
  if (linkMap.has(lView)) {
    linkMap.get(lView).setData({ __wxView: ctx });
  } else {
    initValue.set(lView, ctx);
  }
}
function findCurrentComponentLView(context: any) {
  let lView = context['__ngContext__'];
  if (lView[8] === context) {
    return lView;
  }
  lView = lView[13];
  while (lView[8] !== context) {
    lView = lView[4];
    if (lView[1] === true) {
      throw new Error('这是LContainer?');
    }
  }
  if (!lView) {
    throw new Error('没有找到LView');
  }
  return lView;
}
function lViewToWXView(lView: LView, parentComponentPath: any[] = []) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList: MPView['nodeList'] = [];
  for (let index = start; index < end; index++) {
    const item = lView[index];
    if (item instanceof AgentNode) {
      nodeList[index - start] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: MPView[] = [];
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

const lViewPath = new Map();
export function setLViewPath(lView: LView, path: any[]) {
  lViewPath.set(lView, path);
}
function getLViewPath(lView: LView) {
  return lViewPath.get(lView);
}
export function updatePath(context: MPView, path: ComponentPath) {
  context.componentPath = path;
  const list: (MPView[] | MPElementData | MPTextData | MPView)[] = [
    ...context.nodeList,
  ];
  while (list.length) {
    const item = list.pop()!;
    if (item instanceof Array) {
      list.push(...item);
    }
    if ((item as MPView).componentPath) {
      ((item as MPView).componentPath as any[]).unshift(path);
    }
  }
  return context;
}
export function updateInitValue(lView: LView) {
  return initValue.get(lView);
}

const pageMap = new Map<string, LView>();
export function pageBind(context: any) {
  const lView = findCurrentComponentLView(context);
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
  pageMap.set(pageId, lView);
}
export function getPageLView(id: string): any {
  return pageMap.get(id)!;
}

export function findCurrentLView(
  lView: LView,
  list: ComponentPath,
  index: number
) {
  list = [...list];
  while (list.length) {
    const item = list.shift()!;
    if (item === 'directive') {
      const index = list.shift()! as number;
      const lContainer = lView[index + start];
      const child = list.shift() as number;
      const viewRef = lContainer[8][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[start + item];
    }
  }
  return lView[index + start];
}
export function findCurrentElement(
  lView: LView,
  list: ComponentPath = [],
  index: number
) {
  list = [...list];
  while (list.length) {
    const item = list.shift()!;
    if (item === 'directive') {
      const index = list.shift() as number;
      const lContainer = lView[index + start];
      const child = list.shift() as number;
      const viewRef = lContainer[8][child];
      lView = viewRef['_lView'];
    }
  }

  return lView[index + start];
}

const linkMap = new Map<LView, any>();
export function lViewLinkToMPComponentRef(ref: any, lView: LView) {
  linkMap.set(lView, ref);
}
