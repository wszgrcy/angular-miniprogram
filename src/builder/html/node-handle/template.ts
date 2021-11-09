import { ASTWithSource } from '@angular/compiler';
import {
  BoundAttribute,
  Template,
  TextAttribute,
} from '@angular/compiler/src/render3/r3_ast';
import { TemplateInterpolationService } from '../template-interpolation.service';
import { TemplateGlobalContext } from './global-context';
import {
  NgDefaultDirective,
  NgDirective,
  NgNodeKind,
  NgNodeMeta,
  NgTemplateMeta,
  ParsedNode,
} from './interface';
import { isElement } from './type-predicate';
import { BindValue, PlainValue } from './value';

export class ParsedNgTemplate implements ParsedNode<NgTemplateMeta> {
  kind = NgNodeKind.Template;
  attrs!: (BoundAttribute | TextAttribute)[];

  declareContext: Record<string, string> = {};
  globalContext!: TemplateGlobalContext;
  private children: ParsedNode<NgNodeMeta>[] = [];

  constructor(
    private node: Template,
    public parent: ParsedNode<NgNodeMeta> | undefined,
    public templateInterpolationService: TemplateInterpolationService
  ) {}

  getOriginChildren() {
    return this.node.children;
  }
  setNgNodeChildren(children: ParsedNode<NgNodeMeta>[]) {
    this.children = children;
  }
  appendNgNodeChild(child: ParsedNode<NgNodeMeta>) {
    this.children.push(child);
  }
  private transform(): NgDirective[] {
    /**
     * 根据指令判断如何处理
     *
     */
    this.attrs = this.node.templateAttrs;
    const isNgIf = this.attrs.some((item) => item.name === 'ngIf');
    const isNgFor = this.attrs.some(
      (item) => item.name === 'ngFor' || item.name === 'ngForOf'
    );
    const isSwitch = this.attrs.some(
      (item) => item.name === 'ngSwitchCase' || item.name === 'ngSwitchDefault'
    );

    if (isNgIf) {
      return this.ngIfTransform();
    } else if (isNgFor) {
      return this.ngForTransform();
    } else if (isSwitch) {
      return this.ngSwitchTransform();
    } else if (this.node.tagName === 'ng-template') {
      return [this.defaultTransform()];
    } else {
      throw new Error('没有找到对应指令.目前仅支持ngIf,ngFor,ngSwitch');
    }
  }
  private defaultTransform(): NgDefaultDirective {
    return {
      type: 'none',
      name: this.node.references.map((item) => ({
        name: item.name,
        value: item.value,
      })),
    };
  }
  private ngIfTransform(): NgDirective[] {
    const ngIf = this.attrs.find((item) => item.name === 'ngIf')!;
    const ngIfElse = this.attrs.find((item) => item.name === 'ngIfElse')!;
    const ngIfThen = this.attrs.find((item) => item.name === 'ngIfThen')!;
    const ngIfTemplateName = `ngIf_then_${this.globalContext.getBindIndex()}`;

    return [
      {
        type: 'if',
        assert: this.getAttrValue(ngIf),
        thenTemplateRef:
          (ngIf && ngIfThen && this.getAttrValue(ngIfThen, false)) ||
          new BindValue(() => ngIfTemplateName),
        falseTemplateRef: ngIfElse && this.getAttrValue(ngIfElse, false),
      },
      {
        type: 'none',
        name: [{ name: ngIfTemplateName, value: ngIfTemplateName }],
      },
    ];
  }
  private ngForTransform(): NgDirective[] {
    const ngFor = this.attrs.find((item) => item.name === 'ngForOf')!;
    const ngForValue = this.getAttrValue(ngFor);
    const ngForItem = this.node.variables.find(
      (item) => item.value === '$implicit'
    )!;
    const ngForIndex = this.node.variables.find(
      (item) => item.value === 'index'
    );

    const ngForTemplateName = `ngFor_item_${this.globalContext.getBindIndex()}`;

    return [
      {
        type: 'for',
        for: ngForValue,
        item: ngForItem.name,
        index: ngForIndex ? ngForIndex.name : 'index',
        templateName: ngForTemplateName,
      },
      {
        type: 'none',
        name: [{ name: ngForTemplateName, value: ngForTemplateName }],
      },
    ];
  }
  private ngSwitchTransform(): NgDirective[] {
    const ngSwitchDefault = this.attrs.find(
      (item) => item.name === 'ngSwitchDefault'
    );
    const ngSwitchCase = this.attrs.find(
      (item) => item.name === 'ngSwitchCase'
    );
    let parent = this.parent;
    let result:
      | { first: boolean; ngSwitch: BoundAttribute; index: number }
      | undefined;
    while (parent) {
      if (isElement(parent)) {
        result = parent.getNgSwitch();
        if (result) {
          break;
        }
      }
      parent = parent.parent;
    }
    const switchValue =
      this.templateInterpolationService.expressionConvertToString(
        (result!.ngSwitch.value as ASTWithSource).ast
      );
    const ngSwitchTemplateName = `ngSwitch_${
      result?.index
    }_${this.globalContext.getBindIndex()}`;
    return [
      {
        type: 'switch',
        default: !!ngSwitchDefault,
        case: ngSwitchCase && this.getAttrValue(ngSwitchCase),
        switchValue: switchValue,
        first: result!.first,
        templateName: ngSwitchTemplateName,
        index: result!.index,
      },
      {
        type: 'none',
        name: [{ name: ngSwitchTemplateName, value: ngSwitchTemplateName }],
      },
    ];
  }
  private getAttrValue(
    value: BoundAttribute | TextAttribute,
    record: boolean = true
  ) {
    if (typeof value.value === 'string') {
      return new PlainValue(value.value);
    } else {
      // const instance = new ExpressionConvert();
      const result =
        this.templateInterpolationService.expressionConvertToString(
          (value.value as ASTWithSource).ast
        );
      // const result =result
      if (record) {
        // this.bindValueList.push(...instance.propertyReadList);
      }
      return result;
    }
  }
  getNodeMeta(globalContext: TemplateGlobalContext): NgTemplateMeta {
    this.globalContext = globalContext;
    const staticType = globalContext.matchDirective(this.node);

    const directive = this.transform()!;

    const meta: NgTemplateMeta = {
      kind: NgNodeKind.Template,
      children: this.children.map((child) => child.getNodeMeta(globalContext)),
      directive: directive,
      staticType: staticType,
    };
    for (let i = 0; i < directive.length; i++) {
      const element = directive[i];
      if (element.type == 'none') {
        globalContext.addTemplate(meta as NgTemplateMeta<NgDefaultDirective>);
        break;
      }
    }

    return meta;
  }
}
