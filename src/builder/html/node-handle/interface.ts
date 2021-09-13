import {
  BoundAttribute,
  BoundEvent,
  Node,
} from '@angular/compiler/src/render3/r3_ast';
import { TagEventMeta } from './event';
import { GlobalContext } from './global-context';
import { BindValue, PlainValue } from './value';

export interface ParsedNode<T> {
  kind: NgNodeKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: ParsedNode<any> | undefined;
  bindValueList: string[];
  autoGenerateValueList?: string[];
  getNodeMeta(globalContext: GlobalContext): T;
  getBindValueList(): string[];
  getParentBindValueList(): string[];
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
}
export interface NgElementMeta extends NgNodeMeta {
  kind: NgNodeKind.Element;
  tagName: string;
  children: NgNodeMeta[];
  attributes: Record<string, string>;
  inputs: Record<string, string>;
  outputs: TagEventMeta[];
  singleClosedTag: boolean;
  data: string[];
}
export interface NgBoundTextMeta extends NgNodeMeta {
  kind: NgNodeKind.BoundText;
  values: (BindValue | PlainValue)[];
  data: string[];
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
  assert: BindValue | PlainValue;
  thenTemplateRef: BindValue | undefined;
  falseTemplateRef: BindValue;
}
export interface NgForDirective {
  type: 'for';
  for: BindValue | PlainValue;
  item: string;
  index: string;
}
export interface NgSwitchDirective {
  type: 'switch';
  switchValue: string;
  case: BindValue | PlainValue | undefined;
  default: boolean;
  first: boolean;
}
export interface NgDefaultDirective {
  type: 'none';
  name: { name: string; value: string }[];
}
export interface NgTemplateMeta<T = NgDirective> extends NgNodeMeta {
  kind: NgNodeKind.Template;
  children: NgNodeMeta[];
  directive: T;
  data: string[];
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
}
