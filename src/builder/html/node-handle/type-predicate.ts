import { ParsedNgElement } from './element';
import { NgNodeKind, ParsedNode } from './interface';

export function isElement(node: ParsedNode<any>): node is ParsedNgElement {
  return node.kind === NgNodeKind.Element;
}
