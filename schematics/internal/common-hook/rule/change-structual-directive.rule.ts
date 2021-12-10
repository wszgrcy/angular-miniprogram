import { Tree } from '@angular-devkit/schematics';
import { CssSelectorForTs, InsertChange, ReplaceChange } from 'cyia-code-util';
import ts from 'typescript';
import { createTsSelector } from '../../util/create-selector';
import { updateFile } from '../../util/update-file';

const templateName = `__templateName`;
export function changeStructuralDirectiveRuleFactory(options) {
  return (tree: Tree) => {
    const ngForOfPath = `src/library/common/src/directives/ng_for_of.ts`;
    updateFile(
      ngForOfPath,
      changeNgForOf(createTsSelector(ngForOfPath)(tree))
    )(tree);
    const ngIfPath = `src/library/common/src/directives/ng_if.ts`;
    updateFile(ngIfPath, changeNgIf(createTsSelector(ngIfPath)(tree)))(tree);
    const ngSwitchPath = `src/library/common/src/directives/ng_switch.ts`;
    updateFile(
      ngSwitchPath,
      changeNgSwitch(createTsSelector(ngSwitchPath)(tree))
    )(tree);
    const ngTemplateOutletPath = `src/library/common/src/directives/ng_template_outlet.ts`;
    updateFile(
      ngTemplateOutletPath,
      changeNgTemplateOutlet(createTsSelector(ngTemplateOutletPath)(tree))
    )(tree);
  };
}

function getTemplateNameExpressionStr(templateRefName: string) {
  return `(${templateRefName} as any)._declarationTContainer.localNames?(${templateRefName} as any)._declarationTContainer.localNames[0]:undefined`;
}
function changeNgForOf(selector: CssSelectorForTs) {
  const list = [];
  const newExpression = selector.queryOne(
    'NewExpression[expression=NgForOfContext]'
  ) as ts.NewExpression;
  if (newExpression.arguments.length !== 4) {
    throw new Error(
      `new NgForOfContext的参数数量不为4[${newExpression.getText()}]`
    );
  }

  const lastExpression = newExpression.arguments[3];
  if (!ts.isPrefixUnaryExpression(lastExpression)) {
    throw new Error(
      `new NgForOfContext最后一个参数类型错误[${
        ts.SyntaxKind[lastExpression.kind]
      }]`
    );
  }
  list.push(
    new InsertChange(
      lastExpression.end,
      `,${getTemplateNameExpressionStr('this._template')}`
    )
  );
  const ngForOfContextConstructor = selector.queryOne(
    `ClassDeclaration[name=NgForOfContext] Constructor`
  ) as ts.ConstructorDeclaration;

  const lastParameter = ngForOfContextConstructor.parameters[3];
  list.push(
    new InsertChange(lastParameter.end, `,public ${templateName}:string`)
  );
  return list;
}

function changeNgIf(selector: CssSelectorForTs) {
  const list = [];
  const callExpressionList = selector.queryAll(
    `CallExpression[expression="this._viewContainer.createEmbeddedView"]`
  ) as ts.CallExpression[];
  callExpressionList.forEach((callExpression, i) => {
    const node = callExpression.arguments[1] as ts.PropertyAccessExpression;
    list.push(
      new ReplaceChange(
        node.pos,
        node.end - node.pos,
        `{...this._context,${templateName}:${getTemplateNameExpressionStr(
          i ? 'this._thenTemplateRef' : 'this._elseTemplateRef'
        )}}`
      )
    );
  });
  const classDeclaration = selector.queryOne(
    `ClassDeclaration[name=NgIfContext]`
  ) as ts.ClassDeclaration;
  list.push(
    new InsertChange(classDeclaration.end - 1, `public ${templateName}!:string`)
  );
  return list;
}
function changeNgSwitch(selector: CssSelectorForTs) {
  const list = [];
  const callExpression = selector.queryOne(
    `CallExpression[expression="this._viewContainerRef.createEmbeddedView"]`
  ) as ts.CallExpression;
  const node = callExpression.arguments[0] as ts.PropertyAccessExpression;
  list.push(
    new InsertChange(
      node.end,
      `,{${templateName}:${getTemplateNameExpressionStr('this._templateRef')}}`
    )
  );

  return list;
}
function changeNgTemplateOutlet(selector: CssSelectorForTs) {
  const list = [];
  const callExpression = selector.queryOne(
    `CallExpression[expression="viewContainerRef.createEmbeddedView"]`
  ) as ts.CallExpression;
  const node = callExpression.arguments[1] as ts.PropertyAccessExpression;
  list.push(
    new ReplaceChange(
      node.pos,
      node.end - node.pos,
      `{...this.ngTemplateOutletContext,${templateName}:${getTemplateNameExpressionStr(
        'this.ngTemplateOutlet'
      )}}`
    )
  );

  return list;
}
