import type { MatchedComponentMeta, MatchedDirectiveMeta } from '../type';
import { TagEventMeta } from './event';
import { ComponentContext } from './global-context';

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
  property: string[];
  outputs: TagEventMeta[];
  singleClosedTag: boolean;
  componentMeta: MatchedComponentMeta | undefined;
  directiveMeta: MatchedDirectiveMeta | undefined;
}
export interface NgBoundTextMeta extends NgNodeMeta {
  kind: NgNodeKind.BoundText;
}
export interface NgTextMeta extends NgNodeMeta {
  kind: NgNodeKind.Text;
  value: string;
}

export type NgDirective =
  | NgIfDirective
  | NgForDirective
  | NgSwitchDirective
  | NgDefaultDirective;
export interface NgIfDirective {
  type: 'if';
  thenTemplateRef: string;
  falseTemplateRef: string | null;
}
export interface NgForDirective {
  type: 'for';

  templateName: string;
}
export interface NgSwitchDirective {
  type: 'switch';
  case: boolean;
  default: boolean;
  first: boolean;
  templateName: string;
}
export interface NgDefaultDirective {
  type: 'none';
  name: { name: string; value: string }[];
}
export interface NgTemplateMeta<T = NgDirective> extends NgNodeMeta {
  kind: NgNodeKind.Template;
  children: NgNodeMeta[];
  directive: T[];
  // todo 暂时未使用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staticType: any;
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
}
