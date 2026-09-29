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
    // 插值里的 wxs 已由 rewriteWxsTemplates 改写并存下计划；
    // 未命中时返回 undefined，走框架默认的 {{nodeList[i].value}}。
    const plan = getWxsPlan((this.node as any).value);
    return {
      kind: NgNodeKind.BoundText,
      index: this.index,
      ...(plan ? { wxsText: plan } : null),
    };
  }
}
