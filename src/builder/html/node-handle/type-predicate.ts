import { ParsedNgElement } from './element';
import { NgNodeKind, ParsedNode } from './interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isElement(node: ParsedNode<any>): node is ParsedNgElement {
  return node.kind === NgNodeKind.Element;
}
