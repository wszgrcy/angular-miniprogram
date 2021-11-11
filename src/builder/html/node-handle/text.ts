import { Text } from '@angular/compiler/src/render3/r3_ast';
import { TemplateInterpolationService } from '../template-interpolation.service';
import { NgNodeKind, NgNodeMeta, NgTextMeta, ParsedNode } from './interface';

export class ParsedNgText implements ParsedNode<NgTextMeta> {
  value!: string;
  kind = NgNodeKind.Text;

  constructor(
    private node: Text,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public templateInterpolationService: TemplateInterpolationService,
    public nodeIndex: number
  ) {}
  analysis() {
    this.value = this.node.value;
  }
  getNodeMeta(): NgTextMeta {
    this.analysis();
    return {
      kind: NgNodeKind.Text,
      value: this.value,
      nodeIndex: this.nodeIndex,
    };
  }
}
