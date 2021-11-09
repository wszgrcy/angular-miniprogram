import { TemplateInterpolationService } from '../template-interpolation.service';
import { TagEventMeta } from './event';
import { TemplateGlobalContext } from './global-context';
import { BindValue, PlainValue } from './value';

export interface ParsedNode<T> {
  kind: NgNodeKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: ParsedNode<any> | undefined;
  templateInterpolationService: TemplateInterpolationService;
  getNodeMeta(globalContext: TemplateGlobalContext): T;
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
  inputs: Record<string, PlainValue | BindValue>;
  outputs: TagEventMeta[];
  singleClosedTag: boolean;
  componentMeta: {
    index: number | undefined;
    outputs: string[];
  };
}
export interface NgBoundTextMeta extends NgNodeMeta {
  kind: NgNodeKind.BoundText;
  values: (BindValue | PlainValue)[];
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
  templateName: string;
}
export interface NgSwitchDirective {
  type: 'switch';
  switchValue: BindValue | PlainValue;
  case: BindValue | PlainValue | undefined;
  default: boolean;
  first: boolean;
  templateName: string;
  index: number;
}
export interface NgDefaultDirective {
  type: 'none';
  name: { name: string; value: string }[];
}
export interface NgTemplateMeta<T = NgDirective> extends NgNodeMeta {
  kind: NgNodeKind.Template;
  children: NgNodeMeta[];
  directive: T[];
  staticType: any;
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
}
