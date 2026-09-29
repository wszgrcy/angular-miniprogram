import type { R3ComponentMetadata } from '@angular/compiler';
import { inject } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { ComponentContext, TemplateDefinition } from './parse-node';

export class ComponentCompilerService {
  private buildPlatform = inject(BuildPlatform);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private componentMeta = inject<R3ComponentMetadata<any>>(COMPONENT_META);
  private componentContext = inject(ComponentContext);

  private collectionNode() {
    const nodes = this.componentMeta.template.nodes;
    const templateDefinition = new TemplateDefinition(
      nodes,
      this.componentContext,
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
