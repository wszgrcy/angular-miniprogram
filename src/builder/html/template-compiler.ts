import {
  DEFAULT_INTERPOLATION_CONFIG,
  HtmlParser,
  InterpolationConfig,
  SelectorMatcher,
  makeBindingParser,
} from '@angular/compiler';

import {
  Render3ParseResult,
  htmlAstToRender3Ast,
} from '@angular/compiler/src/render3/r3_template_transform';
import { Inject, Injectable, Optional } from 'static-injector';
import { BuildPlatform } from '../platform/platform';
import { PlatformInfo } from '../platform/platform-info';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
  DIRECTIVE_MATCHER,
  TEMPLATE_COMPILER_OPTIONS_TOKEN,
} from '../token/component.token';

import { TemplateGlobalContext } from './node-handle/global-context';
import { NgNodeMeta } from './node-handle/interface';

import { TemplateDefinition } from './template-definition';
import { TemplateInterpolationService } from './template-interpolation.service';

@Injectable()
export class TemplateCompiler {
  private render3ParseResult!: Render3ParseResult;
  private nodeMetaList: NgNodeMeta[] = [];
  private templateTransform: PlatformInfo['templateTransform'];
  private globalContext: TemplateGlobalContext;
  constructor(
    @Inject(COMPONENT_FILE_NAME_TOKEN) private url: string,
    @Inject(COMPONENT_TEMPLATE_CONTENT_TOKEN) private content: string,
    @Optional()
    @Inject(TEMPLATE_COMPILER_OPTIONS_TOKEN)
    private options: { interpolation?: string[] },
    private templateInterpolationService: TemplateInterpolationService,
    buildPlatform: BuildPlatform,
    @Inject(DIRECTIVE_MATCHER) directiveMatcher: SelectorMatcher
  ) {
    this.globalContext = new TemplateGlobalContext(directiveMatcher);
    this.options = this.options || {};
    this.templateTransform = buildPlatform.templateTransform;
    this.templateTransform.setGlobalContext(this.globalContext);
  }
  private parseHtmlToAst() {
    const parser = new HtmlParser();
    let interpolation: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG;
    if (this.options.interpolation) {
      interpolation = new InterpolationConfig(
        this.options.interpolation[0],
        this.options.interpolation[1]
      );
    }
    const parseTreeResult = parser.parse(this.content, this.url, {
      interpolationConfig: interpolation,
    });
    const bindingParser = makeBindingParser(interpolation);
    this.render3ParseResult = htmlAstToRender3Ast(
      parseTreeResult.rootNodes,
      bindingParser,
      {
        collectCommentNodes: true,
      }
    );
  }
  private buildPlatformTemplate() {
    this.parseNode();
    return this.templateTransform.compile(this.nodeMetaList);
  }
  private parseNode() {
    const nodes = this.render3ParseResult.nodes;
    const service = this.templateInterpolationService;
    const templateDefinition = new TemplateDefinition(
      nodes,
      this.globalContext,
      this.templateInterpolationService
    );
    const list = templateDefinition.run();
    list.forEach((item) => {
      this.nodeMetaList.push(item.getNodeMeta(this.globalContext));
    });
  }

  transform() {
    this.parseHtmlToAst();
    const content = this.buildPlatformTemplate();
    const template = this.templateTransform.getExportTemplate();

    return {
      content: content,
      template: template,
      logic: this.templateTransform.getLogic(),
      htmlTemplate: Array.from(this.templateInterpolationService.pipes)
        .map((pipe) => `{{''|${pipe}}}`)
        .join(''),
    };
  }
}
