/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectFlags, ɵɵdirectiveInject } from '@angular/core';
import { LView } from './internal-type';
import { AgentNode } from './module/renderer-node';
import { PAGE_TOKEN } from './module/token/page.token';
import type { ComponentPath, MPElementData, MPTextData, MPView } from './type';

const start = 20;

const initValueMap = new Map<LView, MPView>();
const linkMap = new Map<LView, any>();
const componentPathMap = new Map<LView, ComponentPath>();
const pageMap = new Map<string, LView>();
const customDestroyMap = new Map<LView, Function[]>();
export function propertyChange(context: any) {
  const lView = findCurrentComponentLView(context);
  const lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath);
  const ctx: Partial<MPView> = { nodeList: nodeList, componentPath: lviewPath };
  if (linkMap.has(lView)) {
    linkMap.get(lView).setData({ __wxView: ctx });
  } else {
    initValueMap.set(lView, ctx as Required<MPView>);
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
    } else {
      // todo
      nodeList[index - start] = {} as any;
    }
  }
  return nodeList;
}

export function setLViewPath(lView: LView, componentPath: ComponentPath) {
  componentPath = componentPath.slice();
  componentPathMap.set(lView, componentPath);
}
function getLViewPath(lView: LView) {
  return componentPathMap.get(lView);
}
export function updatePath(context: MPView, componentPath: ComponentPath) {
  componentPath = componentPath.slice();
  context.componentPath = componentPath;
  const list: (MPView[] | MPElementData | MPTextData | MPView)[] = [
    ...context.nodeList,
  ];
  while (list.length) {
    const item = list.pop()!;
    if (item instanceof Array) {
      list.push(...item);
    }
    if ((item as MPView).componentPath) {
      ((item as MPView).componentPath as any[]).unshift(componentPath);
    }
  }
  return context;
}
export function getInitValue(lView: LView) {
  const result = initValueMap.get(lView);
  if (result) {
    initValueMap.delete(lView);
  }
  return result;
}

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

export function findCurrentLView(lView: LView, list: ComponentPath): any {
  list = list.slice();
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
  return lView;
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

export function lViewLinkToMPComponentRef(ref: any, lView: LView) {
  linkMap.set(lView, ref);
}

export function cleanWhenDestroy(lView: LView) {
  const list: Function[] = (lView[7] = lView[7] || []);
  list.push((lview: LView) => cleanAll(lview));
}
function cleanAll(lview: LView) {
  linkMap.delete(lview);
  componentPathMap.delete(lview);
  customDestroyMap.get(lview)?.forEach((fn) => {
    fn();
  });
}
export function getLViewDirective(lView: LView) {
  return lView[9];
}
export function addDestroyFunction(lView: LView, fn: Function) {
  let list = customDestroyMap.get(lView) || [];
  list.push(fn);
  customDestroyMap.set(lView, list);
}
