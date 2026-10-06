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

// 这些下标统一由 util/lview-layout 提供（单一真源），它们会随 Angular 版本变化

const linkMap = new Map<LView, any>();
const nodePathMap = new Map<LView, NodePath>();
let index = 0;
const pageRegistryMap = new Map<number, LView>();
const lViewLastDataMap = new Map<LView, Record<string, any>>();
let waitingRefreshLViewList: (() => void)[] = [];

/**
 * 路径式 setData 总开关。关掉后 `endRender()` 退回全量序列化 + diffNodeData，
 * 用于灰度 / 排障 / 回退。
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
 * 标记「本周期发生过结构性变更」。增 / 删 / 移动节点会让容器内 view 序号漂移，
 * 其他节点的路径前缀整体失效，所以只要出现过一次就改走全量序列化 + diff。
 */
export function markStructuralChange(): void {
  structuralChange = true;
}

/**
 * 记一条路径式变更。同一 key 本周期内多次写，后写覆盖前写。
 * `undefined` 统一转 `null`：微信对路径式 key 上的 `undefined` 是整次 setData 拒绝。
 */
export function pushPathData(
  mpRef: unknown,
  key: string,
  value: unknown,
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

/**
 * 模板更新钩子回调：把本轮变更批量 `setData` 下去。
 * 构建器给每个组件注入的 `amp.propertyChange(...)` 调的就是它。
 * 不能打 internal 标记：它被逐级具名再导出，`stripInternal` 只剔声明不剔 re-export。
 */
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
  // 快速通道不可用（开关关闭 / 本周期有结构性变更）：走全量序列化 + diff 管线
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

  // 纯叶子变更：直接发路径式 key，跳过整树序列化与深 diff
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

  // 无结构变更、也无叶子写入 → 本周期无需 setData
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
 * 数组下标统一用方括号，与 `diffNodeData` 已跑通的 key 形式一致。
 */
/**
 * 取出容器里已嵌入的子 lView。不能读 `LVIEW.CONTAINER_VIEW_REFS`：那里只存惰创建的
 * ViewRef 包装，内建控制流 `@if`/`@for`/`@switch` 不创建它，恒为 `null`。
 * 识别「是 lView」用 Angular 自己的 `isLView` 判据。
 */
function readEmbeddedLViews(container: unknown[]): unknown[] {
  const views: unknown[] = [];
  for (let i = LVIEW.CONTAINER_HEADER_OFFSET; i < container.length; i++) {
    const value = container[i];
    if (
      Array.isArray(value) &&
      typeof value[1] === 'object' &&
      value[1] !== null
    ) {
      views.push(value);
    }
  }
  return views;
}

/**
 * `TView.data[i]` 上挂的 `TI18n`（`i18n` 属性 / ICU 的静态侧），未对外导出，只能按形状认。
 */
function asT18n(data: any): { ast: any[] } | null {
  return data && typeof data === 'object' && Array.isArray(data.ast)
    ? (data as { ast: any[] })
    : null;
}

/** `I18nNodeKind`：TEXT / ELEMENT / PLACEHOLDER / ICU */
const I18N_TEXT = 0;
const I18N_ELEMENT = 1;
const I18N_ICU = 3;

/**
 * 解 ICU 的当前分支下标。Angular 的编码：`select` 存 `~caseIndex`（必为负），
 * `plural` 存原始 `caseIndex`。
 */
function readCaseIndex(lView: LView, lviewIndex: number): number | null {
  const stored = lView[lviewIndex];
  if (stored === null || stored === undefined) {
    return null;
  }
  return typeof stored === 'number' && stored < 0
    ? ~stored
    : (stored as number);
}

/**
 * 把 i18n 块（含 ICU）当前渲染出来的文本拼成一个串。
 *
 * `ɵɵi18n` 不往自己的槽位写值，译文节点建在 expando 下标上，这里把它们收回来填进槽自己的位置。
 * 必须只走当前分支：换分支时旧分支的节点仍留在 lView 里。
 * 只能拼文本，分支里带标签时元素会被跳过、其子文本被拼平。
 */
function readI18nText(lView: LView, ast: any[], parts: string[]): void {
  for (const node of ast) {
    if (!node || typeof node !== 'object') {
      continue;
    }
    if (node.kind === I18N_ICU) {
      const caseIndex = readCaseIndex(lView, node.currentCaseLViewIndex);
      const activeCase =
        caseIndex === null ? undefined : (node.cases ?? [])[caseIndex];
      if (activeCase) {
        readI18nText(lView, activeCase, parts);
      }
      continue;
    }
    if (node.kind === I18N_TEXT) {
      const rendered = lView[node.index];
      if (rendered instanceof AgentNode && rendered.type === 'text') {
        parts.push(rendered.value ?? '');
      }
    } else if (node.kind === I18N_ELEMENT) {
      // 元素本身进不了 `{{value}}`，只把它下面的文字收进来
      readI18nText(lView, node.children ?? [], parts);
    }
  }
}

/**
 * 算出本节点的可查询 class，非可查询节点返回空串。判据是 `TNode.localNames` 非空，
 * 即模板上写了 `#xxx`，与编译期 `ParsedNgElement.hasRef` 同一个条件。
 *
 * `localNames` 是 `[name, index]` 扁平对，这里只取「有没有」，不读下标：
 * 那个下标对 `#x="dir"` 指的是指令实例槽，不是元素下标。
 */
function refClassOf(tNode: unknown, pathPrefix: string): string {
  const localNames = (tNode as { localNames?: string[] } | undefined)
    ?.localNames;
  if (!localNames?.length) {
    return '';
  }
  // pathPrefix 形如 `nodeList[4][1].nodeList[0]`，里面只有下标是数字
  const nums = pathPrefix.match(/\d+/g);
  return nums ? `__ar-${nums.join('-')}` : '';
}

function lViewToWXView(
  lView: LView,
  parentNodePath: any[] = [],
  dataPrefix = 'nodeList',
  mpRef?: unknown,
) {
  const tView = lView[1];
  const end = tView.bindingStartIndex;
  const nodeList: MPView['nodeList'] = [];
  for (let index = LVIEW.HEADER_OFFSET; index < end; index++) {
    const rel = index - LVIEW.HEADER_OFFSET;
    const item = lView[index];
    /**
     * `#x` 的影子槽：`saveResolvedLocalsInData` 把 local ref 的值写进 `lView[tNode.index + 1]`，
     * 那个槽里是同一个 AgentNode，不对应任何 wxml 元素。判据：与它自己的元素槽是同一个对象。
     *
     * 影子槽既不能重新打前缀（会把真前缀盖掉，`find()` 永远查不到），
     * 也不能写 nodeList（白占 setData 体积）。
     */
    const isRefShadow = item instanceof AgentNode && item === lView[index - 1];
    if (item instanceof AgentNode && !isRefShadow) {
      // 顺手打路径前缀：这次遍历本来就要经过每个节点
      item.__pathPrefix = `${dataPrefix}[${rel}]`;
      if (mpRef) {
        item.__mpRef = mpRef;
      }
      item.__refClass =
        item.type === 'element'
          ? refClassOf(tView.data?.[index], item.__pathPrefix)
          : '';
      nodeList[rel] = item.toView();
    } else if (item && item[1] === true) {
      const lContainerList: MPView[] = [];
      // 读 CONTAINER_HEADER_OFFSET 起的裸 lView，不读 VIEW_REFS：后者对内建 `@if` 恒为 null
      const childLViews = readEmbeddedLViews(item);
      childLViews.forEach((childLView, itemIndex) => {
        const nodePath = [...parentNodePath, 'directive', rel, itemIndex];
        lContainerList.push({
          /**
           * 运行时模板名，两条来源按优先级：
           * 1. context.__templateName —— 自定义结构指令显式传的
           * 2. tView.declTNode.localNames[0] —— 模板声明名（`<ng-template #alpha>` → "alpha"）
           *
           * 兜底用 `null` 而不是 `undefined`：微信 `setData` 对路径式 key 的 `undefined` 直接拒绝。
           * `null` 是合法值且在 wxml 里仍为 falsy，`{{item.__templateName || 'xxxBlock_N'}}` 行为不变。
           */
          __templateName:
            ((childLView as any[])[LVIEW.CONTEXT] &&
              (childLView as any[])[LVIEW.CONTEXT].__templateName) ||
            (childLView as any[])[1]?.declTNode?.localNames?.[0] ||
            null,
          nodeList: lViewToWXView(
            childLView as LView,
            nodePath,
            `${dataPrefix}[${rel}][${itemIndex}].nodeList`,
            mpRef,
          ),
          nodePath: nodePath,
          index: lContainerList.length,
        });
      });
      nodeList[rel] = lContainerList;
    } else {
      // i18n / ICU 的槽位：`lView[i]` 是 `null`，译文在 expando 上，收回来填到本槽
      const t18n = asT18n(tView.data?.[index]);
      if (t18n) {
        const parts: string[] = [];
        readI18nText(lView, t18n.ast, parts);
        nodeList[rel] = { value: parts.join('') } as any;
      } else {
        nodeList[rel] = {} as any;
      }
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
      const lContainer = lView[index + LVIEW.HEADER_OFFSET] as unknown[];
      const child = list.shift() as number;
      lView = readEmbeddedLViews(lContainer)[child] as LView;
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
      const lContainer = lView[index + LVIEW.HEADER_OFFSET] as unknown[];
      const child = list.shift() as number;
      lView = readEmbeddedLViews(lContainer)[child] as LView;
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
