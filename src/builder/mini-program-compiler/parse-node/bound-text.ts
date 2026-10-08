/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BoundText } from '../../angular-internal/ast.type';
import { getWxsPlan } from '../../wxs/wxs-rewrite';
import {
  NgBoundTextMeta,
  NgNodeKind,
  NgNodeMeta,
  ParsedNode,
} from './interface';

export class ParsedNgBoundText implements ParsedNode<NgBoundTextMeta> {
  kind = NgNodeKind.BoundText;

  constructor(
    private node: BoundText,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public index: number,
  ) {}

  getNodeMeta(): NgBoundTextMeta {
    // 插值里的 wxs 已由 rewriteWxsTemplates 改写并存下计划；未命中时走框架默认的 {{nodeList[i].value}}
    const plan = getWxsPlan((this.node as any).value);
    return {
      kind: NgNodeKind.BoundText,
      index: this.index,
      ...(plan ? { wxsText: plan, wxsHost: this.hostIndex() } : null),
    };
  }

  /**
   * 往上找最近的元素祖先下标。枝叶数组由改写层挂到宿主元素的合成 property 上（文本节点自己带不了
   * 数组），所以 wxml 得按宿主下标去取。中间隔着 ng-container 之类非元素节点时要跳过去。
   */
  private hostIndex(): number {
    let cur = this.parent;
    while (cur) {
      // 只读节点自身字段，不能调 getNodeMeta()：元素的 getNodeMeta 会 map 子节点，又绕回这里，直接无限递归
      const meta = cur as unknown as { kind?: NgNodeKind; index?: number };
      if (meta.kind === NgNodeKind.Element) {
        return meta.index ?? -1;
      }
      cur = cur.parent;
    }
    return -1;
  }
}
