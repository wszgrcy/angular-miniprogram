import { ASTWithSource } from '@angular/compiler';
import {
  BoundAttribute,
  Template,
  TextAttribute,
} from '@angular/compiler/src/render3/r3_ast';
import { isElement } from './type-predicate';
import { ParsedNgElement } from './element';
import {
  NgNodeMeta,
  NgNodeKind,
  NgTemplateMeta,
  ParsedNode,
  NgDirective,
  NgIfDirective,
  NgForDirective,
  NgSwitchDirective,
  NgDefaultDirective,
} from './interface';
import { BindValue, PlainValue } from './value';
import { TypeCheckShimGenerator } from '@angular/compiler-cli/src/ngtsc/typecheck';
import { GlobalContext } from './global-context';
import { ExpressionConvert } from '../expression-to-string';

export class NgTemplate implements ParsedNode<NgTemplateMeta> {
  kind = NgNodeKind.Template;
  attrs!: (BoundAttribute | TextAttribute)[];
  bindValueList: string[] = [];
  declareContext: Record<string, string> = {};
  autoGenerateValueList: string[] = [];
  private children: ParsedNode<NgNodeMeta>[] = [];

  constructor(
    private node: Template,
    public parent: ParsedNode<NgNodeMeta> | undefined
  ) {}

  getOriginChildren() {
    return this.node.children;
  }
  setNgNodeChildren(children: any[]) {
    this.children = children;
  }
  private transform(): NgDirective | undefined {
    /**
     * 根据指令判断如何处理
     *
     */
    this.attrs = this.node.templateAttrs;
    let isNgIf = this.attrs.some((item) => item.name === 'ngIf');
    let isNgFor = this.attrs.some(
      (item) => item.name === 'ngFor' || item.name === 'ngForOf'
    );
    let isSwitch = this.attrs.some(
      (item) => item.name === 'ngSwitchCase' || item.name === 'ngSwitchDefault'
    );

    if (isNgIf) {
      return this.ngIfTransform();
    } else if (isNgFor) {
      return this.ngForTramsform();
    } else if (isSwitch) {
      return this.ngSwitchTransform();
    } else if (this.node.tagName === 'ng-template') {
      return this.defaultTransform();
    } else {
      throw '没有找到对应指令.目前仅支持ngIf,ngFor,ngSwitch';
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
  private ngIfTransform(): NgIfDirective {
    let ngIf = this.attrs.find((item) => item.name === 'ngIf')!;
    let ngIfElse = this.attrs.find((item) => item.name === 'ngIfElse')!;
    let ngIfThen = this.attrs.find((item) => item.name === 'ngIfThen')!;
    return {
      type: 'if',
      assert: this.getAttrValue(ngIf),
      thenTemplateRef: ngIf && ngIfThen && this.getAttrValue(ngIfThen, false),
      falseTemplateRef: ngIfElse && this.getAttrValue(ngIfElse, false),
    };
  }
  private ngForTramsform(): NgForDirective {
    let ngFor = this.attrs.find((item) => item.name === 'ngForOf')!;
    let ngForValue = this.getAttrValue(ngFor);
    let ngForItem = this.node.variables.find(
      (item) => item.value === '$implicit'
    )!;
    this.autoGenerateValueList.push(ngForItem.name);
    let ngForIndex = this.node.variables.find((item) => item.value === 'index');
    if (ngForIndex) {
      this.autoGenerateValueList.push(ngForIndex.name);
    }
    return {
      type: 'for',
      for: ngForValue,
      item: ngForItem.name,
      index: ngForIndex ? ngForIndex.name : 'index',
    };
  }
  private ngSwitchTransform(): NgDirective {
    let ngSwitchDefault = this.attrs.find(
      (item) => item.name === 'ngSwitchDefault'
    );
    let ngSwitchCase = this.attrs.find((item) => item.name === 'ngSwitchCase');
    let parent = this.parent;
    let result: { first: boolean; ngSwitch: BoundAttribute } | undefined;
    while (parent) {
      if (isElement(parent)) {
        result = parent.getNgSwitch();
        if (result) {
          break;
        }
      }
      parent = parent.parent;
    }
    let switchValueExpression = new ExpressionConvert();
    let switchValue = switchValueExpression.toString(
      (result!.ngSwitch.value as ASTWithSource).ast
    );
    this.bindValueList.push(...switchValueExpression.propertyReadList);
    return {
      type: 'switch',
      default: !!ngSwitchDefault,
      case: ngSwitchCase && this.getAttrValue(ngSwitchCase),
      switchValue: switchValue,
      first: result!.first,
    };
  }
  private getAttrValue(
    value: BoundAttribute | TextAttribute,
    record: boolean = true
  ) {
    if (typeof value.value === 'string') {
      return new PlainValue(value.value);
    } else {
      let instance = new ExpressionConvert();
      let string = instance.toString((value.value as ASTWithSource).ast);
      let result = new BindValue(string);
      if (record) {
        this.bindValueList.push(...instance.propertyReadList);
      }
      return result;
    }
  }
  getNodeMeta(globalContext: GlobalContext): NgTemplateMeta {
    let directive = this.transform()!;

    let meta: NgTemplateMeta = {
      kind: NgNodeKind.Template,
      children: this.children.map((child) => child.getNodeMeta(globalContext)),
      directive: directive,
      data: this.getBindValueList().map((item) => item.split('.')[0]),
    };
    if (directive.type == 'none') {
      globalContext.addTemplate(meta as NgTemplateMeta<NgDefaultDirective>);
    }
    return meta;
  }
  getBindValueList() {
    let list = [
      ...this.bindValueList,
      ...this.children
        .map((item) => item.getBindValueList())
        .reduce((pre, cur) => {
          pre.push(...cur);
          return pre;
        }, []),
    ];
    let parentList = this.getParentBindValueList();
    return list.filter((item) => !parentList.includes(item));
  }
  getParentBindValueList() {
    if (this.parent) {
      return [
        ...this.parent.bindValueList,
        ...(this.parent.autoGenerateValueList || []),
        ...this.parent.getParentBindValueList(),
      ];
    }
    return [];
  }
}
