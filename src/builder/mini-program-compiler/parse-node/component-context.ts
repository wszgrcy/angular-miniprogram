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
   * 当前组件模板声明的 wxs 模块集合。挂在 context 而不是构造参数上：递归建子模板时
   * 会把 context 原样传下去，声明也就自动穿过 ng-template / 延迟块。
   *
   * 默认值必须每次新建，不能拿一个空集常量共用：`ReadonlySet` 只挡编译期，
   * `Object.freeze(new Set())` 也挡不住 `.add()`。共享实例一旦被写入，所有组件都会
   * 以为自己有 wxs——跳组件污染，极难查。
   */
  declaredWxsModules: DeclaredWxsModules = new Set<string>();

  /**
   * Angular 解析本模板时用的那份原文。只为 `i18n-*` 属性而存在：i18n pass 会在拿到 AST
   * 之前把 `i18n-alt="照片 {{x}}"` 消费掉，分析侧无法区分「带 i18n 的插值属性」与
   * 「普通插值属性」，而 `ɵɵi18nAttributes` 要占声明槽，猜不到就整体错位。
   * 元素自己的 `sourceSpan` 就是这串文本里的偏移，所以能精确切出开始标签。
   */
  templateText?: string;

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
         * 组件源文件。importedFile 只在「从另一个模块 import 进来的指令」上有值；
         * 同一编译单元内的指令它是 null，直接取 .fileName 会 TypeError。
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
