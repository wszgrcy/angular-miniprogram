/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectFlags, NgZone, ɵɵdirectiveInject } from '@angular/core';
import { LView } from 'angular-miniprogram/platform/type';
import type {
  MPElementData,
  MPTextData,
  MPView,
  NodePath,
} from 'angular-miniprogram/platform/type';
import { AgentNode } from './agent-node';
import { PAGE_TOKEN } from './token';

const CLEANUP = 7;
export const LVIEW_CONTEXT = 8;
export const INJECTOR = 9;
const start = 20;

const initValueMap = new Map<LView, MPView>();
const linkMap = new Map<LView, any>();
const nodePathMap = new Map<LView, NodePath>();
const pageMap = new Map<string, LView>();
export function propertyChange(context: any) {
  const lView: LView = findCurrentComponentLView(context);
  const lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath);
  const ctx: Partial<MPView> = {
    nodeList: nodeList,
    nodePath: lviewPath || [],
    hasLoad: true,
  };
  if (linkMap.has(lView)) {
    const ngZone = lView[INJECTOR]!.get(NgZone);
    ngZone.runOutsideAngular(() => {
      linkMap.get(lView).setData(ctx);
    });
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
      const viewRefList: any[] = item[8] || [];
      viewRefList.forEach((item, itemIndex) => {
        const nodePath = [
          ...parentNodePath,
          'directive',
          index - start,
          itemIndex,
        ];
        lContainerList.push({
          __templateName: item._lView[8]
            ? item._lView[8].__templateName
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
export function pageBindFactory(getPageId: (component: any) => string) {
  return function (context: any) {
    const lView = findCurrentComponentLView(context);
    const wxComponentInstance = ɵɵdirectiveInject(
      PAGE_TOKEN,
      InjectFlags.Optional
    );

    if (!wxComponentInstance) {
      return;
    }
    const ngZone = ɵɵdirectiveInject(NgZone, InjectFlags.Optional);
    if (!ngZone) {
      throw new Error('没有查询到NgZone');
    }
    ngZone.runOutsideAngular(() => {
      const pageId = getPageId(wxComponentInstance);
      if (pageMap.has(pageId)) {
        return;
      }
      pageMap.set(pageId, lView);
    });
  };
}
export const pageBind = pageBindFactory((component) => component.getPageId());
export function getPageLView(id: string): any {
  return pageMap.get(id)!;
}

export function findCurrentLView(lView: LView, list: NodePath): any {
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
export function findCurrentElement(lView: LView, list: NodePath = []) {
  list = [...list];
  while (list.length) {
    const item = list.shift()!;
    if (item === 'directive') {
      const index = list.shift() as number;
      const lContainer = lView[index + start];
      const child = list.shift() as number;
      const viewRef = lContainer[8][child];
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

export function removePageLinkLView(id: string) {
  pageMap.delete(id);
}
