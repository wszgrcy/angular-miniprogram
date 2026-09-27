import * as ts from 'typescript';

/**
 * 用 AST 校验 changeComponent 对组件 template 函数的注入结果。
 *
 * 之所以走 AST 而不是字符串/正则匹配：webpack 在不同 chunk 里对同一份注入代码的
 * 排版不一样（entry chunk 是 `}if(rf & 2){`，vendor chunk 会排成 `} if (rf & 2) {`，
 * 双分号 `;;` 会变成 `; ;`），字面量正则会漏掉一半，放宽空白又容易误判。
 * AST 不受排版影响。
 */

const DEFINE_COMPONENT = 'ɵɵdefineComponent';
const PROPERTY_CHANGE = 'propertyChange';

export type InjectBranch = 'A' | 'B' | null;

export interface TemplateInjectReport {
  /** 组件名（ɵɵdefineComponent 的 type） */
  componentName: string;
  /** 模板函数体顶层是否有 if (rf & 1) */
  hasInitBlock: boolean;
  /** 顶层 if (rf & 2) 块里的语句数（无更新块为 0） */
  updateStatementCount: number;
  /** rf & 2 块里 propertyChange 调用数 */
  propertyChangeCount: number;
  /** propertyChange 是否是 rf & 2 块的最后一条语句 */
  isLastStatement: boolean;
  /**
   * A = 注入到已有更新块尾部；B = 补了完整的新更新块；null = 未注入
   */
  branch: InjectBranch;
}

export interface FileInjectReport {
  components: TemplateInjectReport[];
  /** 出现在 rf & 2 之外的 propertyChange 调用数 */
  strayCalls: number;
}

function isRfBitTest(expr: ts.Expression, bit: number): boolean {
  return (
    ts.isBinaryExpression(expr) &&
    expr.operatorToken.kind === ts.SyntaxKind.AmpersandToken &&
    ts.isNumericLiteral(expr.right) &&
    Number(expr.right.text) === bit
  );
}

/** 只扫函数体顶层，不递归进嵌套的嵌入式模板函数 */
/**
 * 取 `if (rf & <bit>) ...` 的 then 部分。
 *
 * 两种排版都要认：
 *   - webpack / 手写：`if (rf & 2) { a(); b(); }`  → Block
 *   - Vite/esbuild 压缩后：`if (rf & 2) m.propertyChange(m.ɵɵgetCurrentView());`
 *     → **无花括号的单语句**，then 是 ExpressionStatement 而非 Block
 *
 * 只认 Block 会让 vite 产物整体检测不到注入（branch=null → 误报 missed），
 * 而注入其实是发生了的。
 */
function findTopLevelRfBlock(
  fn: ts.FunctionLikeDeclaration,
  bit: number
): ts.Statement | undefined {
  const body = fn.body;
  if (!body || !ts.isBlock(body)) {
    return undefined;
  }
  for (const stmt of body.statements) {
    if (ts.isIfStatement(stmt) && isRfBitTest(stmt.expression, bit)) {
      return stmt.thenStatement;
    }
  }
  return undefined;
}

/** Block 取其 statements，单语句视为长度为 1 的数组 */
function statementsOf(node: ts.Statement | undefined): ts.Statement[] {
  if (!node) {
    return [];
  }
  return ts.isBlock(node) ? Array.from(node.statements) : [node];
}

function pickProperty(
  sf: ts.SourceFile,
  meta: ts.ObjectLiteralExpression,
  name: string
): ts.PropertyAssignment | undefined {
  for (const prop of meta.properties) {
    if (ts.isPropertyAssignment(prop) && prop.name.getText(sf) === name) {
      return prop;
    }
  }
  return undefined;
}

/** 收集 `X.propertyChange(...)` / `propertyChange(...)` 形式的调用 */
function collectPropertyChangeCalls(
  node: ts.Node,
  sf: ts.SourceFile
): ts.CallExpression[] {
  const out: ts.CallExpression[] = [];
  const walk = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const callee = n.expression;
      const name = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : ts.isIdentifier(callee)
          ? callee.text
          : undefined;
      // 排除库自身的 `function propertyChange(lView) {...}` 定义
      if (name === PROPERTY_CHANGE) {
        out.push(n);
      }
    }
    ts.forEachChild(n, walk);
  };
  walk(node);
  void sf;
  return out;
}

/** 判断某个节点是否被包裹在某个 `rf & 2` 的 then 块里 */
function isInsideRf2Block(node: ts.Node): boolean {
  let cur: ts.Node | undefined = node.parent;
  while (cur) {
    if (ts.isIfStatement(cur) && isRfBitTest(cur.expression, 2)) {
      return true;
    }
    cur = cur.parent;
  }
  return false;
}

export function analyzeFileInjection(
  fileName: string,
  content: string
): FileInjectReport {
  const sf = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  );

  const components: TemplateInjectReport[] = [];

  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sf);
      // 无参调用时 arguments[0] 是 undefined，而 TS 把 Node 索引结果的类型
      // 标成非空，isXxx 系列运行时并不兜底，必须先显式判空
      const first: ts.Node | undefined = node.arguments[0];
      if (
        callee.includes(DEFINE_COMPONENT) &&
        first !== undefined &&
        ts.isObjectLiteralExpression(first)
      ) {
        const report = analyzeDefineComponent(sf, first);
        if (report) {
          components.push(report);
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  // 全文件范围的 stray 检查：所有 propertyChange 调用（排除函数定义本身）
  const allCalls = collectPropertyChangeCalls(sf, sf).filter((call) => {
    // 排除 `function propertyChange(...) {}` 这种定义（其 expression 是 Identifier
    // 且父节点是 FunctionDeclaration 的名字，不会走到 call 分支），这里只排掉
    // 库内部对 propertyChange 的再导出/包装调用不现实，改为只统计带实参的调用
    return call.arguments.length > 0;
  });
  const strayCalls = allCalls.filter((call) => !isInsideRf2Block(call)).length;

  return { components, strayCalls };
}

function analyzeDefineComponent(
  sf: ts.SourceFile,
  meta: ts.ObjectLiteralExpression
): TemplateInjectReport | null {
  const typeProp = pickProperty(sf, meta, 'type');
  const templateInit = pickProperty(sf, meta, 'template')?.initializer;
  if (
    !typeProp ||
    !(ts.isFunctionExpression(templateInit) || ts.isArrowFunction(templateInit))
  ) {
    return null;
  }
  const fn: ts.FunctionLikeDeclaration = templateInit;
  const initBlock = findTopLevelRfBlock(fn, 1);
  const updateBlock = findTopLevelRfBlock(fn, 2);
  const updateStatements = statementsOf(updateBlock);
  const calls = updateBlock
    ? collectPropertyChangeCalls(updateBlock, sf).filter(
        (c) => c.arguments.length > 0
      )
    : [];

  let branch: InjectBranch = null;
  if (calls.length === 1) {
    const last = updateStatements[updateStatements.length - 1];
    const callIsLast = last !== undefined && containsCall(last, calls[0]);
    if (callIsLast) {
      branch = updateStatements.length === 1 ? 'B' : 'A';
    }
  }

  return {
    componentName: typeProp.initializer.getText(sf),
    hasInitBlock: !!initBlock,
    updateStatementCount: updateStatements.length,
    propertyChangeCount: calls.length,
    isLastStatement:
      calls.length === 1 &&
      updateStatements.length > 0 &&
      containsCall(updateStatements[updateStatements.length - 1], calls[0]),
    branch,
  };
}

function containsCall(container: ts.Node, call: ts.CallExpression): boolean {
  let found = false;
  const walk = (n: ts.Node): void => {
    if (n === call) {
      found = true;
      return;
    }
    if (found) {
      return;
    }
    ts.forEachChild(n, walk);
  };
  walk(container);
  return found;
}
