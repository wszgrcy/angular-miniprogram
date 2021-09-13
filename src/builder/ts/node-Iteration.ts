import ts from 'typescript';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nodeIteration(node: ts.Node, fn: (node: ts.Node) => any): void {
  fn(node);
  ts.forEachChild(node, (node) => nodeIteration(node, fn));
}
