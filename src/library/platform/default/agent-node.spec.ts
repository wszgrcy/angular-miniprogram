import { AgentNode } from './agent-node';
import { diffNodeData } from './diff-node-data';

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
    element.attribute.style = 'display:flex';
    expect(element.toView()).toEqual({
      class: 'class1',
      style: 'color:red;display:flex',
      property: { property1: 1 },
    });
    const text = new AgentNode('text');
    text.value = 'content';
    expect(text.toView()).toEqual({ value: 'content' });
  });
  it('#6 缓存：未标脏时 toView() 返回同一对象引用', () => {
    const el = new AgentNode('element');
    el.property['a'] = 1;
    const v1 = el.toView();
    const v2 = el.toView();
    // 未变更 → 同一对象，上层 diff 引用相等即跳过
    expect(v1).toBe(v2);
  });
  it('#6 标脏后 toView() 返回新对象并反映变更', () => {
    const el = new AgentNode('element');
    el.property['a'] = 1;
    const v1 = el.toView();
    el.property['a'] = 2;
    el.markDirty();
    const v2 = el.toView();
    expect(v2).not.toBe(v1);
    expect((v2 as any).property.a).toBe(2);
    expect((v1 as any).property.a).toBe(1); // 旧视图不被污染
  });
  it('#6 标脏后再 toView 两次又回到缓存（同一引用）', () => {
    const el = new AgentNode('element');
    el.property['a'] = 1;
    el.toView();
    el.markDirty();
    const v2 = el.toView();
    const v3 = el.toView();
    expect(v2).toBe(v3);
  });
  it('#6 脏节点与缓存节点混合时 diff 只报脏节点变更', () => {
    // 模拟两轮刷新：clean 节点复用缓存，dirty 节点重序列化
    const clean = new AgentNode('element');
    clean.property['x'] = 10;
    const dirty = new AgentNode('element');
    dirty.property['y'] = 1;

    const lastCtx = { nodeList: [clean.toView(), dirty.toView()] };
    // 只改 dirty 节点
    dirty.property['y'] = 2;
    dirty.markDirty();
    const curCtx = { nodeList: [clean.toView(), dirty.toView()] };

    // clean 节点两轮是同一引用 → diff 应跳过它
    expect(curCtx.nodeList[0]).toBe(lastCtx.nodeList[0]);
    // dirty 节点两轮不同
    expect(curCtx.nodeList[1]).not.toBe(lastCtx.nodeList[1]);

    const diff = diffNodeData(lastCtx as any, curCtx as any);
    const diffStr = JSON.stringify(diff);
    // diff 不应包含 clean 节点（下标 0）
    expect(diffStr).not.toContain('nodeList[0]');
    // 只报脏节点（下标 1）的 property 变更
    expect(diffStr).toContain('nodeList[1]');
    expect(diffStr).toContain('"y":2');
  });
});
