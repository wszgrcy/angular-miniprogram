import type { R3ComponentMetadata } from '@angular/compiler';
import { Inject, Injectable } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { ComponentContext } from './node-handle/component-context';
import { TemplateDefinition } from './template-definition';

@Injectable()
export class ComponentCompiler {
  constructor(
    private buildPlatform: BuildPlatform,
    @Inject(COMPONENT_META) private componentMeta: R3ComponentMetadata,
    private componentContext: ComponentContext
  ) {}

  private collectionNode() {
    const nodes = this.componentMeta.template.nodes;
    const templateDefinition = new TemplateDefinition(
      nodes,
      this.componentContext
    );
    const list = templateDefinition.run();
    return list.map((item) => item.getNodeMeta());
  }

  compile() {
    const nodeList = this.collectionNode();
    const result = this.buildPlatform.templateTransform.compile(nodeList);
    const templateImport = result.template
      ? `<import src="./template${this.buildPlatform.fileExtname.contentTemplate}"/>`
      : '';
    result.content = templateImport + result.content;
    return result;
  }
}
