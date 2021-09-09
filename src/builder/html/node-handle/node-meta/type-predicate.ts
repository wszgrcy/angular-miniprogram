import {
  NgBoundTextMeta,
  NgContentMeta,
  NgElementMeta,
  NgNodeKind,
  NgNodeMeta,
  NgTemplateMeta,
  NgTextMeta,
} from '../interface';

export function isNgElementMeta(node: NgNodeMeta): node is NgElementMeta {
  return node.kind === NgNodeKind.Element;
}
export function isNgBoundTextMeta(node: NgNodeMeta): node is NgBoundTextMeta {
  return node.kind === NgNodeKind.BoundText;
}
export function isNgConetentMeta(node: NgNodeMeta): node is NgContentMeta {
  return node.kind === NgNodeKind.Content;
}
export function isNgTemplateMeta(node: NgNodeMeta): node is NgTemplateMeta {
  return node.kind === NgNodeKind.Template;
}
export function isNgTextMeta(node: NgNodeMeta): node is NgTextMeta {
  return node.kind === NgNodeKind.Text;
}
