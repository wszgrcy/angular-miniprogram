import {
  nodeListIndices,
  splitWxmlTopLevelBlocks,
} from '../../test/util/wxml-blocks';

/**
 * 分块器单测。重点：**嵌套具名模板**必须被父块完整带走，
 * 不能在第一个 </template> 处截断，否则闭合残尾会污染根区。
 */
describe('wxml 分块器', () => {
  /**
   * 不变量：根区的 <template> 开/闭标签必须**平衡**。
   *
   * 注意不能断言「没有 </template>」——`<template is="x">` 调用标签
   * 本身就带闭合，那是合法的。要防的是**孤儿闭合**（切分不平衡留下的）。
   */
  function assertBalanced(content: string) {
    const opens = (content.match(/<template\b(?![^>]*\/>)/g) || []).length;
    const closes = (content.match(/<\/template>/g) || []).length;
    expect({ opens, closes })
      .withContext(`标签不平衡，说明有残尾: ${content.slice(0, 120)}`)
      .toEqual({ opens: closes, closes: closes });
  }

  it('平铺：两个具名块 + 根区', () => {
    const w =
      '<template name="a"><view>{{nodeList[0].class}}</view></template>' +
      '<template name="b"><view>{{nodeList[1].class}}</view></template>' +
      '<block wx:if="{{hasLoad}}"><view>{{nodeList[2].class}}</view></block>';
    const b = splitWxmlTopLevelBlocks(w);
    expect(b.map((x) => x.name).sort()).toEqual(['__root__', 'a', 'b']);
    expect([
      ...nodeListIndices(b.find((x) => x.name === 'a')!.content),
    ]).toEqual([0]);
    expect([
      ...nodeListIndices(b.find((x) => x.name === '__root__')!.content),
    ]).toEqual([2]);
  });

  it('嵌套：内层具名模板随父块带走，根区不留残尾', () => {
    const w =
      '<template name="outer">' +
      '<view>' +
      '<template name="inner"><text>{{nodeList[5].class}}</text></template>' +
      '</view>' +
      '</template>' +
      '<block wx:if="{{hasLoad}}"><view>{{nodeList[0].class}}</view></block>';

    const b = splitWxmlTopLevelBlocks(w);
    const root = b.find((x) => x.name === '__root__')!;

    // 根区必须干净：不能残留 </view></template> 这类闭合残尾
    assertBalanced(root.content);
    // 且根区不应残留任何具名模板定义的闭合（name= 的都不该在根区）
    expect(root.content).not.toMatch(/<template\b[^>]*\bname=/);
    expect([...nodeListIndices(root.content)]).toEqual([0]);

    // 内层内容应在父块 content 里
    const outer = b.find((x) => x.name === 'outer')!;
    expect([...nodeListIndices(outer.content)]).toEqual([5]);
  });

  it('真实形态：根区含 <template is> 调用，其下标应留在根区', () => {
    const w =
      '<template name="ifBlock_3"><view>{{nodeList[0].class}}</view></template>' +
      '<block wx:if="{{hasLoad}}"><view>{{nodeList[1].class}}' +
      '<block wx:for="{{nodeList[3]}}" wx:key="index">' +
      '<template is="{{item.__templateName||\'ifBlock_3\'}}" data="{{...nodeList[3][index] }}"></template>' +
      '</block></view></block>';
    const b = splitWxmlTopLevelBlocks(w);
    const root = b.find((x) => x.name === '__root__')!;
    assertBalanced(root.content);
    expect([...nodeListIndices(root.content)].sort((a, c) => a - c)).toEqual([
      1, 3,
    ]);
  });

  it('标签深度平衡：多层嵌套不丢闭合标签', () => {
    const w =
      '<template name="A"><view><view><view>x</view></view></view></template>' +
      '<root>{{nodeList[9]}}</root>';
    const b = splitWxmlTopLevelBlocks(w);
    const root = b.find((x) => x.name === '__root__')!;
    assertBalanced(root.content);
    expect([...nodeListIndices(root.content)]).toEqual([9]);
  });
});
