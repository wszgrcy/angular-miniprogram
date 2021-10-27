import {
  DEFAULT_INTERPOLATION_CONFIG,
  HtmlParser,
  InterpolationConfig,
  makeBindingParser,
} from '@angular/compiler';

import { Node } from '@angular/compiler/src/render3/r3_ast';
import {
  Render3ParseResult,
  htmlAstToRender3Ast,
} from '@angular/compiler/src/render3/r3_template_transform';
import { Inject, Injectable, Injector } from 'static-injector';
import { TemplateTransformBase } from '../template-transform-strategy/transform.base';
import {
  COMPONENT_FILE_NAME_TOKEN,
  TEMPLATE_COMPILER_OPTIONS_TOKEN,
} from '../token/component.token';
import { ParsedNgBoundText } from './node-handle/bound-text';
import { ParsedNgContent } from './node-handle/content';
import { ParsedNgElement } from './node-handle/element';
import { TemplateGlobalContext } from './node-handle/global-context';
import {
  NgBoundTextMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
  ParsedNode,
} from './node-handle/interface';
import {
  isNgBoundTextMeta,
  isNgElementMeta,
  isNgTemplateMeta,
} from './node-handle/node-meta/type-predicate';
import { NgTemplate } from './node-handle/template';
import { ParsedNgText } from './node-handle/text';
import { nodeIteration } from './node-iteration';
import { TemplateInterpolationService } from './template-interpolation.service';

@Injectable()
export class TemplateCompiler {
  private render3ParseResult!: Render3ParseResult;
  private nodeMetaList: NgNodeMeta[] = [];
  globalContext = new TemplateGlobalContext();
  constructor(
    @Inject(COMPONENT_FILE_NAME_TOKEN) private url: string,
    @Inject(COMPONENT_FILE_NAME_TOKEN) private content: string,
    private templateTransform: TemplateTransformBase,
    @Inject(TEMPLATE_COMPILER_OPTIONS_TOKEN)
    private options: { interpolation?: string[] } = {}
  ) {
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
    const service = new TemplateInterpolationService();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const parsedNode = this.generateParsedNode(node, undefined, service);
      this.nodeMetaList.push(parsedNode.getNodeMeta(this.globalContext));
    }
  }

  transform() {
    this.parseHtmlToAst();
    const content = this.buildPlatformTemplate();
    const template = this.templateTransform.getExportTemplate();
    const context = this.nodeMetaList
      .filter(
        (item) =>
          isNgElementMeta(item) ||
          isNgTemplateMeta(item) ||
          isNgBoundTextMeta(item)
      )
      .map(
        (item) =>
          (item as NgElementMeta | NgTemplateMeta | NgBoundTextMeta).data
      )
      .reduce((pre, cur) => {
        pre.push(...cur);
        return pre;
      }, []);
    return {
      content: content,
      template: template,
      context: Array.from(new Set(context)),
      logic: this.templateTransform.getLogic(),
    };
  }

  generateParsedNode(
    node: Node,
    parent: ParsedNode<NgNodeMeta> | undefined,
    service: TemplateInterpolationService
  ): ParsedNode<NgNodeMeta> {
    return nodeIteration(node, {
      Element: (node) => {
        const instance = new ParsedNgElement(node, parent, service);
        const childrenInstance = instance
          .getOriginChildren()
          .map((node) => this.generateParsedNode(node, instance, service));
        instance.setNgNodeChildren(childrenInstance);
        return instance;
      },
      BoundText: (node) => {
        return new ParsedNgBoundText(node, parent, service);
      },
      Text: (node) => {
        return new ParsedNgText(node, parent, service);
      },
      Template: (node) => {
        const instance = new NgTemplate(node, parent, service);
        const childService = new TemplateInterpolationService();
        const childrenInstance = instance
          .getOriginChildren()
          .map((node) => this.generateParsedNode(node, instance, childService));
        instance.setNgNodeChildren(childrenInstance);
        return instance;
      },
      Content: (node) => {
        return new ParsedNgContent(node, parent, service);
      },
      default: (node) => {
        throw new Error('未实现');
      },
    });
  }
}
