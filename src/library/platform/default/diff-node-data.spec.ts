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

  /**
   * 新旧算法同输入直接对比：
   *  - 正确性平价：两者输出必须逐字相等（确定性断言）
   *  - 加速比：在能触发旧算法 O(N^2) spread 的负载上，新算法应明显更快
   *
   * 触发旧算法二次方的负载：同一层 N 个对象，每个只改一个字段（部分
   * 变更）。旧实现每层每个变更都 `{...changeObject, ...result.object}`
   * 拷贝不断变大的累加对象 → O(N^2)；新实现子累加器收集 + 一次
   * Object.assign → O(N)。
   */
  it('新旧对比：结果逐字相等，且新算法在 O(N^2) 负载上更快', () => {
    const N = 3000;
    const from: any = {};
    const to: any = {};
    for (let i = 0; i < N; i++) {
      from['n' + i] = { a: 1, b: 1 };
      to['n' + i] = { a: 2, b: 1 }; // 只改 a → 每个子项部分变更
    }

    const oldResult = diffNodeDataOld(from, to);
    const newResult = diffNodeData(from, to);

    // 正确性平价：新旧输出必须完全一致
    expect(newResult).toEqual(oldResult);

    // 计时：各自跑多轮取最小值，降低噪声
    const time = (fn: () => unknown) => {
      let min = Infinity;
      for (let r = 0; r < 3; r++) {
        const t = Date.now();
        fn();
        min = Math.min(min, Date.now() - t);
      }
      return min;
    };
    const oldMs = time(() => diffNodeDataOld(from, to));
    const newMs = time(() => diffNodeData(from, to));
    // eslint-disable-next-line no-console
    console.log(
      `[diff 对比] N=${N}  旧=${oldMs}ms  新=${newMs}ms  加速≈${(
        oldMs / Math.max(newMs, 1)
      ).toFixed(1)}x`
    );

    // 新算法绝不应比旧算法慢（宽松断言，避免机器噪声误报）
    expect(newMs).toBeLessThanOrEqual(oldMs);
  });
});

/**
 * 旧版 diff 算法（重写前的实现），仅用于上述对比测试。
 * 保留原样以作为性能/正确性对照。
 */
function diffNodeDataOld(
  from: Record<string, unknown>,
  to: Record<string, unknown>
): Record<string, unknown> {
  function _diff(
    count: number,
    prefix: string,
    fromItem: unknown,
    toItem: unknown,
    changeObject: Record<string, unknown>
  ) {
    if (fromItem instanceof Array && toItem instanceof Array) {
      const result = arr(fromItem, toItem, prefix);
      if (result.allChange || result.object) {
        if (result.allChange) {
          count++;
          changeObject[prefix] = toItem;
        } else {
          changeObject = { ...changeObject, ...result.object };
        }
      }
      return { count, changeObject };
    } else if (
      typeof fromItem === 'object' &&
      fromItem !== null &&
      typeof toItem === 'object' &&
      toItem !== null
    ) {
      const result = obj(
        fromItem as Record<string, unknown>,
        toItem as Record<string, unknown>,
        prefix
      );
      if (result.allChange || result.object) {
        if (result.allChange) {
          count++;
          changeObject[prefix] = toItem;
        } else {
          changeObject = { ...changeObject, ...result.object };
        }
      }
      return { count, changeObject };
    } else if (fromItem !== toItem) {
      changeObject[prefix] = toItem === undefined ? null : toItem;
      count++;
      return { count, changeObject };
    }
    return { count, changeObject };
  }
  function obj(
    from: Record<string, unknown>,
    to: Record<string, unknown>,
    prefix: string
  ) {
    const toKeyList = Object.keys(to);
    let changeObject: Record<string, unknown> = {};
    const point = prefix ? '.' : '';
    let count = 0;
    if (Object.keys(from).length !== toKeyList.length) {
      return { allChange: true } as { allChange: boolean; object?: any };
    }
    for (let index = 0; index < toKeyList.length; index++) {
      const key = toKeyList[index];
      const r = _diff(
        count,
        `${prefix}${point}${key}`,
        from[key],
        to[key],
        changeObject
      );
      count = r.count;
      changeObject = r.changeObject;
    }
    if (count === toKeyList.length && toKeyList.length !== 0) {
      return { allChange: true };
    }
    return { allChange: false, object: changeObject };
  }
  function arr(from: unknown[], to: unknown[], prefix: string) {
    let changeObject: Record<string, unknown> = {};
    if (from.length !== to.length) {
      return { allChange: true } as { allChange: boolean; object?: any };
    }
    let count = 0;
    for (let i = 0; i < to.length; i++) {
      const r = _diff(count, `${prefix}[${i}]`, from[i], to[i], changeObject);
      count = r.count;
      changeObject = r.changeObject;
    }
    if (count === to.length && to.length !== 0) {
      return { allChange: true };
    }
    return { allChange: false, object: changeObject };
  }
  function sanitize<T>(value: T, seen = new Set<unknown>()): T {
    if (value === undefined) {
      return null as unknown as T;
    }
    if (!value || typeof value !== 'object') {
      return value;
    }
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);
    if (Array.isArray(value)) {
      return value.map((item) => sanitize(item, seen)) as unknown as T;
    }
    const out: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>).forEach((k) => {
      out[k] = sanitize((value as Record<string, unknown>)[k], seen);
    });
    return out as unknown as T;
  }
  const result = obj(from, to, '');
  if (result.allChange) {
    return sanitize(to) as Record<string, unknown>;
  }
  return sanitize(result.object!) as Record<string, unknown>;
}
