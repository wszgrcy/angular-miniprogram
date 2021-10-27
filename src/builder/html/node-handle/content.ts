import { Content } from '@angular/compiler/src/render3/r3_ast';
import { TemplateInterpolationService } from '../template-interpolation.service';
import { NgContentMeta, NgNodeKind, NgNodeMeta, ParsedNode } from './interface';

export class ParsedNgContent implements ParsedNode<NgContentMeta> {
  kind = NgNodeKind.Content;
  bindValueList = [];
  constructor(
    private node: Content,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public templateInterpolationService: TemplateInterpolationService
  ) {}
  getNodeMeta(): NgContentMeta {
    const nameAttr = this.node.attributes.find((item) => item.name === 'name');

    return {
      kind: NgNodeKind.Content,
      name: nameAttr ? nameAttr.value : undefined,
    };
  }
  getBindValueList() {
    return [];
  }
  getParentBindValueList() {
    return [];
  }
}
