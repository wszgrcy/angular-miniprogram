/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentNode } from './agent-node';
import { getPageRefreshContext } from './component-template-hook.factory';
import { LVIEW } from './lview-layout';

/**
 * 可查询 class（`AgentNode.find()` 的定位凭据）。
 *
 * ## 要证明的核心命题
 *
 * 1. 只有模板上带 `#`（`TNode.localNames` 非空）的节点才拿到 class，
 *    没 `#` 的节点连 `refClass` 这个 key 都不进 setData。
 * 2. class 取自 `__pathPrefix` 的下标序列，所以它与被标注的节点出自
 *    同一次遍历、同一次 setData，不可能对不上。
 * 3. 内嵌视图用**全路径**，与外层局部下标不撞；`@for` 多实例天然不撞。
 * 4. `find()` 落在渲染该节点的那个 MP 实例上，且拿不到凭据时返回 null。
 */
describe('可查询 class', () => {
  /** 造一个合成 lView：每个槽位可选地挂一个带 localNames 的 TNode */
  function makeLView(refs: (string | null)[]) {
    const lView: any[] = [];
    const data: any[] = [];
    lView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + refs.length, data };
    const nodes: AgentNode[] = [];
    refs.forEach((ref, k) => {
      const node = new AgentNode('element');
      node.name = `node-${k}`;
      nodes.push(node);
      const i = LVIEW.HEADER_OFFSET + k;
      lView[i] = node;
      // `<div #x>` 编译出的 localNames 是 ['x', -1]，-1 = 就是这个元素自己
      data[i] = { localNames: ref ? [ref, -1] : null };
    });
    return { lView, nodes };
  }

  function makeMp() {
    const selects: string[] = [];
    const nodesRef = { kind: 'nodesRef' };
    const mp: any = {
      setData() {},
      createSelectorQuery() {
        return {
          select(selector: string) {
            selects.push(selector);
            return nodesRef;
          },
        };
      },
      selects,
      nodesRef,
    };
    return mp;
  }

  it('带 # 的节点拿到 __ar-<下标> class，并进入 toView()', () => {
    const { lView, nodes } = makeLView(['box', null]);
    getPageRefreshContext(lView as any, makeMp() as any);

    expect(nodes[0].__refClass).toBe('__ar-0');
    expect((nodes[0].toView() as any).refClass).toBe('__ar-0');
  });

  it('没 # 的节点不发 refClass，也不污染 class', () => {
    const { lView, nodes } = makeLView([null]);
    nodes[0].classList.add('mine');
    getPageRefreshContext(lView as any, makeMp() as any);

    expect(nodes[0].__refClass).toBe('');
    const view = nodes[0].toView() as any;
    expect('refClass' in view).toBe(false);
    expect(view.class).toBe('mine');
  });

  it('class 跟着路径走：结构位移后重新序列化即刷新', () => {
    const { lView, nodes } = makeLView(['box']);
    const mp = makeMp();
    getPageRefreshContext(lView as any, mp as any);
    expect(nodes[0].__refClass).toBe('__ar-0');

    // 前面插一个节点，原节点整体后移一位
    const inserted = new AgentNode('element');
    lView.splice(LVIEW.HEADER_OFFSET, 0, inserted);
    lView[1].bindingStartIndex++;
    lView[1].data.splice(LVIEW.HEADER_OFFSET, 0, { localNames: null });
    getPageRefreshContext(lView as any, mp as any);

    expect(nodes[0].__pathPrefix).toBe('nodeList[1]');
    expect(nodes[0].__refClass).toBe('__ar-1');
  });

  it('内嵌视图用全路径，与外层局部下标不撞', () => {
    const childLView: any[] = [];
    childLView[1] = {
      bindingStartIndex: LVIEW.HEADER_OFFSET + 1,
      data: { [LVIEW.HEADER_OFFSET]: { localNames: ['inner', -1] } },
      declTNode: { localNames: ['tpl'] },
    };
    const inner = new AgentNode('element');
    childLView[LVIEW.HEADER_OFFSET] = inner;

    const parentLView: any[] = [];
    parentLView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 2, data: {} };
    const container: any = [null, true];
    container[LVIEW.CONTAINER_HEADER_OFFSET] = childLView;
    parentLView[LVIEW.HEADER_OFFSET + 0] = container;
    const outer = new AgentNode('element');
    parentLView[LVIEW.HEADER_OFFSET + 1] = outer;

    getPageRefreshContext(parentLView as any, makeMp() as any);

    // 内外层局部下标都是 0，全路径把它们分开了
    expect(inner.__pathPrefix).toBe('nodeList[0][0].nodeList[0]');
    expect(inner.__refClass).toBe('__ar-0-0-0');
    expect(outer.__refClass).toBe('');
  });

  it('@for 的两个视图实例各自一条路径', () => {
    function makeChild(viewIndex: number) {
      const childLView: any[] = [];
      childLView[1] = {
        bindingStartIndex: LVIEW.HEADER_OFFSET + 1,
        data: { [LVIEW.HEADER_OFFSET]: { localNames: ['row', -1] } },
        declTNode: { localNames: ['tpl'] },
      };
      const node = new AgentNode('element');
      childLView[LVIEW.HEADER_OFFSET] = node;
      return { childLView, node };
    }
    const a = makeChild(0);
    const b = makeChild(1);

    const parentLView: any[] = [];
    parentLView[1] = { bindingStartIndex: LVIEW.HEADER_OFFSET + 1, data: {} };
    const container: any = [null, true];
    container[LVIEW.CONTAINER_HEADER_OFFSET] = a.childLView;
    container[LVIEW.CONTAINER_HEADER_OFFSET + 1] = b.childLView;
    parentLView[LVIEW.HEADER_OFFSET + 0] = container;

    getPageRefreshContext(parentLView as any, makeMp() as any);

    expect(a.node.__refClass).toBe('__ar-0-0-0');
    expect(b.node.__refClass).toBe('__ar-0-1-0');
  });

  it('find() 在渲染该节点的实例上 select，拿不到实例时返回 null', () => {
    const { lView, nodes } = makeLView(['box']);
    const mp = makeMp();

    // 还没序列化过：没有凭据
    expect(nodes[0].find()).toBeNull();

    // 序列化过但没传 mpRef（只取快照的场景）：有 class，无作用域
    getPageRefreshContext(lView as any);
    expect(nodes[0].__refClass).toBe('__ar-0');
    expect(nodes[0].find()).toBeNull();

    getPageRefreshContext(lView as any, mp as any);
    expect(nodes[0].find()).toBe(mp.nodesRef);
    expect(mp.selects).toEqual(['.__ar-0']);
  });

  it('text 节点没有 class 通道，find() 恒为 null', () => {
    const lView: any[] = [];
    lView[1] = {
      bindingStartIndex: LVIEW.HEADER_OFFSET + 1,
      data: { [LVIEW.HEADER_OFFSET]: { localNames: ['txt', -1] } },
    };
    const text = new AgentNode('text');
    text.value = 'hi';
    lView[LVIEW.HEADER_OFFSET] = text;

    getPageRefreshContext(lView as any, makeMp() as any);
    expect(text.__refClass).toBe('');
    expect(text.find()).toBeNull();
  });
});
