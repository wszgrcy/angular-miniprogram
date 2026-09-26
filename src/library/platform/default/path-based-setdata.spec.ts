/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentNode } from './agent-node';
import {
  cleanAll,
  endRender,
  getDiffData,
  getPageRefreshContext,
  lViewLinkToMPComponentRef,
  propertyChange,
  resetCycleState,
  setPathDataEnabled,
} from './component-template-hook.factory';
import { LVIEW } from './lview-layout';
import { MiniProgramRenderer } from './mini-program.renderer';

/**
 * 路径式 setData（快速通道）行为验证。
 *
 * ## 要证明的核心命题
 *
 * 1. 全量序列化会顺手给每个 AgentNode 打上 `__pathPrefix` / `__mpRef`。
 * 2. 纯叶子变更（class / style / property / value）时，`endRender()`
 *    **一次 `toView()` 都不调用**，直接发路径式 key。
 *    —— 这是整笔收益的落点：成本从 O(视图) 变成 O(变更)。
 * 3. 任何结构性变更（增 / 删 / 移动）→ 整体回退到旧的全量管线。
 * 4. 拿不到路径前缀的节点 → 强制回退，绝不猜路径。
 * 5. 无变更 → 一次 setData 都不发。
 * 6. 开关关掉后行为与改造前一致。
 *
 * ## 为什么用「数 toView 调用次数」来断言
 *
 * `diffNodeData` 产出的也是路径式 key，光看 payload 形状分不出
 * 「走了快路径」还是「走了全量 + diff」。但全量必然经过
 * `lViewToWXView` → 每个节点一次 `toView()`。
 * 所以 **toView 调用次数 = 0** 就是「没走全量」的硬证据。
 */
describe('路径式 setData 快速通道', () => {
  const renderer = new MiniProgramRenderer();
  let toViewCount = 0;
  let origToView: any;

  /** 造一个 n 个元素节点的合成 lView（与 lview-to-node-list.spec 同一套路） */
  function makeLView(n: number) {
    const lView: any[] = [];
    lView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + n };
    const nodes: AgentNode[] = [];
    for (let k = 0; k < n; k++) {
      const node = new AgentNode('element');
      node.name = `node-${k}`;
      nodes.push(node);
      lView[LVIEW.HEADER_OFFSET + k] = node;
    }
    return { lView, nodes };
  }

  function makeMp() {
    const calls: any[] = [];
    return {
      setData(data: any) {
        calls.push(data);
      },
      calls,
    };
  }

  /**
   * link + 首次全量序列化（打上前缀）+ 播种 diff 快照。
   * 与 `linkNgComponentWithPage` 的真实流程一一对应。
   */
  function bootstrap(n: number) {
    const { lView, nodes } = makeLView(n);
    const mp = makeMp();
    lViewLinkToMPComponentRef(mp as any, lView as any);
    const initValue = getPageRefreshContext(lView as any, mp as any);
    getDiffData(lView as any, initValue as any);
    return { lView, nodes, mp };
  }

  /** 在 fn 执行期间统计 toView 调用次数 */
  function countToView(fn: () => void): number {
    toViewCount = 0;
    origToView = (AgentNode.prototype as any).toView;
    (AgentNode.prototype as any).toView = function (this: any, ...a: any[]) {
      toViewCount++;
      return origToView.apply(this, a);
    };
    try {
      fn();
    } finally {
      (AgentNode.prototype as any).toView = origToView;
    }
    return toViewCount;
  }

  beforeEach(() => {
    resetCycleState();
    setPathDataEnabled(true);
  });

  // ───────────── 1. stamping ─────────────

  it('全量序列化给每个节点打上 nodeList[k] 前缀与 mpRef', () => {
    const { nodes, mp } = bootstrap(3);
    expect(nodes[0].__pathPrefix).toBe('nodeList[0]');
    expect(nodes[1].__pathPrefix).toBe('nodeList[1]');
    expect(nodes[2].__pathPrefix).toBe('nodeList[2]');
    expect(nodes[0].__mpRef).toBe(mp);
  });

  it('不传 mpRef 时不覆盖节点已有的 __mpRef', () => {
    const { lView, nodes, mp } = bootstrap(1);
    // 同一个 lView 再序列化一次，但不传 mpRef（外部只取快照的场景）
    getPageRefreshContext(lView as any);
    expect(nodes[0].__mpRef)
      .withContext('缺省 mpRef 不应把已打好的目标擦掉')
      .toBe(mp);
    // 前缀仍然会刷新（位置可能变）
    expect(nodes[0].__pathPrefix).toBe('nodeList[0]');
  });

  // ───────────── 2. 叶子变更走快路径 ─────────────

  it('setProperty：零序列化，只发一条路径', () => {
    const { lView, nodes, mp } = bootstrap(3);
    propertyChange(lView as any);
    renderer.setProperty(nodes[1], 'foo', 42);

    const calls = countToView(() => endRender());
    expect(calls)
      .withContext('快路径不应调用任何 toView()')
      .toBe(0);
    expect(mp.calls).toEqual([{ 'nodeList[1].property.foo': 42 }]);
  });

  it('setValue（文本节点）发 .value', () => {
    const { lView, nodes, mp } = bootstrap(2);
    (nodes[0] as any).type = 'text';
    propertyChange(lView as any);
    renderer.setValue(nodes[0], 'hello');
    countToView(() => endRender());
    expect(mp.calls).toEqual([{ 'nodeList[0].value': 'hello' }]);
  });

  it('class 是聚合值：多次 add 只发一条最终串', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.addClass(nodes[0], 'a');
    renderer.addClass(nodes[0], 'b');
    renderer.removeClass(nodes[0], 'a');
    countToView(() => endRender());
    expect(mp.calls).toEqual([{ 'nodeList[0].class': 'b' }]);
  });

  it('style 走聚合串', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.setStyle(nodes[1], 'color', 'red');
    countToView(() => endRender());
    expect(mp.calls).toEqual([{ 'nodeList[1].style': 'color:red' }]);
  });

  it('非 class/style 的 attribute 不进 nodeList，因此不发', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.setAttribute(nodes[0], 'role', 'button');
    countToView(() => endRender());
    expect(mp.calls).toEqual([]);
  });

  it('attribute 的 class / style 要发', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.setAttribute(nodes[0], 'class', 'from-attr');
    countToView(() => endRender());
    expect(mp.calls).toEqual([{ 'nodeList[0].class': ' from-attr' }]);
  });

  it('同 key 同周期多次写 → 后写覆盖前写', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.setProperty(nodes[0], 'x', 1);
    renderer.setProperty(nodes[0], 'x', 2);
    countToView(() => endRender());
    expect(mp.calls).toEqual([{ 'nodeList[0].property.x': 2 }]);
  });

  it('undefined 转 null（微信对路径式 undefined 整次拒绝）', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.setProperty(nodes[0], 'u', undefined);
    countToView(() => endRender());
    expect(mp.calls).toEqual([{ 'nodeList[0].property.u': null }]);
  });

  it('多节点多属性合并成一次 setData', () => {
    const { lView, nodes, mp } = bootstrap(5);
    propertyChange(lView as any);
    for (let i = 0; i < 5; i++) {
      renderer.setProperty(nodes[i], 'k', i);
    }
    countToView(() => endRender());
    expect(mp.calls.length).toBe(1);
    expect(Object.keys(mp.calls[0]).length).toBe(5);
    expect(mp.calls[0]['nodeList[3].property.k']).toBe(3);
  });

  // ───────────── 3. 无变更 ─────────────

  it('view 被 check 但零写入 → 一次 setData 都不发', () => {
    const { lView, mp } = bootstrap(3);
    propertyChange(lView as any);
    const calls = countToView(() => endRender());
    expect(calls).withContext('无变更不应序列化').toBe(0);
    expect(mp.calls).toEqual([]);
  });

  // ───────────── 4. 结构性变更回退 ─────────────

  it('appendChild → 回退全量序列化', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.appendChild(nodes[0], new AgentNode('element'));

    const calls = countToView(() => endRender());
    expect(calls)
      .withContext('结构变更必须走全量序列化（而不是直接发缓存 key）')
      .toBeGreaterThan(0);
  });

  it('removeChild → 回退全量序列化', () => {
    const { lView, nodes, mp } = bootstrap(2);
    // 先把 nodes[1] 挂到 nodes[0] 下（真实场景里节点已在树上），
    // 否则 removeChild 找不到子节点——顺带说明 AgentNode.removeChild
    // 对 index === -1 没有保护（见下方遗留问题说明）。
    nodes[0].appendChild(nodes[1]);
    propertyChange(lView as any);
    renderer.removeChild(nodes[0], nodes[1]);
    const calls = countToView(() => endRender());
    expect(calls).toBeGreaterThan(0);
    expect(nodes[1].parent).toBeUndefined();
  });

  it('结构变更时丢弃已攒的路径式 key，不重复发送', () => {
    const { lView, nodes, mp } = bootstrap(2);
    propertyChange(lView as any);
    renderer.setProperty(nodes[0], 'x', 999);
    renderer.appendChild(nodes[0], new AgentNode('element'));
    countToView(() => endRender());
    /**
     * 全量重序列化本身已经覆盖了这个属性变更，所以：
     *  - 只能有 **一次** setData（pending 已清空，不会再发一轮）
     *  - 且该变更仍在全量结果里（不能丢）
     */
    expect(mp.calls.length).toBe(1);
    /**
     * 注：旧 diff 在 `property` 的 key 数变化时会「整体送出」该对象
     * （`{ 'nodeList[0].property': {x:999} }`），而快路径只发
     * `'nodeList[0].property.x'` 一个叶子——这正好说明快路径的
     * payload 严格小于旧管线。
     */
    expect(mp.calls[0]['nodeList[0].property']).toEqual({ x: 999 });
  });

  it('未 stamp 的节点写入 → 强制回退全量，不猜路径', () => {
    const { lView, mp } = bootstrap(2);
    const orphan = new AgentNode('element');
    propertyChange(lView as any);
    renderer.setProperty(orphan, 'x', 1);

    const calls = countToView(() => endRender());
    expect(calls)
      .withContext('拿不到前缀必须回退')
      .toBeGreaterThan(0);
    const merged = Object.assign({}, ...mp.calls);
    expect(merged['nodeList[0].property.x']).toBeUndefined();
  });

  // ───────────── 5. 开关 ─────────────

  it('开关关闭 → 完全旧行为（全量序列化 + diff）', () => {
    setPathDataEnabled(false);
    const { lView, nodes, mp } = bootstrap(3);
    propertyChange(lView as any);
    renderer.setProperty(nodes[0], 'x', 1);
    const calls = countToView(() => endRender());
    expect(calls)
      .withContext('关掉开关后必须走全量')
      .toBeGreaterThan(0);
    /**
     * 旧管线在 `property` key 数变化时「整体送出」该对象；
     * 开关打开后同一变更只发 `'nodeList[0].property.x'` 一个叶子。
     */
    expect(mp.calls).toEqual([{ 'nodeList[0].property': { x: 1 } }]);
  });

  // ───────────── 6. 嵌套模板路径 ─────────────

  it('容器内节点前缀为 nodeList[c][view].nodeList[M]', () => {
    // 子视图：2 个节点
    const childLView: any[] = [];
    childLView[1] = {
      bindingStartIndex: LVIEW.HEADER_OFFSET + 2,
      declTNode: { localNames: ['inner'] },
    };
    const childNodes: AgentNode[] = [];
    for (let k = 0; k < 2; k++) {
      const n = new AgentNode('element');
      n.name = `child-${k}`;
      childNodes.push(n);
      childLView[LVIEW.HEADER_OFFSET + k] = n;
    }

    // 父视图：槽 0 是容器，槽 1 是普通节点
    const parentLView: any[] = [];
    parentLView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 2 };
    const container: any = [null, true];
    container[LVIEW.CONTAINER_VIEW_REFS] = [{ _lView: childLView }];
    parentLView[LVIEW.HEADER_OFFSET + 0] = container;
    const parentNode = new AgentNode('element');
    parentLView[LVIEW.HEADER_OFFSET + 1] = parentNode;

    const mp = makeMp();
    getPageRefreshContext(parentLView as any, mp as any);

    expect(parentNode.__pathPrefix).toBe('nodeList[1]');
    expect(childNodes[0].__pathPrefix).toBe('nodeList[0][0].nodeList[0]');
    expect(childNodes[1].__pathPrefix).toBe('nodeList[0][0].nodeList[1]');
    expect(childNodes[1].__mpRef).toBe(mp);

    // 用这个前缀发一条，key 必须落在容器项里
    lViewLinkToMPComponentRef(mp as any, parentLView as any);
    propertyChange(parentLView as any);
    renderer.setProperty(childNodes[1], 'v', 7);
    countToView(() => endRender());
    expect(mp.calls).toEqual([
      { 'nodeList[0][0].nodeList[1].property.v': 7 },
    ]);
  });

  // ───────────── 7. 销毁清理 ─────────────

  // ───────────── 8. 性能基准 ─────────────

  it('性能：500 节点视图单点变更，快路径成本与视图大小无关', () => {
    const N = 500;
    const ITER = 200;
    const { lView, nodes, mp } = bootstrap(N);

    /** 旧管线：全量序列化 + diffNodeData */
    const t0 = process.hrtime.bigint();
    for (let i = 0; i < ITER; i++) {
      const ctx = getPageRefreshContext(lView as any, mp as any);
      getDiffData(lView as any, ctx as any);
    }
    const fullNs = Number(process.hrtime.bigint() - t0) / ITER;

    /** 快路径：一次叶子写 + endRender */
    let toViewTotal = 0;
    const t1 = process.hrtime.bigint();
    for (let i = 0; i < ITER; i++) {
      propertyChange(lView as any);
      renderer.setProperty(nodes[i % N], 'k', i);
      toViewTotal += countToView(() => endRender());
    }
    const fastNs = Number(process.hrtime.bigint() - t1) / ITER;

    expect(toViewTotal)
      .withContext('快路径一个 toView 都不能有')
      .toBe(0);
    expect(fastNs)
      .withContext(`快路径(${fastNs.toFixed(0)}ns) 应明显快于全量(${fullNs.toFixed(0)}ns)`)
      .toBeLessThan(fullNs);

    console.log(
      `[path bench] ${N} 节点单点变更：全量 ${fullNs.toFixed(0)}ns / ` +
        `快路径 ${fastNs.toFixed(0)}ns / 加速 ${(fullNs / fastNs).toFixed(1)}x`
    );
  });

  it('性能：视图从 100 涨到 1000，快路径成本几乎不变', () => {
    const ITER = 200;
    const measure = (n: number) => {
      const { lView, nodes, mp } = bootstrap(n);
      const t = process.hrtime.bigint();
      for (let i = 0; i < ITER; i++) {
        propertyChange(lView as any);
        renderer.setProperty(nodes[0], 'k', i);
        endRender();
      }
      void mp;
      return Number(process.hrtime.bigint() - t) / ITER;
    };
    const small = measure(100);
    const big = measure(1000);
    // 允许 3 倍浮动（GC / 噪声），但绝不能随节点数线性增长到数量级
    expect(big)
      .withContext(`1000 节点(${big.toFixed(0)}ns) 不应比 100 节点(${small.toFixed(0)}ns) 贵一个量级`)
      .toBeLessThan(small * 3);
    console.log(
      `[path bench] 快路径 100 节点 ${small.toFixed(0)}ns vs 1000 节点 ${big.toFixed(0)}ns`
    );
  });

  // ───────────── 9. 快照不更新的可接受性 ─────────────

  it('快路径不更新 diff 快照：下一次全量会重发已发过的变更（自愈合，不丢数据）', () => {
    const { lView, nodes, mp } = bootstrap(2);
    // 走一轮快路径
    propertyChange(lView as any);
    renderer.setProperty(nodes[0], 'x', 42);
    endRender();
    expect(mp.calls).toEqual([{ 'nodeList[0].property.x': 42 }]);

    // 再来一轮结构变更 → 全量 diff 仍会带上 x=42（快照是旧的）
    mp.calls.length = 0;
    // 真正的结构变更（appendChild）才触发全量回退；
    // addClass 是叶子写入，走的是快路径。
    propertyChange(lView as any);
    renderer.appendChild(nodes[0], new AgentNode('element'));
    endRender();
    const merged = Object.assign({}, ...mp.calls);
    /**
     * 旧 diff 在「子项全部 FULL」时会逐层折叠，这里 node0 与 node1 均变，
     * `nodeList` 整块被整体送出。所以不断言具体 key，只断言：
     * 已发过的 x=42 仍然在全量结果里（自愈合，不丢数据）。
     */
    expect(JSON.stringify(merged))
      .withContext('旧快照导致重发，但绝不能丢')
      .toContain('"x":42');
  });

  it('cleanAll 丢掉已销毁实例的待发包，避免向死实例 setData', () => {
    const { lView, nodes, mp } = bootstrap(2);
    // 写入但不 endRender，让 key 滞留在 pending 里
    renderer.setProperty(nodes[0], 'x', 1);
    cleanAll(lView as any);
    endRender();
    expect(mp.calls).toEqual([]);
  });
});
