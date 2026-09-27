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

/**
 * 路径式 setData 总开关。
 *
 * 关掉后 `endRender()` 完全退回旧的「全量序列化 + diffNodeData」行为，
 * 用于灰度 / 排障 / 回退。运行时可用 {@link setPathDataEnabled} 切。
 */
let pathDataEnabled = true;
/** 本周期内是否发生过结构性变更（增 / 删 / 移动节点） */
let structuralChange = false;
/** 本周期内按 MP 实例分桶的路径式变更 */
let pendingPathData = new Map<any, Record<string, unknown>>();

/** @internal 仅测试用：读 / 改开关状态 */
export function setPathDataEnabled(enabled: boolean): void {
  pathDataEnabled = enabled;
  if (!enabled) {
    pendingPathData.clear();
    structuralChange = false;
  }
}
/** @internal 仅测试用 */
export function isPathDataEnabled(): boolean {
  return pathDataEnabled;
}

/**
 * 标记「本周期发生过结构性变更」。
 *
 * 结构性变更（`appendChild` / `insertBefore` / `removeChild`）会让
 * 容器内 view 序号漂移，进而让**其他节点**的路径前缀整体失效。
 * 所以只要出现过一次，本周期就放弃路径式，走全量序列化 + diff。
 *
 * 注意：节点创建必然伴随 `appendChild`，所以「新节点」天然会触发这里，
 * 不存在「叶子写入打到一个还没被 stamp 的新节点上」的窗口。
 */
export function markStructuralChange(): void {
  structuralChange = true;
}

/**
 * 记一条路径式变更。
 *
 * 同一 key 本周期内多次写 → 后写覆盖前写（与 setData 语义一致）。
 * `undefined` 统一转 `null`：微信对**路径式 key** 上的 `undefined`
 * 是整次 `setData` 拒绝，不是只丢那一个字段。
 */
export function pushPathData(
  mpRef: unknown,
  key: string,
  value: unknown
): void {
  if (!mpRef) {
    return;
  }
  let bucket = pendingPathData.get(mpRef);
  if (!bucket) {
    bucket = {};
    pendingPathData.set(mpRef, bucket);
  }
  bucket[key] = value === undefined ? null : value;
}

/** @internal 仅测试用：窥探本周期待发的桶 */
export function peekPendingPathData(): Map<any, Record<string, unknown>> {
  return pendingPathData;
}

/** @internal 仅测试用：清空周期状态 */
export function resetCycleState(): void {
  pendingPathData = new Map();
  structuralChange = false;
  waitingRefreshLViewList = [];
}

/** @internal */
export function propertyChange(lView: LView) {
  if (linkMap.has(lView)) {
    waitingRefreshLViewList.push(() => {
      const instance = linkMap.get(lView);
      if (!instance) {
        return;
      }
      const currentData = getPageRefreshContext(lView, instance);
      const diffData = getDiffData(lView, currentData);
      if (Object.keys(diffData).length) {
        instance.setData(diffData);
      }
    });
  }
}
export function endRender() {
  // 快速通道不可用（开关关闭 / 本周期有结构性变更）：
  // 完全走旧的全量序列化 + diff 管线，行为与改造前逐字一致。
  if (!pathDataEnabled || structuralChange) {
    pendingPathData.clear();
    structuralChange = false;
    const list = waitingRefreshLViewList;
    waitingRefreshLViewList = [];
    for (const fn of list) {
      fn();
    }
    return;
  }

  // 纯叶子变更：直接发路径式 key，跳过整树序列化与深 diff。
  if (pendingPathData.size) {
    const buckets = pendingPathData;
    pendingPathData = new Map();
    waitingRefreshLViewList = [];
    for (const [mpRef, data] of buckets) {
      if (Object.keys(data).length) {
        mpRef.setData(data);
      }
    }
    return;
  }

  // 无结构变更、也无叶子写入 → 本周期无需 setData。
  // 这是相对旧实现最大的那笔节省：view 被 check 过但什么都没变，
  // 旧管线仍会整棵序列化 + 深 diff，这里直接跳过。
  waitingRefreshLViewList = [];
}

export function getPageRefreshContext(lView: LView, mpRef?: unknown) {
  const lviewPath = getLViewPath(lView);
  const nodeList = lViewToWXView(lView, lviewPath, 'nodeList', mpRef);
  const ctx: Partial<MPView> = {
    nodeList: nodeList,
    nodePath: lviewPath || [],
    hasLoad: true,
  };
  return ctx;
}

/**
 * lView → wxml `nodeList` 序列化，同时给每个 AgentNode 打上路径前缀。
 *
 * @param lView       要序列化的视图
 * @param parentNodePath 事件路由用的 nodePath（`data-node-path`），与数据路径无关
 * @param dataPrefix  本视图 `nodeList` 相对所属 MP 实例数据根的 dotted 前缀
 * @param mpRef       `setData` 的目标；不传则不改写节点上已有的 `__mpRef`
 *
 * 路径规则（与 `wx-container.ts` 生成的 wxml 严格对齐）：
 *
 *   组件自身节点   `nodeList[<M>].<field>`
 *   嵌套模板节点   `nodeList[<cIdx>][<viewIdx>].nodeList[<M>].<field>`
 *
 * 数组下标统一用**方括号**，与 `diffNodeData` 已经跑通的 key 形式逐字一致，
 * 不赌「点号下标」在微信上的兼容性。
 *
 * 依据：`<template is="..." data="{{...nodeList[N][index]}}">` 把容器项
 * 展开成子模板的作用域，子模板里的 `nodeList` 就是 `item.nodeList`。
 */
function lViewToWXView(
  lView: LView,
  parentNodePath: any[] = [],
  dataPrefix = 'nodeList',
  mpRef?: unknown
) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList: MPView['nodeList'] = [];
  for (let index = LVIEW.HEADER_OFFSET; index < end; index++) {
    const rel = index - LVIEW.HEADER_OFFSET;
    const item = lView[index];
    if (item instanceof AgentNode) {
      // 顺手打路径前缀：这次遍历本来就要经过每个节点
      item.__pathPrefix = `${dataPrefix}[${rel}]`;
      if (mpRef) {
        item.__mpRef = mpRef;
      }
      nodeList[rel] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: MPView[] = [];
      const viewRefList: any[] = item[LVIEW.CONTAINER_VIEW_REFS] || [];
      viewRefList.forEach((viewRef, itemIndex) => {
        const nodePath = [...parentNodePath, 'directive', rel, itemIndex];
        lContainerList.push({
          /**
           * wxml 的 `<template is="{{item.__templateName || 'xxxBlock_N'}}">`
           * 需要运行时模板名。两条来源，按优先级：
           *
           * 1. **context.__templateName** —— 自定义结构指令显式传的
           *    （如 `createEmbeddedView(tpl, {__templateName: name})`）。
           *    保留它才能不改变现有自定义指令的行为。
           * 2. **tView.declTNode.localNames[0]** —— 模板声明名
           *    （`<ng-template #alpha>` → `"alpha"`）。
           *
           * 第 2 条是 `ng_if` / `ng_for_of` / `ng_switch` /
           * `ng_template_outlet` 上那套 AST patch 的**等价替代**：
           * 实测 `tView.declTNode === TemplateRef._declarationTContainer`
           * （同一个 TNode），所以 `declTNode.localNames[0]` 与 patch 里
           * `_declarationTContainer.localNames[0]` 取值必然相同。
           *
           * 区别只是：patch 要改 Angular 源码，这里在 fork 自己的
           * 代码里拿（viewRef 已经握在手上）。
           */
          /**
           * 兼底用 `null` 而不是 `undefined`。
           *
           * 微信 `setData` 对 **路径式 key** 的 `undefined` 值直接拒绝：
           *   Setting data field "nodeList.11.0.__templateName" to
           *   undefined is invalid.
           *
           * 首次渲染走整体 setData，对象里的 `undefined` 会被 JSON
           * 序列化丢掉，所以看不出问题；一旦走 diff（路径式），
           * `else`（有名）→ `if`（无名）就会送出 `undefined`，
           * **整个 setData 被拒**，界面从此不再更新。
           *
           * `null` 是合法 setData 值，且在 wxml 里仍为 falsy，
           * `{{item.__templateName || 'xxxBlock_N'}}` 行为不变。
           */
          __templateName:
            (viewRef._lView[LVIEW.CONTEXT] &&
              viewRef._lView[LVIEW.CONTEXT].__templateName) ||
            viewRef._lView[1]?.declTNode?.localNames?.[0] ||
            null,
          nodeList: lViewToWXView(
            viewRef._lView,
            nodePath,
            `${dataPrefix}[${rel}][${itemIndex}].nodeList`,
            mpRef
          ),
          nodePath: nodePath,
          index: lContainerList.length,
        });
      });
      nodeList[rel] = lContainerList;
    } else {
      // todo
      nodeList[rel] = {} as any;
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
  // 销毁时把该实例尚未发出的路径式变更丢掉，否则 pendingPathData 会
  // 持有已销毁的 MP 实例（泄漏 + 之后往已销毁实例上 setData）。
  const mpRef = linkMap.get(lView);
  if (mpRef) {
    pendingPathData.delete(mpRef);
  }
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
