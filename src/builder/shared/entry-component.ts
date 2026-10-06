import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { isPathIn } from '../util/path';

/**
 * 入口文件里「这个入口绑定哪个组件类」的唯一标记：default export。
 *
 * ```ts
 * export { RootPage as default } from './root.component';
 * ```
 *
 * 小程序侧的注册调用由构建器生成，用户代码里不出现框架 API。
 */
export const MP_ENTRY_TYPES = ['page', 'component', 'tabbar'] as const;
export type MpEntryType = (typeof MP_ENTRY_TYPES)[number];

export type MpBootstrapFunction =
  | 'bootstrapPage'
  | 'componentRegistry'
  | 'bootstrapCustomTabbar';

/** 每种入口类型对应的运行时注册函数 */
export const MP_ENTRY_BOOTSTRAP: Record<MpEntryType, MpBootstrapFunction> = {
  page: 'bootstrapPage',
  component: 'componentRegistry',
  tabbar: 'bootstrapCustomTabbar',
};

/**
 * 产物路径是不是自定义 tabBar（posix、不含扩展名）。目录名是平台事实，由调用方传进来；
 * 不传即当前平台没有自定义 tabBar，一律判否。
 */
export function isCustomTabbarOutput(
  outputPath: string,
  tabbarDir: string | undefined,
): boolean {
  if (!tabbarDir) {
    return false;
  }
  return isPathIn(tabbarDir, outputPath);
}

/**
 * 取 `export default X` / `export { X as default } from './y'` 里的 X。
 * `export { default } from './y'` 没有 propertyName，此时 `default` 标识符本身就是别名。
 */
function findDefaultExport(
  sourceFile: ts.SourceFile,
): ts.Expression | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      return statement.expression;
    }
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      const element = statement.exportClause.elements.find(
        (item) => item.name.text === 'default',
      );
      if (element) {
        return element.propertyName ?? element.name;
      }
    }
  }
  return undefined;
}

/** 解析入口源文件，找出它绑定的组件类表达式 */
export function detectEntryComponent(
  sourceFile: ts.SourceFile,
): ts.Expression | undefined {
  return findDefaultExport(sourceFile);
}

/**
 * 无 ts.Program 的轻量版：直接读文件文本判定。只需要「有没有 default export」这个结论，
 * 犯不着建 program。
 */
export function detectEntryComponentFromSource(
  code: string,
  fileName = 'entry.ts',
): ts.Expression | undefined {
  return detectEntryComponent(
    ts.createSourceFile(
      fileName,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    ),
  );
}

/**
 * 从 default 导出表达式往上找到携带 moduleSpecifier 的那层声明。
 * 表达式到声明之间的层数不固定，所以逐层往上找。
 */
function findModuleBearingDeclaration(
  expression: ts.Expression,
): ts.ImportDeclaration | ts.ExportDeclaration | undefined {
  let current: ts.Node | undefined = expression;
  for (let i = 0; i < 5 && current; i++) {
    if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

/** 相对模块说明符解析成源文件绝对路径（构建器只认 `./x` 形式） */
function resolveRelativeModule(fromFile: string, specifier: string): string {
  return path.resolve(path.dirname(fromFile), specifier) + '.ts';
}

/**
 * 解析入口的 default 导出实际指向哪个文件的哪个类。纯语法解析，不建 program。
 * `className` 为 undefined 表示「知道文件、不知道类」，调用方按整个文件被认领处理。
 * 解析不出来返回 undefined。
 */
export function resolveEntryComponentBinding(
  entrySrc: string,
  sourceFile: ts.SourceFile,
): { file: string; className?: string } | undefined {
  const expression = detectEntryComponent(sourceFile);
  if (!expression) {
    return undefined;
  }

  const bearing = findModuleBearingDeclaration(expression);
  if (bearing?.moduleSpecifier && ts.isStringLiteral(bearing.moduleSpecifier)) {
    const specifier = bearing.moduleSpecifier.text;
    if (!specifier.startsWith('.')) {
      return undefined;
    }
    // `export { X as default } from './y'`：propertyName 才是 y 里的原名；
    // `export { default } from './y'` 没有 propertyName，类名未知
    let className: string | undefined;
    if (ts.isExportSpecifier(expression)) {
      const original = expression.propertyName?.text ?? expression.name.text;
      className = original === 'default' ? undefined : original;
    } else if (ts.isImportSpecifier(expression)) {
      className = expression.propertyName?.text ?? expression.name.text;
    }
    return { file: resolveRelativeModule(entrySrc, specifier), className };
  }

  // `export default InlineComponent`：组件就声明在本文件里
  if (ts.isIdentifier(expression)) {
    const name = expression.text;
    const declared = sourceFile.statements.find(
      (statement): statement is ts.ClassDeclaration =>
        ts.isClassDeclaration(statement) && statement.name?.text === name,
    );
    if (declared) {
      return { file: entrySrc, className: name };
    }
    // `import { X } from './y'; export default X;`
    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) {
        continue;
      }
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) {
        continue;
      }
      for (const element of bindings.elements) {
        if (element.name.text !== name) {
          continue;
        }
        if (!ts.isStringLiteral(statement.moduleSpecifier)) {
          return undefined;
        }
        const specifier = statement.moduleSpecifier.text;
        return specifier.startsWith('.')
          ? {
              file: resolveRelativeModule(entrySrc, specifier),
              className: element.propertyName?.text ?? name,
            }
          : undefined;
      }
    }
  }
  return undefined;
}

/** 读盘解析入口 default 绑定；读不到或解析不出就返回 undefined */
export function resolveEntryComponentBindingFromFile(
  file: string,
): { file: string; className?: string } | undefined {
  try {
    return resolveEntryComponentBinding(
      file,
      ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      ),
    );
  } catch {
    return undefined;
  }
}

/** 类上有没有 `@Component`（含 `@Component({...})` 调用形式） */
function isComponentClass(node: ts.ClassDeclaration): boolean {
  return (ts.getDecorators(node) ?? []).some((decorator) => {
    const target = ts.isCallExpression(decorator.expression)
      ? decorator.expression.expression
      : decorator.expression;
    return ts.isIdentifier(target) && target.text === 'Component';
  });
}

/**
 * 列出一个文件里所有 `@Component` 类的类名。纯语法，不做类型检查：
 * 组件发现发生在 vite 配置之前，那会儿还没有 Angular program，只能靠 AST。
 */
export function findComponentClassNames(sourceFile: ts.SourceFile): string[] {
  return sourceFile.statements
    .filter((statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement),
    )
    .filter(isComponentClass)
    .map((node) => node.name?.text)
    .filter((name): name is string => !!name);
}

/** 读盘并列出 `@Component` 类名；读不到或没有就返回空数组 */
export function findComponentClassNamesFromFile(file: string): string[] {
  try {
    return findComponentClassNames(
      ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      ),
    );
  } catch {
    return [];
  }
}
