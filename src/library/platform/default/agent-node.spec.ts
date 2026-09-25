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
});
