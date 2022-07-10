import type {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstContent,
  TmplAstElement,
  TmplAstIcu,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstVariable,
} from '@angular/compiler';

export type Element = TmplAstElement;
export type Template = TmplAstTemplate;

export type Content = TmplAstContent;
export type Variable = TmplAstVariable;
export type Reference = TmplAstReference;
export type TextAttribute = TmplAstTextAttribute;
export type BoundAttribute = Parameters<
  TmplAstRecursiveVisitor['visitBoundAttribute']
>[0];
export type BoundEvent = TmplAstBoundEvent;
export type Text = TmplAstText;
export type BoundText = TmplAstBoundText;
export type Icu = TmplAstIcu;
export type Node = TmplAstNode;
