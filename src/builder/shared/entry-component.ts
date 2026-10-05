import * as ts from 'typescript';
import { isPathIn } from '../util/path';

/**
 * 入口文件里「这个入口绑定哪个组件类」的唯一标记：**default export**。
 *
 * ```ts
 * export { RootPage as default } from './root.component';
 * ```
 *
 * 小程序侧的注册调用（`bootstrapPage` / `componentRegistry` /
 * `bootstrapCustomTabbar`）由构建器生成，用户代码里不出现框架 API。
 * 入口类型来自配置来源（pages / customTabbar / 其余），见 `entry-patterns.ts`。
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
 * 产物路径是不是自定义 tabBar（posix、不含扩展名）。
 *
 * 目录名是平台事实（`BuildPlatform.customTabbar.dir`），调用方传进来。
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
 *
 * `export { default } from './y'` 没有 propertyName，此时 `name` 那个
 * `default` 标识符本身就是指向 y 的 default 的别名，交给 typeChecker 解。
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
 * 无 ts.Program 的轻量版：直接读文件文本判定。
 *
 * 给 vite 的入口生成插件用——它只需要「有没有 default export」这个结论，
 * 不需要 symbol，犯不着为它建 program。
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
