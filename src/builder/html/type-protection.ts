/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BoundAttribute,
  BoundText,
  Content,
  Element,
  Node,
  Template,
  Text,
} from '@angular/compiler/src/render3/r3_ast';

export function isElement(node: Node): node is Element {
  return (
    node instanceof Element ||
    (node as any)?.__proto__?.constructor?.name === 'Element'
  );
}
export function isBoundText(node: Node): node is BoundText {
  return (
    node instanceof BoundText ||
    (node as any)?.__proto__?.constructor?.name === 'BoundText'
  );
}
export function isText(node: Node): node is Text {
  return (
    node instanceof Text ||
    (node as any)?.__proto__?.constructor?.name === 'Text'
  );
}
export function isTemplate(node: Node): node is Template {
  return (
    node instanceof Template ||
    (node as any)?.__proto__?.constructor?.name === 'Template'
  );
}
export function isBoundAttribute(node: any): node is BoundAttribute {
  return (
    node instanceof BoundAttribute ||
    (node as any)?.__proto__?.constructor?.name === 'BoundAttribute'
  );
}
export function isContent(node: any): node is Content {
  return (
    node instanceof Content ||
    (node as any)?.__proto__?.constructor?.name === 'Content'
  );
}
