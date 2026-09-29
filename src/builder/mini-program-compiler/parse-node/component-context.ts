/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  R3ComponentMetadata,
  R3DirectiveDependencyMetadata,
  R3DirectiveMetadata,
  SelectorMatcher,
} from '@angular/compiler';

import type {
  ImportedFile,
  Reference,
} from '@angular/compiler-cli/src/ngtsc/imports';
import ts from 'typescript';
import * as t from '../../angular-internal/ast.type';
import { createCssSelector } from '../../angular-internal/template';
import { getAttrsForDirectiveMatching } from '../../angular-internal/util';
import type { DeclaredWxsModules } from '../../wxs/wxs-call';
import type { DirectiveMetaFromLibrary, MetaFromLibrary } from '../type';
import type { MatchedDirective, MatchedMeta } from './type';

export class ComponentContext {
  /**
   * 当前组件模板声明的 wxs 模块集合。
   *
   * 挂在 context 而不是构造参数上：TemplateDefinition 递归建子模板时
   * 会把 context 原样传下去，声明也就自动穿过 ng-template / 延迟块，
   * 不用改任何构造签名。
   *
   * 默认值必须每次新建，不能拿一个空集常量共用来当默认：
   * `ReadonlySet` 只挡编译期，`Object.freeze(new Set())` 也挡不住
   * `.add()`（数据存在内部槽，不是自有属性）。共享实例一旦被写入，
   * 所有组件都会以为自己有 wxs —— 跳组件污染，极难查。
   * 本类每组件只创建一次，新建集合的成本可忽略。
   */
  declaredWxsModules: DeclaredWxsModules = new Set<string>();

  constructor(private directiveMatcher: SelectorMatcher | undefined) {}
  matchDirective(node: t.Element): MatchedMeta[] {
    if (!this.directiveMatcher) {
      return [];
    }
    const name: string = node.name;
    const selector = createCssSelector(
      name,
      getAttrsForDirectiveMatching(node),
    );
    const result: MatchedMeta[] = [];
    this.directiveMatcher.match(
      selector,
      (
        selector,
        meta: {
          directive: R3DirectiveDependencyMetadata & {
            ref: Reference<ts.ClassDeclaration>;
            importedFile: ImportedFile;
          };
          componentMeta: R3ComponentMetadata<any>;
          directiveMeta: R3DirectiveMetadata;
          libraryMeta: MetaFromLibrary;
        },
      ) => {
        let item: Partial<MatchedMeta>;
        const isComponent: boolean = !!meta.directive.isComponent;
        /**
         * 组件源文件。
         *
         * importedFile 只在「从另一个模块 import 进来的指令」上有值；
         * 同一编译单元内的指令（典型场景：测试工程里 spec 直接
         * 从源码 public-api 引入组件）它是 null，直接取 .fileName 会
         * TypeError: Cannot read properties of null。
         * 拿不到就退回到 AST 上的 SourceFile，两者语义一致。
         */
        const sourceFile: ts.SourceFile | undefined =
          (meta.directive.importedFile as ts.SourceFile | null) ??
          (meta.directive.ref?.node?.getSourceFile() as
            | ts.SourceFile
            | undefined) ??
          undefined;
        if (isComponent) {
          if (!sourceFile) {
            throw new Error(
              `无法确定组件 ${meta.directive.selector} 的源文件：` +
                'importedFile 为空且拿不到 AST SourceFile',
            );
          }
          item = {
            isComponent,
            outputs: meta.directive.outputs,
            filePath: sourceFile.fileName,
            selector: meta.directive.selector,
            className: meta.directive.ref.node.name!.getText(),
            listeners:
              Object.keys(meta.componentMeta?.host?.listeners || {}) || [],
            inputs: meta.directive.inputs,
          };
          if (meta.libraryMeta?.isComponent) {
            item.exportPath = meta.libraryMeta.exportPath;
            item.listeners = meta.libraryMeta.listeners;
            item.properties = meta.libraryMeta.properties;
          }
        } else {
          item = {
            isComponent,
            listeners:
              Object.keys(meta.directiveMeta?.host?.listeners || {}) || [],
            properties:
              Object.keys(meta.directiveMeta?.host?.properties || {}) || [],
            inputs: meta.directive.inputs,
            outputs: meta.directive.outputs,
          };
          if (meta.libraryMeta && !meta.libraryMeta.isComponent) {
            (item as MatchedDirective).listeners = (
              meta.libraryMeta as DirectiveMetaFromLibrary
            ).listeners!;
            (item as MatchedDirective).properties = (
              meta.libraryMeta as DirectiveMetaFromLibrary
            ).properties!;
          }
        }
        result.push(item as MatchedMeta);
      },
    );
    return result;
  }
}
