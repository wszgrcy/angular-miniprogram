import type { ComponentResolutionData } from '@angular/compiler-cli/src/ngtsc/annotations/src/component';
import { Inject, Injectable, Optional } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { COMPONENT_META } from '../token/component.token';
import { ComponentContext } from './node-handle/global-context';
import { NgNodeMeta } from './node-handle/interface';
import { TemplateDefinition } from './template-definition';

@Injectable()
export class TemplateCompiler {
  private nodeMetaList: NgNodeMeta[] = [];
  private templateTransform: BuildPlatform['templateTransform'];
  constructor(
    buildPlatform: BuildPlatform,
    @Inject(COMPONENT_META) private componentMeta: ComponentResolutionData,
    private componentContext: ComponentContext
  ) {
    this.templateTransform = buildPlatform.templateTransform;
  }

  private buildPlatformTemplate() {
    this.collectionNode();
    return this.templateTransform.compile(this.nodeMetaList);
  }
  private collectionNode() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodes = (this.componentMeta as any).template.nodes;
    const templateDefinition = new TemplateDefinition(
      nodes,
      this.componentContext
    );
    const list = templateDefinition.run();
    this.nodeMetaList = list.map((item) =>
      item.getNodeMeta(this.componentContext)
    );
  }

  transform() {
    return this.buildPlatformTemplate();
  }
}
