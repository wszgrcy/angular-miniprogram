/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentRef } from '@angular/core';
import { LView } from 'angular-miniprogram/platform/type';
import type {
  MPElementData,
  MPTextData,
  MPView,
  NodePath,
} from 'angular-miniprogram/platform/type';
import { AgentNode } from './agent-node';
import { diffNodeData } from './diff-node-data';
import { LVIEW } from './lview-layout';

// 这些下标统一由 util/lview-layout 提供（单一真源），
// 不在本文件重复定义——它们会随 Angular 版本变化，
// 集中一处才配得上配套的交叉校验。
//
// 历史上本文件曾 re-export LVIEW_CONTEXT / INJECTOR 两个裸常量，
// 现已收归 LVIEW.CONTEXT / LVIEW.INJECTOR。

const linkMap = new Map<LView, any>();
const nodePathMap = new Map<LView, NodePath>();
let index = 0;
const pageRegistryMap = new Map<number, LView>();
const lViewLastDataMap = new Map<LView, Record<string, any>>();
let waitingRefreshLViewList: (() => void)[] = [];
/** @internal */
export function propertyChange(lView: LView) {
  if (linkMap.has(lView)) {
    waitingRefreshLViewList.push(() => {
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
  for (let index = LVIEW.HEADER_OFFSET; index < end; index++) {
    const item = lView[index];
    if (item instanceof AgentNode) {
      nodeList[index - LVIEW.HEADER_OFFSET] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: MPView[] = [];
      const viewRefList: any[] = item[LVIEW.CONTAINER_VIEW_REFS] || [];
      viewRefList.forEach((item, itemIndex) => {
        const nodePath = [
          ...parentNodePath,
          'directive',
          index - LVIEW.HEADER_OFFSET,
          itemIndex,
        ];
        lContainerList.push({
          __templateName: item._lView[LVIEW.CONTEXT]
            ? item._lView[LVIEW.CONTEXT].__templateName
            : undefined,
          nodeList: lViewToWXView(item._lView, nodePath),
          nodePath: nodePath,
          index: lContainerList.length,
        });
      });
      nodeList[index - LVIEW.HEADER_OFFSET] = lContainerList;
    } else {
      // todo
      nodeList[index - LVIEW.HEADER_OFFSET] = {} as any;
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
      const lContainer = lView[index + LVIEW.HEADER_OFFSET];
      const child = list.shift() as number;
      const viewRef = lContainer[LVIEW.CONTAINER_VIEW_REFS][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[LVIEW.HEADER_OFFSET + item];
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
      const lContainer = lView[index + LVIEW.HEADER_OFFSET];
      const child = list.shift() as number;
      const viewRef = lContainer[LVIEW.CONTAINER_VIEW_REFS][child];
      lView = viewRef['_lView'];
    } else {
      lView = lView[item + LVIEW.HEADER_OFFSET];
    }
  }

  return lView as any;
}

export function lViewLinkToMPComponentRef(ref: any, lView: LView) {
  linkMap.set(lView, ref);
}

export function cleanWhenDestroy(lView: LView, fn: () => void) {
  const list: Function[] = (lView[LVIEW.CLEANUP] = lView[LVIEW.CLEANUP] || []);
  list.push(() => cleanAll(lView));
  list.push(fn);
}
export function cleanAll(lView: LView) {
  linkMap.delete(lView);
  nodePathMap.delete(lView);
  lViewLastDataMap.delete(lView);
}

export function findPageLView(componentRef: ComponentRef<unknown>) {
  const lView = (componentRef as any)._rootLView[LVIEW.HEADER_OFFSET];

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
