/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  BoundAttribute,
  BoundText,
  Content,
  Element,
  Node,
  Template,
  Text,
} from '@angular/compiler/src/render3/r3_ast';

export function isElement(node: Node): node is Element {
  return (node as any)?.__proto__?.constructor?.name === 'Element';
}
export function isBoundText(node: Node): node is BoundText {
  return (node as any)?.__proto__?.constructor?.name === 'BoundText';
}
export function isText(node: Node): node is Text {
  return (node as any)?.__proto__?.constructor?.name === 'Text';
}
export function isTemplate(node: Node): node is Template {
  return (node as any)?.__proto__?.constructor?.name === 'Template';
}
export function isBoundAttribute(node: any): node is BoundAttribute {
  return (node as any)?.__proto__?.constructor?.name === 'BoundAttribute';
}
export function isContent(node: any): node is Content {
  return (node as any)?.__proto__?.constructor?.name === 'Content';
}
