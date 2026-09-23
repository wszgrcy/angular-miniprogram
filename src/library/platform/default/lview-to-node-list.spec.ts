/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentNode } from './agent-node';
import { getPageRefreshContext } from './component-template-hook.factory';
import { LVIEW } from './lview-layout';

/**
 * B：运行时 `lView → nodeList` 下标算术的端到端验证。
 *
 * ## 为什么需要这条
 *
 * 构建侧已证明「wxml 引用下标 ⊆ Angular 指令槽号」。但 wxml 读的是
 * `nodeList[k]`，而 `nodeList` 由运行时
 * `lViewToWXView` 产出：
 *
 *   nodeList[index - HEADER_OFFSET] = lView[index].toView()
 *
 * 这条映射之前**只校验过 HEADER_OFFSET 常量的值**，没验证过
 * 「运行时真的在第 k 位产出正确节点」。本 spec 补上这一段。
 *
 * ## 做法
 *
 * `lViewToWXView` 是 `lView` 的纯函数，所以可以构造合成 lView：
 *   lView[1]                  = { bindingStartIndex: HEADER_OFFSET + N }
 *   lView[HEADER_OFFSET + k]  = 第 k 个 AgentNode
 *
 * 然后断言 `nodeList[k]` 正是第 k 个节点 `toView()` 的结果。
 * 真实组件的 boot 依赖小程序运行时（getCurrentPages），本环境跑不了，
 * 但下标算术与节点来源在此已完全覆盖。
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
    expect(ctx.nodeList.length)
      .withContext('nodeList 长度应等于节点数')
      .toBe(N);

    for (let k = 0; k < N; k++) {
      const slot = ctx.nodeList[k];
      expect(slot).withContext(`nodeList[${k}] 不应为空`).toBeDefined();
      // 用 property.k 追踪节点身份（toView 会带 property，不带 attribute）
      expect(slot.property?.k)
        .withContext(
          `nodeList[${k}] 应是 name=node-${k} 的节点，实际 property=${JSON.stringify(slot.property)}`
        )
        .toBe(k);
    }
  });

  it('nodeList 下标从 0 开始连续，不留空洞', () => {
    const { lView } = makeLView();
    const ctx: any = getPageRefreshContext(lView as any);
    for (let k = 0; k < N; k++) {
      expect(ctx.nodeList[k])
        .withContext(`nodeList[${k}] 出现空洞`)
        .toBeTruthy();
    }
  });

  it('反向对照：节点整体偏移一格时，身份校验必须失败', () => {
    /**
     * 把节点写入位置整体 +1，模拟 HEADER_OFFSET 用错 / 漏算槽位。
     * 若身份校验仍通过，说明本测试是摆设。
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
    expect(mismatched.length)
      .withContext('节点偏移一格后校验未报任何错位 → 本测试无法抓住下标漂移')
      .toBeGreaterThan(0);
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
    expect(ctx.nodeList.length)
      .withContext('遍历上界应由 bindingStartIndex 决定，只产出 3 个')
      .toBe(3);
  });
});
