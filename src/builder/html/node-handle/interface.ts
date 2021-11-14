import { TagEventMeta } from './event';
import { TemplateGlobalContext } from './global-context';

export interface ParsedNode<T> {
  kind: NgNodeKind;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: ParsedNode<any> | undefined;
  getNodeMeta(globalContext: TemplateGlobalContext): T;
  nodeIndex: number;
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
  nodeIndex: number;
}
export interface NgElementMeta extends NgNodeMeta {
  kind: NgNodeKind.Element;
  tagName: string;
  children: NgNodeMeta[];
  attributes: Record<string, string>;
  property: string[];
  outputs: TagEventMeta[];
  singleClosedTag: boolean;
  componentMeta: {
    outputs: string[];
    isComponent: boolean;
  };
  directiveMeta: { listeners: string[] } | undefined;
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
  falseTemplateRef: string;
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
  staticType: any;
}
export interface NgContentMeta extends NgNodeMeta {
  kind: NgNodeKind.Content;
  name: string | undefined;
}
