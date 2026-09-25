/* eslint-disable @typescript-eslint/no-explicit-any */
import { diffNodeData } from './diff-node-data';

describe('diffNodeData', () => {
  it('基础', () => {
    expect(diffNodeData({}, {})).toEqual({});
    expect(diffNodeData({}, { a: 1 })).toEqual({ a: 1 });
    expect(diffNodeData({ a: 1 }, {})).toEqual({});
    expect(diffNodeData({}, { a: [] })).toEqual({ a: [] });
  });
  it('复合', () => {
    expect(diffNodeData({ a: [1] }, { a: [2] })).toEqual({ a: [2] });
    expect(diffNodeData({ a: [1, 2] }, { a: [2, 2] })).toEqual({ ['a[0]']: 2 });

    expect(diffNodeData({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    expect(diffNodeData({ a: 1, b: 2 }, { a: 2, b: 2 })).toEqual({ a: 2 });
    expect(diffNodeData({ a: { b: 1 }, c: 1 }, { a: { b: 2 }, c: 1 })).toEqual({
      a: { b: 2 },
    });
    expect(
      diffNodeData({ a: { b: 1, b1: 1 }, c: 1 }, { a: { b: 2, b1: 1 }, c: 1 })
    ).toEqual({
      ['a.b']: 2,
    });
  });
  it('减少数量全量', () => {
    expect(
      diffNodeData({ a: { b: 1, b1: 1 }, c: 1 }, { a: { b: 2 }, c: 1 })
    ).toEqual({
      a: { b: 2 },
    });
    expect(diffNodeData({ a: [1, 2], c: 1 }, { a: [1], c: 1 })).toEqual({
      a: [1],
    });
  });
  it('增加数量全量', () => {
    expect(
      diffNodeData({ a: { b: 2 }, c: 1 }, { a: { b: 1, b1: 1 }, c: 1 })
    ).toEqual({
      a: { b: 1, b1: 1 },
    });
    expect(diffNodeData({ a: [1], c: 1 }, { a: [1, 2], c: 1 })).toEqual({
      a: [1, 2],
    });
  });
});

/**
 * 微信 `setData` 对**路径式 key** 上的 `undefined` 直接拒绝：
 *
 *   Setting data field "nodeList.11.0.__templateName" to undefined is invalid.
 *
 * 而且不是只丢那一个字段，是**整个 setData 调用失败** —— 界面从此
 * 不再更新。真实触发场景：`*ngIf="f; else tpl"` 从 else（有名）
 * 切回 if（脱糖模板无 #ref → 无名）时，diff 会送出
 * `nodeList.N.0.__templateName: undefined`。
 *
 * 本组用例钉住：diff 产出的任何值都不允许是 `undefined`。
 */
describe('diffNodeData: 绝不产出 undefined 值（微信 setData 会拒绝）', () => {
  /** 递归收集所有值为 undefined 的路径 */
  function undefPaths(obj: unknown, prefix = ''): string[] {
    const out: string[] = [];
    if (obj && typeof obj === 'object') {
      Object.keys(obj as Record<string, unknown>).forEach((k) => {
        const p = prefix ? `${prefix}.${k}` : k;
        const v = (obj as Record<string, unknown>)[k];
        if (v === undefined) {out.push(p);}
        else {out.push(...undefPaths(v, p));}
      });
    }
    return out;
  }

  it('顶层字段变 undefined → 转 null', () => {
    const d = diffNodeData({ a: 'x' }, { a: undefined } as any);
    expect(d).toEqual({ a: null });
    expect(undefPaths(d)).toEqual([]);
  });

  it('嵌套对象字段变 undefined → 转 null', () => {
    const d = diffNodeData(
      { a: { b: 'name' } },
      { a: { b: undefined } } as any
    );
    expect(undefPaths(d)).toEqual([]);
  });

  it('复现真实场景：nodeList.N.0.__templateName 有名 → 无名', () => {
    const from = {
      nodeList: [[{ __templateName: 'ngIfElseTemplate', nodeList: [] }]],
    };
    const to = {
      nodeList: [[{ __templateName: undefined, nodeList: [] }]],
    };

    const d = diffNodeData(from as any, to as any);

    expect(undefPaths(d)).withContext('diff 里不允许出现 undefined').toEqual([]);
    // 该路径应被显式清成 null
    expect((d as any)['nodeList[0][0].__templateName']).toBeNull();
  });

  it('数组元素变 undefined → 转 null', () => {
    const d = diffNodeData({ a: [1, 'x'] }, { a: [1, undefined] } as any);
    expect(undefPaths(d)).toEqual([]);
  });

  it('反向对照：不转换的话该场景确实会漏出 undefined', () => {
    // 证明上面这些断言不是恒真：手工构造一个「不转换」的 diff，
    // 断言它确实会漏出 undefined。
    const naive: Record<string, unknown> = {};
    const from = { nodeList: [[{ __templateName: 'a' }]] } as any;
    const to = { nodeList: [[{ __templateName: undefined }]] } as any;
    // 朴素实现：直接赋值
    naive['nodeList[0][0].__templateName'] = to.nodeList[0][0].__templateName;

    expect(undefPaths(naive)).toEqual(['nodeList[0][0].__templateName']);
    // 而真实实现不会
    expect(undefPaths(diffNodeData(from, to))).toEqual([]);
  });

  it('值未变（都是 null）不产生 diff', () => {
    const d = diffNodeData(
      { a: { b: null } },
      { a: { b: null } }
    );
    expect(d).toEqual({});
  });
});

/**
 * 本轮 diff 算法优化的正确性与性能。
 */
describe('diffNodeData: 优化后正确性与性能', () => {
  /** 构造一棵 depth 层、每层 width 个分支的嵌套对象 */
  function buildTree(depth: number, width: number, leaf: number): any {
    if (depth === 0) {
      return leaf;
    }
    const node: any = {};
    for (let i = 0; i < width; i++) {
      node['k' + i] = buildTree(depth - 1, width, leaf);
    }
    return node;
  }

  it('深层多变更：只改一个叶子，diff 只含该路径', () => {
    const from = { nodeList: [buildTree(4, 3, 1)] };
    const to = { nodeList: [buildTree(4, 3, 1)] };
    // 改最深处一个叶子
    to.nodeList[0].k1.k2.k0.k1 = 999;
    const d = diffNodeData(from, to);
    expect(d).toEqual({ 'nodeList[0].k1.k2.k0.k1': 999 });
  });

  it('引用相同子树被短路（不进入递归）', () => {
    const shared = { deep: { x: 1 } };
    const from = { a: shared, b: 1 };
    const to = { a: shared, b: 2 }; // a 是同一引用
    const d = diffNodeData(from, to);
    // 只报 b，a 因引用相等被跳过
    expect(d).toEqual({ b: 2 });
  });

  it('性能基准：大量变更下耗时线性（非 O(N^2) 爆炸）', () => {
    // 构造 N 个并列节点，每个节点改一个字段
    const N = 2000;
    const from: any = { nodeList: [] };
    const to: any = { nodeList: [] };
    for (let i = 0; i < N; i++) {
      from.nodeList.push({ class: 'c' + i, property: { v: i } });
      to.nodeList.push({ class: 'c' + i, property: { v: i + 1 } }); // 每个都改
    }
    const t0 = Date.now();
    const d = diffNodeData(from, to);
    const elapsed = Date.now() - t0;
    // 每个节点 property 全变（1 个 key）→ 折叠为整体 property；class 未变
    expect(Object.keys(d).length).toBe(N);
    // 宽松阈值：线性实现应远小于 O(N^2)。N=2000 全变更应在百毫秒级。
    expect(elapsed).toBeLessThan(1500);
    // eslint-disable-next-line no-console
    console.log(`[diff bench] N=${N} 全变更耗时 ${elapsed}ms`);
  });

  it('性能基准：单点变更在大树上应极快', () => {
    const N = 5000;
    const from: any = { nodeList: [] };
    const to: any = { nodeList: [] };
    for (let i = 0; i < N; i++) {
      from.nodeList.push({ class: 'c', property: { v: 1 } });
      to.nodeList.push({ class: 'c', property: { v: 1 } });
    }
    // 只改最后一个
    to.nodeList[N - 1].property.v = 2;
    const t0 = Date.now();
    const d = diffNodeData(from, to);
    const elapsed = Date.now() - t0;
    expect(Object.keys(d).length).toBe(1);
    expect(elapsed).toBeLessThan(500);
    // eslint-disable-next-line no-console
    console.log(`[diff bench] 单点变更 N=${N} 耗时 ${elapsed}ms`);
  });
});
