import { AgentNode } from './agent-node';

function getAgentNode() {
  return new AgentNode('element');
}
describe('AgentNode', () => {
  it('appendChild', () => {
    const root = new AgentNode('element');
    const child1 = new AgentNode('element');
    root.appendChild(child1);
    expect(root.children[0]).toBe(child1);
    expect(child1.parent).toBe(root);
    expect(child1.nextSibling).toBe(undefined);
    const child2 = new AgentNode('element');
    root.appendChild(child2);
    expect(root.children.length).toBe(2);
    expect(child2.parent).toBe(root);
    expect(child1.nextSibling).toBe(child2);
    expect(child2.nextSibling).toBe(undefined);
  });
  it('setParent', () => {
    const parent1 = getAgentNode();
    const child1 = getAgentNode();
    parent1.appendChild(child1);
    expect(child1.parent).toBe(parent1);
    const parent2 = getAgentNode();
    child1.setParent(parent2);
    expect(child1.parent).toBe(parent2);
    expect(parent1.children.length).toBe(0);
    expect(parent2.children.length).toBe(1);
  });
  it('insertBefore', () => {
    const parent1 = getAgentNode();
    const child1 = getAgentNode();
    const child2 = getAgentNode();
    parent1.appendChild(child1);
    parent1.insertBefore(child2, child1);
    expect(parent1.children.length).toBe(2);
    expect(parent1.children[0]).toBe(child2);
    expect(parent1.children[1]).toBe(child1);
    expect(parent1.children[0].nextSibling).toBe(parent1.children[1]);
    const child3 = getAgentNode();
    parent1.insertBefore(child3, child1);
    expect(parent1.children[1]).toBe(child3);
    expect(parent1.children[2]).toBe(child1);
    expect(parent1.children[1].nextSibling).toBe(parent1.children[2]);
  });
  /**
   * `refChild` 为 null 时是 append，不是报错。DOM 的 `insertBefore(x, null)` 就是追加，而
   * `ɵɵi18nStart` 恰恰传 null（只有 `parentTNode.type & ElementContainer` 才有 insertInFrontOf）。
   */
  it('insertBefore(child, null) 等价于 appendChild', () => {
    const parent = getAgentNode();
    const first = getAgentNode();
    const second = getAgentNode();
    parent.appendChild(first);
    parent.insertBefore(second, null as never);

    expect(parent.children.length).toBe(2);
    expect(parent.children[1]).toBe(second);
    expect(
      second.parent,
      'append 也必须认父，否则 removeChild 找不到自己',
    ).toBe(parent);
    expect(first.nextSibling).toBe(second);

    // 空父节点上插 null 同样成立
    const empty = getAgentNode();
    const only = getAgentNode();
    empty.insertBefore(only, null as never);
    expect(empty.children).toEqual([only]);
  });

  it('removeChild', () => {
    const root = getAgentNode();
    const list = new Array(3).fill(undefined).map(() => getAgentNode());
    list.forEach((item) => {
      root.appendChild(item);
    });
    root.removeChild(list[1]);
    expect(root.children.length).toBe(2);
    expect(root.children[0].nextSibling).toBe(root.children[1]);
    root.removeChild(list[2]);
    expect(root.children.length).toBe(1);
    expect(root.children[0].nextSibling).toBe(undefined);
    root.removeChild(list[0]);
    expect(root.children.length).toBe(0);
    list.forEach((item) => {
      expect(item.nextSibling).toBe(undefined);
      expect(item.parent).toBe(undefined);
    });
  });
  it('toView', () => {
    const element = new AgentNode('element');
    element.classList.add('class1');
    element.style['color'] = 'red';
    element.property['property1'] = 1;
    // class / style 属性就是整体重设一个串
    element.attribute.class = 'from-attr';
    element.attribute.style = 'display:flex';
    // 静态 i18n 属性走 setAttribute，wxml 要从数据里读它
    element.attribute.title = 'Settings';
    expect(element.toView()).toEqual({
      class: 'class1 from-attr',
      // 属性在前、动态在后：CSS 里后写的声明赢
      style: 'display:flex;color:red',
      property: { property1: 1 },
      // class / style 已由上面两个字段汇总，不重复塞进 attribute
      attribute: { title: 'Settings' },
    });
    const text = new AgentNode('text');
    text.value = 'content';
    expect(text.toView()).toEqual({ value: 'content' });
  });

  /**
   * 空串不发。绝大多数元素从头到尾没碰过 class / style，发一个空串就是白占 setData 体积，
   * 也是每轮全量 diff 白比一次。wxml 那边同样只在编译期判定「用到了」才读这个 key，两边同进同退。
   */
  it('toView 不发空的 class / style', () => {
    expect(new AgentNode('element').toView()).toEqual({
      property: {},
      attribute: {},
    });
  });

  it('toView 只发用到的那半', () => {
    const onlyClass = new AgentNode('element');
    onlyClass.classList.add('a');
    expect(onlyClass.toView()).toEqual({
      class: 'a',
      property: {},
      attribute: {},
    });

    const onlyStyle = new AgentNode('element');
    onlyStyle.style['color'] = 'red';
    expect(onlyStyle.toView()).toEqual({
      style: 'color:red',
      property: {},
      attribute: {},
    });
  });

  it('只有尾分号的静态 style 不算用了 style 通道', () => {
    const element = new AgentNode('element');
    // Angular 递过来的空 style 属性会被规范化成一个分号
    element.attribute.style = ';';
    expect(element.styleString()).toBe('');
    expect(element.toView()).not.toHaveProperty('style');
  });
});
