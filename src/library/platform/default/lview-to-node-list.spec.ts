/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NodePath } from '../type/type';
import { AgentNode } from './agent-node';
import {
  findCurrentElement,
  getPageRefreshContext,
} from './component-template-hook.factory';
import { LVIEW } from './lview-layout';

/**
 * 运行时 `lView → nodeList` 下标算术的端到端验证。
 *
 * 构建侧已证明「wxml 引用下标 ⊆ Angular 指令槽号」，但 `nodeList` 由运行时
 * `lViewToWXView` 产出：`nodeList[index - HEADER_OFFSET] = lView[index].toView()`。
 * 这里验证「运行时真的在第 k 位产出正确节点」。
 *
 * `lViewToWXView` 是 `lView` 的纯函数，所以可以构造合成 lView：
 *   lView[1]                  = { bindingStartIndex: HEADER_OFFSET + N }
 *   lView[HEADER_OFFSET + k]  = 第 k 个 AgentNode
 * 然后断言 `nodeList[k]` 正是第 k 个节点 `toView()` 的结果。
 */
describe('运行时 lView → nodeList 下标算术', () => {
  const N = 6;

  /** 构造一个 N 个元素节点的合成 lView */
  function makeLView(offsetShift = 0) {
    const nodes: AgentNode[] = [];
    const lView: any[] = [];
    // lView[1] 是 tView；bindingStartIndex 决定遍历上界
    lView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + N };
    for (let k = 0; k < N; k++) {
      const node = new AgentNode('element');
      node.name = `node-${k}`;
      node.property['k'] = k;
      nodes.push(node);
      // 故意可区分：每个节点 toView() 后应落在对应 k 上
      lView[LVIEW.HEADER_OFFSET + k + offsetShift] = node;
    }
    return { lView, nodes };
  }

  it('nodeList[k] 必须正是 lView[HEADER_OFFSET + k] 那个节点', () => {
    const { lView, nodes } = makeLView();
    const ctx: any = getPageRefreshContext(lView as any);

    expect(ctx.hasLoad).toBe(true);
    expect(ctx.nodeList.length, 'nodeList 长度应等于节点数').toBe(N);

    for (let k = 0; k < N; k++) {
      const slot = ctx.nodeList[k];
      expect(slot, `nodeList[${k}] 不应为空`).toBeDefined();
      // 用 property.k 追踪节点身份（toView 会带 property，不带 attribute）
      expect(
        slot.property?.k,
        `nodeList[${k}] 应是 name=node-${k} 的节点，实际 property=${JSON.stringify(slot.property)}`,
      ).toBe(k);
    }
  });

  it('nodeList 下标从 0 开始连续，不留空洞', () => {
    const { lView } = makeLView();
    const ctx: any = getPageRefreshContext(lView as any);
    for (let k = 0; k < N; k++) {
      expect(ctx.nodeList[k], `nodeList[${k}] 出现空洞`).toBeTruthy();
    }
  });

  it('反向对照：节点整体偏移一格时，身份校验必须失败', () => {
    /**
     * 把节点写入位置整体 +1，模拟 HEADER_OFFSET 用错 / 漏算槽位。若身份校验仍通过，说明本测试是摆设。
     */
    const { lView } = makeLView(1);
    const ctx: any = getPageRefreshContext(lView as any);

    const mismatched: number[] = [];
    for (let k = 0; k < N; k++) {
      const slot = ctx.nodeList[k];
      const actual = slot?.property?.k;
      if (actual !== k) {
        mismatched.push(k);
      }
    }
    expect(
      mismatched.length,
      '节点偏移一格后校验未报任何错位 → 本测试无法抓住下标漂移',
    ).toBeGreaterThan(0);
    // 偏移一格后，nodeList[k] 实际是 node-(k-1)
    expect(ctx.nodeList[1]?.property?.k).toBe(0);
  });

  it('HEADER_OFFSET 与 tView.bindingStartIndex 共同决定遍历边界', () => {
    // bindingStartIndex 截断：只应产出前 3 个
    const lView: any[] = [];
    lView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 3 };
    for (let k = 0; k < 6; k++) {
      const node = new AgentNode('element');
      node.property['k'] = k;
      lView[LVIEW.HEADER_OFFSET + k] = node;
    }
    const ctx: any = getPageRefreshContext(lView as any);
    expect(
      ctx.nodeList.length,
      '遍历上界应由 bindingStartIndex 决定，只产出 3 个',
    ).toBe(3);
  });
});

/**
 * 容器 → nodeList[N] 的嵌入视图来源。
 *
 * `VIEW_REFS`（下标 8）存的是 ViewRef / ComponentRef 包装对象，惰性创建；内建控制流
 * `@if` / `@for` / `@switch` 由 `ɵɵif` / `ɵɵrepeater` 直接往 `CONTAINER_HEADER_OFFSET`
 * （下标 10）塞裸 lView，全程不创建 ViewRef，`VIEW_REFS` 恒为 `null`。
 * 读错下标的后果是内建控制流的容器全部渲染成空数组——节点全丢且不报错。
 */
describe('运行时容器 → nodeList：嵌入视图要从 CONTAINER_HEADER_OFFSET 取', () => {
  /** 造一个最小可用子 lView：lView[TYPE=1] 是 tView 对象，CONTEXT=8 带标记 */
  function makeChildLView(tag: string) {
    const child: any[] = [];
    child[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 1 };
    const node = new AgentNode('element');
    node.name = `child-${tag}`;
    node.property['tag'] = tag;
    child[LVIEW.HEADER_OFFSET] = node;
    child[LVIEW.CONTEXT] = { __templateName: `tpl-${tag}`, tag };
    return child;
  }

  /** 造一个 LContainer：TYPES=true、VIEW_REFS=null、子视图从 HEADER 起 */
  function makeContainer(children: any[]) {
    const c: any[] = [];
    c[0] = new AgentNode('element'); // NATIVE
    c[1] = true; // TYPES：LContainer 标记
    c[2] = 0; // MUTATED
    c[LVIEW.CONTAINER_VIEW_REFS] = null; // 内建控制流：没有 ViewRef
    children.forEach((v, i) => {
      c[LVIEW.CONTAINER_HEADER_OFFSET + i] = v;
    });
    return c;
  }

  function wrap(containerEl: any) {
    const lView: any[] = [];
    lView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 1 };
    lView[LVIEW.HEADER_OFFSET] = containerEl;
    return lView;
  }

  it('VIEW_REFS 为 null 时仍要产出全部嵌入视图', () => {
    const ctx: any = getPageRefreshContext(
      wrap(makeContainer([makeChildLView('x'), makeChildLView('y')])) as any,
    );
    const slot = ctx.nodeList[0];

    expect(Array.isArray(slot), '容器槽位应产出数组').toBe(true);
    expect(
      slot.length,
      '两个嵌入视图都要产出（旧实现读 VIEW_REFS 会得到 0 个）',
    ).toBe(2);
    expect(slot[0].__templateName).toBe('tpl-x');
    expect(slot[1].__templateName).toBe('tpl-y');
    expect(slot[0].nodeList[0].property.tag).toBe('x');
    expect(slot[1].nodeList[0].property.tag).toBe('y');
  });

  it('空容器产出空数组，不是 undefined', () => {
    const ctx: any = getPageRefreshContext(wrap(makeContainer([])) as any);
    expect(ctx.nodeList[0]).toEqual([]);
  });

  it('__templateName 缺失时兜底 null，不能是 undefined', () => {
    /**
     * 微信 setData 对路径式 key 的 undefined 直接拒绝。一旦送出 undefined，
     * 整个 setData 被拒，界面从此不再更新。
     */
    const child = makeChildLView('anon');
    child[LVIEW.CONTEXT] = {};
    const ctx: any = getPageRefreshContext(wrap(makeContainer([child])) as any);
    const name = ctx.nodeList[0][0].__templateName;
    expect(name).toBeNull();
    expect(String(name)).not.toBe('undefined');
  });

  it('非 lView 的杂项不得被当成嵌入视图', () => {
    /**
     * CONTAINER_HEADER_OFFSET 往后可能还有非 lView 项，不能一律当视图，否则会把垃圾塞进 nodeList。
     */
    const c = makeContainer([makeChildLView('ok')]);
    c[LVIEW.CONTAINER_HEADER_OFFSET + 1] = { notALView: true };
    c[LVIEW.CONTAINER_HEADER_OFFSET + 2] = 'string-noise';
    const ctx: any = getPageRefreshContext(wrap(c) as any);
    expect(ctx.nodeList[0].length).toBe(1);
    expect(ctx.nodeList[0][0].__templateName).toBe('tpl-ok');
  });
});

/**
 * 事件回解析：`data-node-path` 里的 `'directive'` 段。
 * 渲染时铺进 nodeList 与点击时沿路径走回来必须用同一个取视图的口径，
 * 否则就是界面看得到、点下去报错（`Cannot read properties of null`）。
 */
describe('事件路径回解析：directive 段要从 CONTAINER_HEADER_OFFSET 取视图', () => {
  const TAGS = ['a', 'b', 'c'];

  function makeChildView(tag: string) {
    const child: any[] = [];
    child[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 1 };
    const node = new AgentNode('element');
    node.name = `btn-${tag}`;
    node.property['tag'] = tag;
    child[LVIEW.HEADER_OFFSET] = node;
    child[LVIEW.CONTEXT] = { tag };
    return { child, node };
  }

  /** 宿主 lView：槽 0 是一个容器，里面嵌了三个子视图 */
  function makeHost() {
    const container: any[] = [];
    container[0] = new AgentNode('element');
    container[1] = true;
    container[2] = 0;
    container[LVIEW.CONTAINER_VIEW_REFS] = null;
    const kids = TAGS.map(makeChildView);
    kids.forEach((k, i) => {
      container[LVIEW.CONTAINER_HEADER_OFFSET + i] = k.child;
    });

    const lView: any[] = [];
    lView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 1 };
    lView[LVIEW.HEADER_OFFSET] = container;
    return { lView, kids };
  }

  it('渲染给出的 nodePath，要能解析回同一个 AgentNode', () => {
    const { lView, kids } = makeHost();
    const ctx: any = getPageRefreshContext(lView as any);
    const items = ctx.nodeList[0];
    expect(items.length).toBe(TAGS.length);

    kids.forEach((k, i) => {
      // 真实事件上的完整路径 = 嵌入视图的 nodePath + 被点节点在子模板里的槽号
      const nodePath = [...(items[i].nodePath as NodePath), 0];
      expect(nodePath).toEqual(['directive', 0, i, 0]);
      expect(
        findCurrentElement(lView as any, nodePath),
        `nodePath ${JSON.stringify(nodePath)} 应解析到 btn-${TAGS[i]}`,
      ).toBe(k.node);
    });
  });

  it('VIEW_REFS 为 null 时不得抛错（旧实现的崩点）', () => {
    const { lView } = makeHost();
    for (let i = 0; i < TAGS.length; i++) {
      expect(() =>
        findCurrentElement(lView as any, ['directive', 0, i, 0]),
      ).not.toThrow();
    }
  });

  it('越界下标返回 undefined，不抛 null 解引用', () => {
    const { lView } = makeHost();
    expect(
      findCurrentElement(lView as any, ['directive', 0, 99]),
    ).toBeUndefined();
  });
});
