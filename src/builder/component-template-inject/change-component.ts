import { Change, InsertChange, TsChange } from 'cyia-code-util';
import * as ts from 'typescript';
import { RawUpdater } from '../util';

const DEFINE_COMPONENT = 'ɵɵdefineComponent';

/**
 * 找到所有 `ɵɵdefineComponent({...})` 的元数据对象字面量。
 * 不用 createCssSelectorForTs 的相邻兄弟（`~`）组合符：它在同文件多组件时会错位，
 * 导致后面按名字取 template 时拿到完全不相干的节点，整个组件被静默跳过。
 * webpack 还可能把调用包成 `(0, mod["ɵɵdefineComponent"])(...)`，所以按 callee 文本包含来判断。
 */
function findDefineComponentMetaList(
  sf: ts.SourceFile,
): ts.ObjectLiteralExpression[] {
  const list: ts.ObjectLiteralExpression[] = [];
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sf);
      // 无参调用时 arguments[0] 是 undefined，而 TS 把 Node 索引结果的类型标成非空，
      // isXxx 系列运行时并不兜底，必须先显式判空
      const first: ts.Node | undefined = node.arguments[0];
      if (
        callee.includes(DEFINE_COMPONENT) &&
        first !== undefined &&
        ts.isObjectLiteralExpression(first)
      ) {
        list.push(first);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return list;
}

function pickProperty(
  sf: ts.SourceFile,
  meta: ts.ObjectLiteralExpression,
  name: string,
): ts.PropertyAssignment | undefined {
  for (const prop of meta.properties) {
    if (ts.isPropertyAssignment(prop) && prop.name.getText(sf) === name) {
      return prop;
    }
  }
  return undefined;
}

/**
 * 取组件真正的主模板函数。必须是函数，不能是字符串——选择器版本就是在这里拿到了
 * StringLiteral 还没察觉。
 */
function getTemplateFunction(
  sf: ts.SourceFile,
  meta: ts.ObjectLiteralExpression,
): ts.FunctionLikeDeclaration | undefined {
  const initializer = pickProperty(sf, meta, 'template')?.initializer;
  if (
    initializer !== undefined &&
    (ts.isFunctionExpression(initializer) || ts.isArrowFunction(initializer))
  ) {
    return initializer;
  }
  return undefined;
}

/** `rf & <bit>` 形式的位测试 */
function isRfBitTest(expr: ts.Expression, bit: number): boolean {
  return (
    ts.isBinaryExpression(expr) &&
    expr.operatorToken.kind === ts.SyntaxKind.AmpersandToken &&
    ts.isNumericLiteral(expr.right) &&
    Number(expr.right.text) === bit
  );
}

/**
 * 在模板函数的顶层找 `if (rf & bit) { ... }` 的块。只扫顶层，不递归进嵌套的嵌入式模板函数，
 * 否则会命中别人的 rf & 1 / rf & 2。
 */
function findTopLevelRfBlock(
  fn: ts.FunctionLikeDeclaration,
  bit: number,
): ts.Block | undefined {
  const body = fn.body;
  if (!body || !ts.isBlock(body)) {
    return undefined;
  }
  for (const stmt of body.statements) {
    if (ts.isIfStatement(stmt) && isRfBitTest(stmt.expression, bit)) {
      const then = stmt.thenStatement;
      if (ts.isBlock(then)) {
        return then;
      }
    }
  }
  return undefined;
}

export function changeComponent(data: string) {
  const sf = ts.createSourceFile('', data, ts.ScriptTarget.Latest, true);

  const metaList = findDefineComponentMetaList(sf);
  if (!metaList.length) {
    return undefined;
  }

  const changeList: Change[] = [];
  const componentNames: string[] = [];
  let injectedCount = 0;

  for (const meta of metaList) {
    const componentName =
      pickProperty(sf, meta, 'type')?.initializer.getText() ?? '';
    const templateFn = getTemplateFunction(sf, meta);
    if (!templateFn) {
      continue;
    }
    if (componentName) {
      componentNames.push(componentName);
    }
    // 空模板没有 rf & 1，没有可注入的位置，跳过
    const initBlock = findTopLevelRfBlock(templateFn, 1);
    if (!initBlock) {
      continue;
    }

    const change = new TsChange(sf);
    const updateContent = `amp.propertyChange(ampNgCore.ɵɵgetCurrentView());`;
    const updateBlock = findTopLevelRfBlock(templateFn, 2);
    const updateStatements = updateBlock?.statements ?? [];

    let updateInsertChange: InsertChange;
    if (updateStatements.length) {
      // 分支 A：已有 `if (rf & 2)` 更新块，追加到最后一条语句之后
      updateInsertChange = change.insertNode(
        updateStatements[updateStatements.length - 1],
        `;${updateContent}`,
        'end',
      );
    } else {
      // 分支 B：没有更新块（或更新块是空的——取 statements[length - 1] 会得到 undefined，
      // 在 insertNode 里读 getStart 直接崩），在 init 块后面补一个完整的
      updateInsertChange = change.insertNode(
        initBlock,
        `if(rf & 2){${updateContent}}`,
        'end',
      );
    }
    changeList.push(updateInsertChange);
    injectedCount++;
  }

  if (!injectedCount) {
    // 没有注入点也要按原契约返回 { content, componentName }：调用方靠返回值是否为 undefined
    // 决定要不要产出组件元数据，这里提前 return undefined 会让空模板组件整个不产出。
    // 只有「本文件根本没有组件」才返回 undefined。
    changeList.length = 0;
  } else {
    // import 只需要一份。放在循环里 push 会给每个组件都加一遍
    changeList.unshift(
      new InsertChange(0, `import * as ampNgCore from '@angular/core';\n`),
    );
    changeList.unshift(
      new InsertChange(0, `import * as amp from 'angular-miniprogram';\n`),
    );
  }

  return {
    content: RawUpdater.update(data, changeList),
    /** 本文件所有组件的类名，顺序与源文件中 ɵɵdefineComponent 出现顺序一致 */
    componentNames,
    /** @deprecated 用 componentNames。等于 componentNames[0]。 */
    componentName: componentNames[0] ?? '',
  };
}

/**
 * 只检测本文件里的组件类名，不改代码。库产物保持 vanilla，注入在主构建做。
 */
export function detectComponentNames(data: string): string[] {
  const sf = ts.createSourceFile('', data, ts.ScriptTarget.Latest, true);
  const names: string[] = [];
  for (const meta of findDefineComponentMetaList(sf)) {
    const name = pickProperty(sf, meta, 'type')?.initializer.getText() ?? '';
    if (name) {
      names.push(name);
    }
  }
  return names;
}
