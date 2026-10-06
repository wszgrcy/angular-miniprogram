/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { initMiniProgramTestEnv } from '../test-util/init-env';
import { AgentNode } from './agent-node';
import {
  endRender,
  getPageRefreshContext,
  lViewLinkToMPComponentRef,
  propertyChange,
} from './component-template-hook.factory';
import { LVIEW } from './lview-layout';
import { MiniProgramRenderer } from './mini-program.renderer';

function makeMp() {
  const selects: string[] = [];
  const nodesRef = { kind: 'nodesRef' };
  const mp: any = {
    setData(data: any) {
      mp.calls.push(data);
    },
    createSelectorQuery() {
      return {
        select(selector: string) {
          selects.push(selector);
          return nodesRef;
        },
      };
    },
    calls: [] as any[],
    selects,
    nodesRef,
  };
  return mp;
}

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
    const mp = makeMp();
    const first = makeLView([null]);
    getPageRefreshContext(first.lView as any, mp as any);
    expect(first.nodes[0].__refClass).toBe('');

    // 同一个带 # 的节点，这次排在第 1 槽而不是第 0 槽
    const second = makeLView([null, 'box']);
    getPageRefreshContext(second.lView as any, mp as any);

    expect(second.nodes[1].__pathPrefix).toBe('nodeList[1]');
    expect(second.nodes[1].__refClass).toBe('__ar-1');
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
    function makeChild() {
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
    const a = makeChild();
    const b = makeChild();

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

/**
 * 真组件实测：`#ref` 的**影子槽**不能把真前缀盖掉。
 *
 * `saveResolvedLocalsInData` 把 local ref 的值写进 `lView[tNode.index + 1]`，
 * 那个槽里是**同一个 AgentNode**（`tView.data` 在该位置是 `undefined`）。
 * 编译期 `prepareRefsArray` 也为它占了一个空槽并跳过，所以 wxml 从不读它。
 *
 * 早期实现遍历到影子槽时又打了一次前缀，于是节点自报的位置比渲染位置大 1：
 * 渲染出来的 class 是 `__ar-5`，`find()` 却去查 `__ar-6`，永远查不到；
 * 路径式 setData 同样落到没人读的那个槽上。这里用真 Ivy 编译产物钉住它。
 */
describe('可查询 class：#ref 影子槽（真组件）', () => {
  @Component({
    standalone: true,
    selector: 'probe-ref',
    template: `<h1 id="a">{{ t }}</h1><div id="r" #ref1>引用</div><span id="b">x</span>`,
  })
  class ProbeRefComponent {
    t = 'title';
  }

  function render() {
    initMiniProgramTestEnv();
    const fixture = TestBed.createComponent(ProbeRefComponent);
    fixture.detectChanges();
    const hostLView = (fixture as any).componentRef.hostView._lView;
    const lView: any[] = Array.isArray(hostLView[LVIEW.HEADER_OFFSET])
      ? hostLView[LVIEW.HEADER_OFFSET]
      : hostLView;
    const mp = makeMp();
    lViewLinkToMPComponentRef(mp, lView);
    const ctx = getPageRefreshContext(lView, mp);
    const byId = (id: string) =>
      lView.find(
        (v: unknown) => v instanceof AgentNode && v.attribute.id === id,
      ) as AgentNode;
    return { lView, mp, ctx, a: byId('a'), r: byId('r'), b: byId('b') };
  }

  it('影子槽确实让同一个节点占两个 lView 槽', () => {
    const { lView, r } = render();
    expect(
      lView.filter((v: unknown) => v === r).length,
      '影子槽应当让同一个节点出现两次',
    ).toBe(2);
  });

  it('前缀取自己的槽位，兄弟节点跳过影子槽', () => {
    const { a, r, b } = render();
    expect(a.__pathPrefix).toBe('nodeList[0]');
    expect(r.__pathPrefix).toBe('nodeList[2]');
    // 影子槽占掉 3，「引用」文本占 4，span 因此落在 5
    expect(b.__pathPrefix).toBe('nodeList[5]');
    expect(r.__refClass).toBe('__ar-2');
    expect(a.__refClass).toBe('');
  });

  it('find() 查的 class 就是渲染出去的那个', () => {
    const { r, mp } = render();
    expect(r.find()).toBe(mp.nodesRef);
    expect(mp.selects).toEqual(['.__ar-2']);
  });

  it('叶子写入落在真槽位上，不是影子槽', () => {
    const { lView, r, mp } = render();
    propertyChange(lView);
    new MiniProgramRenderer().setProperty(r, 'x', 1);
    endRender();
    expect(mp.calls).toEqual([{ 'nodeList[2].property.x': 1 }]);
  });

  it('影子槽不往 nodeList 里复制一份节点数据', () => {
    const { ctx } = render();
    const list = ctx.nodeList as any[];
    expect(list[2].refClass, '真槽位带着自己的数据').toBe('__ar-2');
    expect(list[3], '影子槽只占位，不复制数据').toEqual({});
  });
});
