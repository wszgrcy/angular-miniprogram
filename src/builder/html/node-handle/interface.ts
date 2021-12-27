import { ComponentContext } from './component-context';
import type { MatchedComponent, MatchedDirective } from './type';

export interface ParsedNode<T> {
  kind: NgNodeKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: ParsedNode<any> | undefined;
  getNodeMeta(globalContext: ComponentContext): T;
  index: number;
}
export enum NgNodeKind {
  Element,
  BoundText,
  Text,
  Template,
  Content,
}
export interface NgNodeMeta {
  kind: NgNodeKind;
  index: number;
}
export interface NgElementMeta extends NgNodeMeta {
  kind: NgNodeKind.Element;
  tagName: string;
  children: NgNodeMeta[];
  attributes: Record<string, string>;
  inputs: string[];
  outputs: string[];
  singleClosedTag: boolean;
  componentMeta: MatchedComponent | undefined;
  directiveMeta: MatchedDirective | undefined;
}
export interface NgBoundTextMeta extends NgNodeMeta {
  kind: NgNodeKind.BoundText;
}
export interface NgTextMeta extends NgNodeMeta {
  kind: NgNodeKind.Text;
  value: string;
}

export interface NgTemplateMeta extends NgNodeMeta {
  kind: NgNodeKind.Template;
  children: NgNodeMeta[];
  defineTemplateName: string;
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
}
