import type { R3ComponentMetadata } from '@angular/compiler';
import { Inject, Injectable } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { ComponentContext, TemplateDefinition } from './parse-node';

@Injectable()
export class ComponentCompilerService {
  constructor(
    private buildPlatform: BuildPlatform,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(COMPONENT_META) private componentMeta: R3ComponentMetadata<any>,
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
    return result;
  }
}
