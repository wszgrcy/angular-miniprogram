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
