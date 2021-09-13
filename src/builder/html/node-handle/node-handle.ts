import { Node } from '@angular/compiler/src/render3/r3_ast';
import { nodeIteration } from '../node-iteration';
import {
  isBoundText,
  isContent,
  isElement,
  isTemplate,
  isText,
} from '../type-protection';
import { ParsedNgBoundText } from './bound-text';
import { ParsedNgContent } from './content';
import { ParsedNgElement } from './element';
import { GlobalContext } from './global-context';
import { NgNodeMeta, ParsedNode } from './interface';
import { NgTemplate } from './template';
import { ParsedNgText } from './text';

export function generateParsedNode(
  node: Node,
  parent: ParsedNode<NgNodeMeta> | undefined,
  globalContext: GlobalContext
): ParsedNode<NgNodeMeta> {
  return nodeIteration(node, {
    Element: (node) => {
      const instance = new ParsedNgElement(node, parent);
      const childrenInstance = instance
        .getOriginChildren()
        .map((node) => generateParsedNode(node, instance, globalContext));
      instance.setNgNodeChildren(childrenInstance);
      return instance;
    },
    BoundText: (node) => {
      return new ParsedNgBoundText(node, parent);
    },
    Text: (node) => {
      return new ParsedNgText(node, parent);
    },
    Template: (node) => {
      const instance = new NgTemplate(node, parent);

      const childrenInstance = instance
        .getOriginChildren()
        .map((node) => generateParsedNode(node, instance, globalContext));
      instance.setNgNodeChildren(childrenInstance);
      return instance;
    },
    Content: (node) => {
      return new ParsedNgContent(node, parent);
    },
    default: (node) => {
      throw new Error('未实现');
    },
  });
}
