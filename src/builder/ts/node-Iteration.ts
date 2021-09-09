import ts from 'typescript';

export function nodeIteration(node: ts.Node, fn: (node: ts.Node) => any): void {
  fn(node);
  ts.forEachChild(node, (node) => nodeIteration(node, fn));
}
