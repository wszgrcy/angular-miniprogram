/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Binary,
  Conditional,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  PrefixNot,
  PropertyRead,
} from '@angular/compiler';
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
  return node instanceof Element;
}
export function isBoundText(node: Node): node is BoundText {
  return node instanceof BoundText;
}
export function isText(node: Node): node is Text {
  return node instanceof Text;
}
export function isTemplate(node: Node): node is Template {
  return node instanceof Template;
}
export function isBoundAttribute(node: any): node is BoundAttribute {
  return node instanceof BoundAttribute;
}
export function isContent(node: any): node is Content {
  return node instanceof Content;
}

export function isLiteralPrimitive(node: any): node is LiteralPrimitive {
  return (
    node instanceof LiteralPrimitive ||
    node?.__proto__?.constructor?.name === 'LiteralPrimitive'
  );
}
export function isPropertyRead(node: any): node is PropertyRead {
  return (
    node instanceof PropertyRead ||
    node?.__proto__?.constructor?.name === 'PropertyRead'
  );
}
export function isBinary(node: any): node is Binary {
  return (
    node instanceof Binary || node?.__proto__?.constructor?.name === 'Binary'
  );
}
export function isPrefixNot(node: any): node is PrefixNot {
  return (
    node instanceof PrefixNot ||
    node?.__proto__?.constructor?.name === 'PrefixNot'
  );
}
export function isLiteralArray(node: any): node is LiteralArray {
  return (
    node instanceof LiteralArray ||
    node?.__proto__?.constructor?.name === 'LiteralArray'
  );
}
export function isLiteralMap(node: any): node is LiteralMap {
  return (
    node instanceof LiteralMap ||
    node?.__proto__?.constructor?.name === 'LiteralMap'
  );
}
export function isConditional(node: any): node is Conditional {
  return (
    node instanceof Conditional ||
    node?.__proto__?.constructor?.name === 'Conditional'
  );
}
export function isKeyedRead(node: any): node is KeyedRead {
  return (
    node instanceof KeyedRead ||
    node?.__proto__?.constructor?.name === 'KeyedRead'
  );
}
