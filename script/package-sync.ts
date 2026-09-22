import {
  type NodeQueryOption,
  type ScriptFunction,
  type FileQueryLayer,
  completePromise,
  fileBufferToString,
  stringToFileBuffer,
} from '@code-recycle/cli';
const templateName = `__templateName`;

function getTemplateNameExpressionStr(templateRefName: string) {
  return `(${templateRefName} as any)._declarationTContainer.localNames?(${templateRefName} as any)._declarationTContainer.localNames[0]:null`;
}
let fn: ScriptFunction = async (util, rule, host, injector) => {
  let path = util.path;

  let data = await rule.os.gitClone(
    'https://github.com/angular/angular.git',
    [
      '/packages/common',
      '/packages/forms',
      '!/packages/common/test',
      '!/packages/forms/test',
      '!**/*.bazel',
      '!**/*spec.ts',
      '!**/*.js',
      '!**/*.md',
    ],
    'packages',
    'branch',
    '19.2.17'
  );
  let exclude = [
    'forms/src/directives/default_value_accessor.ts',
    'forms/src/directives/checkbox_value_accessor.ts',
    // 'forms/src/directives/number_value_accessor.ts',
    'forms/src/directives/radio_control_value_accessor.ts',
    // 'forms/src/directives/range_value_accessor.ts',
    // 'forms/src/directives/select_control_value_accessor.ts',
    // 'forms/src/directives/select_multiple_control_value_accessor.ts',
    'forms/src/directives.ts',
    'forms/src/forms.ts',
  ];

  /**
   * Angular 19 起 `packages/common/http` 内部改用相对路径（如 `../../index`）
   * 引用 `@angular/common`（18 及以前是直接写 `@angular/common`）。
   * 直接保留相对路径会让 ng-packagr 跨 entry point 取源码，报
   * TS6059（不在 rootDir 下），因此统一改写为库的公开入口。
   */
  function rewriteCrossEntryPointImports(filePath: string, content: string) {
    return content.replace(
      /(from\s+')((?:\.\.\/)+index)(')/g,
      (match, prefix: string, spec: string, suffix: string) => {
        const resolved = path
          .normalize(path.join(path.dirname(filePath), spec))
          .split('\\')
          .join('/');
        if (/^common(\/[^/]+)*\/index$/.test(resolved)) {
          const entryDir = resolved.replace(/\/index$/, '');
          return `${prefix}angular-miniprogram/${entryDir}${suffix}`;
        }
        return match;
      }
    );
  }

  for (const key in data) {
    if (exclude.includes(key)) {
      continue;
    }
    let buffer = data[key];
    if (key.startsWith('common')) {
      let content = fileBufferToString(buffer).replace(
        /@angular\/common/g,
        `angular-miniprogram/common`
      );
      content = rewriteCrossEntryPointImports(key, content);
      buffer = stringToFileBuffer(content);
    }
    await completePromise(host.write(path.normalize(key), buffer));
  }
  let list = await util.changeList([
    {
      path: './common/src/directives/ng_for_of.ts',
      list: [
        {
          query: `Constructor>CloseParenToken`,
          insertBefore: true,
          replace: `public ${templateName}:string`,
        },
        {
          query: `NewExpression:like(new NgForOfContext)>CloseParenToken`,
          insertBefore: true,
          replace: `,${getTemplateNameExpressionStr('this._template')}`,
        },
      ],
    },
    {
      path: './common/src/directives/ng_if.ts',
      list: [
        {
          query: `IfStatement:has(>PrefixUnaryExpression:like(this._thenViewRef) ) CallExpression:like(this._viewContainer.createEmbeddedView)>OpenParenToken+*::children(2)`,
          replace: `{...{{''|ctxValue}},${templateName}:${getTemplateNameExpressionStr(
            'this._thenTemplateRef'
          )}}`,
        },
        {
          query: `IfStatement:has(>PrefixUnaryExpression:like(this._elseViewRef) ) CallExpression:like(this._viewContainer.createEmbeddedView)>OpenParenToken+*::children(2)`,
          replace: `{...{{''|ctxValue}},${templateName}:${getTemplateNameExpressionStr(
            'this._elseTemplateRef'
          )}}`,
        },
        {
          query: `ClassDeclaration:has(>Identifier[value=NgIfContext])>CloseBraceToken`,
          insertBefore: true,
          replace: `public ${templateName}!:string`,
        },
      ],
    },
    {
      path: `./common/src/directives/ng_switch.ts`,
      list: [
        {
          query: `CallExpression:like(this._viewContainerRef.createEmbeddedView)>CloseParenToken`,
          insertBefore: true,
          replace: `,{${templateName}:${getTemplateNameExpressionStr(
            'this._templateRef'
          )}}`,
        },
      ],
    },
    {
      path: `./common/src/directives/ng_template_outlet.ts`,
      list: [
        {
          query: `CallExpression:like(viewContainerRef.createEmbeddedView)>OpenParenToken+*::children(2)`,
          replace: `{...{{''|ctxValue}},${templateName}:${getTemplateNameExpressionStr(
            'this.ngTemplateOutlet'
          )}}as any`,
        },
      ],
    },
    {
      path: `./common/src/common.ts`,
      list: [
        {
          query: `ExportDeclaration:has(StringLiteral[value*=i18n])`,
          delete: true,
          multi: true,
        },
        {
          query: `ExportSpecifier[value^=I18n]:use(*,*+*)`,
          delete: true,
          multi: true,
        },
        {
          query: `ExportSpecifier[value=NgComponentOutlet]:use(*,*+*)`,
          delete: true,
          multi: true,
        },
      ],
    },
    {
      path: `./common/src/pipes/index.ts`,
      list: [
        {
          query: `ImportDeclaration:has(Identifier[value^=I18n])`,
          multi: true,
          delete: true,
        },
        {
          query: `ExportSpecifier[value^=I18n]:use(*,*+*)`,
          delete: true,
          multi: true,
        },
        {
          query: `ArrayLiteralExpression Identifier[value^=I18n]:use(*,*+*)`,
          delete: true,
          multi: true,
        },
      ],
    },
    {
      path: `./common/src/directives/index.ts`,
      list: [
        {
          query: `ImportDeclaration:has(Identifier[value=NgComponentOutlet])`,
          multi: true,
          delete: true,
        },
        {
          query: `ExportSpecifier[value=NgComponentOutlet]:use(*,*+*)`,
          delete: true,
          multi: true,
        },
        {
          query: `ArrayLiteralExpression Identifier[value=NgComponentOutlet]:use(*,*+*)`,
          delete: true,
          multi: true,
        },
      ],
    },
  ]);
  await util.updateChangeList(list);
};
export default fn;
