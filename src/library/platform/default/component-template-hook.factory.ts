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
import { diffNodeData } from './diff-node-data';
//packages\core\src\render3\interfaces\view.ts
const CLEANUP = 7;
export const LVIEW_CONTEXT = 8;
export const INJECTOR = 9;
//packages\core\src\render3\interfaces\container.ts
const VIEW_REFS = 8;
// HEADER_OFFSET
const start = 25;

const linkMap = new Map<LView, any>();
const nodePathMap = new Map<LView, NodePath>();
let index = 0;
const pageRegistryMap = new Map<number, LView>();
const lViewLastDataMap = new Map<LView, Record<string, any>>();
let waitingRefreshLViewList: (() => void)[] = [];
/** @internal */
export function propertyChange(lView: LView) {
  if (linkMap.has(lView)) {
    const ngZone = lView[INJECTOR]!.get(NgZone);
    waitingRefreshLViewList.push(() => {
      ngZone.runOutsideAngular(() => {
        const instance = linkMap.get(lView);
        if (!instance) {
          return;
        }
        const currentData = getPageRefreshContext(lView);
        const diffData = getDiffData(lView, currentData);
        if (Object.keys(diffData).length) {
          instance.setData(diffData);
        }
      });
    });
  }
}
export function endRender() {
  for (const fn of waitingRefreshLViewList) {
    fn();
  }
  waitingRefreshLViewList = [];
}

export function getPageRefreshContext(lView: LView) {
  const lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath);
  const ctx: Partial<MPView> = {
    nodeList: nodeList,
    nodePath: lviewPath || [],
    hasLoad: true,
  };
  return ctx;
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
export function cleanAll(lView: LView) {
  linkMap.delete(lView);
  nodePathMap.delete(lView);
  lViewLastDataMap.delete(lView);
}

export function findPageLView(componentRef: ComponentRef<unknown>) {
  const lView = (componentRef as any)._rootLView[start];

  index++;
  pageRegistryMap.set(index, lView);
  return { lView: lView as any, id: index };
}
export function removePageLViewLink(id: number) {
  const lView = pageRegistryMap.get(id)!;
  lViewLastDataMap.delete(lView);
  pageRegistryMap.delete(id);
}
export function getDiffData(lView: LView, currentData: Record<string, any>) {
  const lastData = lViewLastDataMap.get(lView);
  if (!lastData) {
    lViewLastDataMap.set(lView, currentData);
    return currentData;
  }
  const diff = diffNodeData(lastData, currentData);
  lViewLastDataMap.set(lView, currentData);
  return diff;
}
