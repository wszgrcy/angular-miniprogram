import {
  DEFAULT_INTERPOLATION_CONFIG,
  HtmlParser,
  InterpolationConfig,
  SelectorMatcher,
  makeBindingParser,
} from '@angular/compiler';
import { ComponentResolutionData } from '@angular/compiler-cli/src/ngtsc/annotations/src/component';

import {
  Render3ParseResult,
  htmlAstToRender3Ast,
} from '@angular/compiler/src/render3/r3_template_transform';
import { Inject, Injectable, Optional } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { PlatformInfo } from '../platform/platform-info';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_META,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
  DIRECTIVE_MATCHER,
  TEMPLATE_COMPILER_OPTIONS_TOKEN,
} from '../token/component.token';

import { TemplateGlobalContext } from './node-handle/global-context';
import { NgNodeMeta } from './node-handle/interface';

import { TemplateDefinition } from './template-definition';

@Injectable()
export class TemplateCompiler {
  private nodeMetaList: NgNodeMeta[] = [];
  private templateTransform: PlatformInfo['templateTransform'];
  private globalContext: TemplateGlobalContext;
  constructor(
    buildPlatform: BuildPlatform,
    @Inject(DIRECTIVE_MATCHER) directiveMatcher: SelectorMatcher,
    @Inject(COMPONENT_META) private componentMeta: ComponentResolutionData
  ) {
    this.globalContext = new TemplateGlobalContext(directiveMatcher);
    this.templateTransform = buildPlatform.templateTransform;
  }

  private buildPlatformTemplate() {
    this.collectionNode();
    return this.templateTransform.compile(this.nodeMetaList);
  }
  private collectionNode() {
    const nodes = (this.componentMeta as any).template.nodes;
    const templateDefinition = new TemplateDefinition(
      nodes,
      this.globalContext
    );
    const list = templateDefinition.run();
    this.nodeMetaList = list.map((item) =>
      item.getNodeMeta(this.globalContext)
    );
  }

  transform() {
    return {
      content: this.buildPlatformTemplate(),
      template: this.templateTransform.getExportTemplate(),
      meta: this.templateTransform.getExportMeta(),
    };
  }
}
