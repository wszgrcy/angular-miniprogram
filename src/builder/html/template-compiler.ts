import {
  DEFAULT_INTERPOLATION_CONFIG,
  HtmlParser,
  InterpolationConfig,
  makeBindingParser,
} from '@angular/compiler';

import {
  Render3ParseResult,
  htmlAstToRender3Ast,
} from '@angular/compiler/src/render3/r3_template_transform';
import { TemplateTransformBase } from '../template-transform-strategy/transform.base';
import { GlobalContext } from './node-handle/global-context';
import {
  NgBoundTextMeta,
  NgElementMeta,
  NgNodeMeta,
  NgTemplateMeta,
} from './node-handle/interface';
import { generateParsedNode } from './node-handle/node-handle';
import {
  isNgBoundTextMeta,
  isNgElementMeta,
  isNgTemplateMeta,
} from './node-handle/node-meta/type-predicate';

export class TemplateCompiler {
  private render3ParseResult!: Render3ParseResult;
  private ngNodeMetaList: NgNodeMeta[] = [];
  globalContext = new GlobalContext();
  constructor(
    private url: string,
    private content: string,
    private templateTransform: TemplateTransformBase,
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
    return this.templateTransform.compile(this.ngNodeMetaList);
  }
  private parseNode() {
    const nodes = this.render3ParseResult.nodes;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const parsedNode = generateParsedNode(
        node,
        undefined,
        this.globalContext
      );
      this.ngNodeMetaList.push(parsedNode.getNodeMeta(this.globalContext));
    }
  }

  transform() {
    this.parseHtmlToAst();
    const content = this.buildPlatformTemplate();
    const template = this.templateTransform.getExportTemplate();
    const context = this.ngNodeMetaList
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
    };
  }
}
