/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentRef, NgZone } from '@angular/core';
import { LView } from 'angular-miniprogram/platform/type';
import type {
  MPElementData,
  MPTextData,
  MPView,
  NodePath,
} from 'angular-miniprogram/platform/type';
import { AgentNode } from './agent-node';

const CLEANUP = 7;
export const LVIEW_CONTEXT = 8;
export const INJECTOR = 9;
const NEXT = 4;
const CHILD_HEAD = 13;
const VIEW_REFS = 8;
const start = 20;

const initValueMap = new Map<LView, MPView>();
const linkMap = new Map<LView, any>();
const nodePathMap = new Map<LView, NodePath>();
let index = 0;
const lViewRegistryMap = new WeakMap<LView, number>();
const pageRegistryMap = new Map<number, LView>();
let waitingRefreshLViewList: (() => void)[] = [];
export function propertyChange(context: any) {
  const lView: LView = findCurrentComponentLView(context);
  if (linkMap.has(lView)) {
    const ngZone = lView[INJECTOR]!.get(NgZone);
    waitingRefreshLViewList.push(() => {
      ngZone.runOutsideAngular(() => {
        linkMap.get(lView).setData(getPageRefreshContext(lView));
      });
    });
  } else {
    initValueMap.set(lView, getPageRefreshContext(lView) as Required<MPView>);
  }
}
export function endRender() {
  for (const fn of waitingRefreshLViewList) {
    fn();
  }
  waitingRefreshLViewList = [];
}
function getPageRefreshContext(lView: LView) {
  const lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath);
  const ctx: Partial<MPView> = {
    nodeList: nodeList,
    nodePath: lviewPath || [],
    hasLoad: true,
  };
  return ctx;
}
function findCurrentComponentLView(context: any): LView {
  let lView = context['__ngContext__'];
  if (lView[LVIEW_CONTEXT] === context) {
    return lView;
  }
  lView = lView[CHILD_HEAD];
  while (lView[LVIEW_CONTEXT] !== context) {
    lView = lView[NEXT];
  }
  if (!lView) {
    throw new Error('没有找到LView');
  }
  return lView;
}
function lViewToWXView(lView: LView, parentNodePath: any[] = []) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList: MPView['nodeList'] = [];
  for (let index = start; index < end; index++) {
    const item = lView[index];
    if (item instanceof AgentNode) {
      nodeList[index - start] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: MPView[] = [];
      const viewRefList: any[] = item[VIEW_REFS] || [];
      viewRefList.forEach((item, itemIndex) => {
        const nodePath = [
          ...parentNodePath,
          'directive',
          index - start,
          itemIndex,
        ];
        lContainerList.push({
          __templateName: item._lView[LVIEW_CONTEXT]
            ? item._lView[LVIEW_CONTEXT].__templateName
            : undefined,
          nodeList: lViewToWXView(item._lView, nodePath),
          nodePath: nodePath,
          index: lContainerList.length,
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

export function setLViewPath(lView: LView, nodePath: NodePath) {
  nodePath = nodePath.slice();
  nodePathMap.set(lView, nodePath);
}
function getLViewPath(lView: LView) {
  return nodePathMap.get(lView);
}
export function updatePath(context: MPView, nodePath: NodePath) {
  nodePath = nodePath.slice();
  context.nodePath = nodePath;
  const list: (MPView[] | MPElementData | MPTextData | MPView)[] = [
    ...context.nodeList,
  ];
  while (list.length) {
    const item = list.pop()!;
    if (item instanceof Array) {
      list.push(...item);
    }
    if ((item as any).nodeList && (item as any).nodeList.length) {
      list.push(...(item as any).nodeList);
    }
    if ((item as MPView).nodePath) {
      ((item as MPView).nodePath as any[]).unshift(...nodePath);
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

export function resolveNodePath(list: NodePath): any {
  list = list.slice();
  let lView = pageRegistryMap.get(list.shift() as number)!;
  while (list.length) {
    const item = list.shift()!;
    if (item === 'directive') {
      const index = list.shift()! as number;
      const lContainer = lView[index + start];
      const child = list.shift() as number;
      const viewRef = lContainer[VIEW_REFS][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[start + item];
    }
  }
  return lView;
}
export function findCurrentElement(lView: LView, list: NodePath = []) {
  list = [...list];
  while (list.length) {
    const item = list.shift()!;
    if (item === 'directive') {
      const index = list.shift() as number;
      const lContainer = lView[index + start];
      const child = list.shift() as number;
      const viewRef = lContainer[VIEW_REFS][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[item + start];
    }
  }

  return lView as any;
}

export function lViewLinkToMPComponentRef(ref: any, lView: LView) {
  linkMap.set(lView, ref);
}

export function cleanWhenDestroy(lView: LView, fn: () => void) {
  const list: Function[] = (lView[CLEANUP] = lView[CLEANUP] || []);
  list.push(() => cleanAll(lView));
  list.push(fn);
}
export function cleanAll(lview: LView) {
  linkMap.delete(lview);
  nodePathMap.delete(lview);
}

export function pageBind(context: any) {
  const lView = findCurrentComponentLView(context);
  const wxComponentInstance = lView[LVIEW_CONTEXT];

  if (!wxComponentInstance) {
    return;
  }
  const ngZone = lView[INJECTOR]!.get(NgZone);
  if (!ngZone) {
    throw new Error('没有查询到NgZone');
  }
  ngZone.runOutsideAngular(() => {
    lViewRegistryMap.set(lView, index++);
  });
}

export function findPageLView(componentRef: ComponentRef<unknown>) {
  const lView = findCurrentComponentLView(componentRef.instance);
  const id = lViewRegistryMap.get(lView)!;
  lViewRegistryMap.delete(lView);
  pageRegistryMap.set(id, lView);
  return { lView: lView as any, id: id };
}
export function removePageLViewLink(id: number) {
  pageRegistryMap.delete(id);
}
