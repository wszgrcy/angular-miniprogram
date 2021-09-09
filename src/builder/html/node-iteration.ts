import {
  isBoundText,
  isContent,
  isElement,
  isTemplate,
  isText,
} from './type-protection';
import {
  BoundText,
  Content,
  Element,
  Node,
  Template,
  Text,
} from '@angular/compiler/src/render3/r3_ast';
export interface NodeIterationOptions {
  Element: (node: Element) => any;
  BoundText: (node: BoundText) => any;
  Text: (node: Text) => any;
  Template: (node: Template) => any;
  Content: (node: Content) => any;
  default: (node: any) => any;
}
export function nodeIteration(node: Node, options: NodeIterationOptions) {
  if (isElement(node)) {
    return options.Element(node);
  } else if (isBoundText(node)) {
    return options.BoundText(node);
  } else if (isText(node)) {
    return options.Text(node);
  } else if (isTemplate(node)) {
    return options.Template(node);
  } else if (isContent(node)) {
    return options.Content(node);
  }
  return options.default(node);
}
