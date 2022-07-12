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
