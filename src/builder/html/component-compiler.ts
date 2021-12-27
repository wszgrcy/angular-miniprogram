import type { R3ComponentMetadata } from '@angular/compiler';
import { Inject, Injectable } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { ComponentContext } from './node-handle/component-context';
import type { NgNodeMeta } from './node-handle/interface';
import { TemplateDefinition } from './template-definition';

@Injectable()
export class ComponentCompiler {
  private nodeMetaList: NgNodeMeta[] = [];
  private templateTransform: BuildPlatform['templateTransform'];
  constructor(
    private buildPlatform: BuildPlatform,
    @Inject(COMPONENT_META) private componentMeta: R3ComponentMetadata,
    private componentContext: ComponentContext
  ) {
    this.templateTransform = buildPlatform.templateTransform;
  }

  private collectionNode() {
    const nodes = this.componentMeta.template.nodes;
    const templateDefinition = new TemplateDefinition(
      nodes,
      this.componentContext
    );
    const list = templateDefinition.run();
    this.nodeMetaList = list.map((item) =>
      item.getNodeMeta(this.componentContext)
    );
  }

  compile() {
    this.collectionNode();
    const result = this.templateTransform.compile(this.nodeMetaList);
    const templateImport = result.template
      ? `<import src="./template${this.buildPlatform.fileExtname.contentTemplate}"/>`
      : '';
    result.content = templateImport + result.content;
    return result;
  }
}
