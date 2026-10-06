import ts from 'typescript';

/**
 * wxs 源解析。
 *
 * 渲染层代码（wxs）与逻辑层是单向的：
 *   逻辑层 → 渲染层：通过 nodeList 物化数据（编译期改写绑定表达式）
 *   渲染层 → 逻辑层：只有 `ownerInstance.callMethod(name, args)`，异步
 *
 * 所以编译期必须从 wxs 源里提前知道两件事：
 *   1. 对外暴露了哪些成员（模板里 `wxs.mod.fn` 能否解析）
 *   2. 会回调哪些逻辑层方法（用于注册 MP methods 转发）
 * 两者都是静态可判定的，不依赖运行时发现。
 */
export interface WxsModuleMeta {
  /** 模块名，模板里 `wxs.<name>.<fn>` 的中间段 */
  name: string;
  /** 源文件绝对路径 */
  sourcePath: string;
  /** `module.exports` / `exports.x` 暴露的成员名 */
  exports: string[];
  /** 源码里 `callMethod('x')` 提到的逻辑层方法名 */
  callMethods: string[];
}

const CALL_METHOD = 'callMethod';

/**
 * wxs 不支持的语法。
 *
 * 微信 wxs 是一门被裁剪过的 ES5 方言，这些要么直接语法错误，
 * 要么运行时静默失效。编译期拦下来比让用户在真机上抓狂便宜得多。
 */
function hasAsyncModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }
  return (ts.getModifiers(node) ?? []).some(
    (m) => m.kind === ts.SyntaxKind.AsyncKeyword,
  );
}

const FORBIDDEN: Array<{ test: (n: ts.Node) => boolean; why: string }> = [
  {
    test: ((n) =>
      (ts.isFunctionDeclaration(n) ||
        ts.isFunctionExpression(n) ||
        ts.isArrowFunction(n) ||
        ts.isMethodDeclaration(n)) &&
      hasAsyncModifier(n)) as (n: ts.Node) => boolean,
    why: 'async 函数',
  },
  {
    test: (n) => ts.isAwaitExpression(n),
    why: 'await',
  },
  {
    test: (n) => ts.isClassDeclaration(n) || ts.isClassExpression(n),
    why: 'class',
  },
  {
    test: (n) => ts.isTryStatement(n),
    why: 'try/catch',
  },
  {
    test: (n) => ts.isImportDeclaration(n),
    why: 'import（wxs 无模块系统，请用 module.exports）',
  },
  {
    test: (n) => ts.isTemplateExpression(n),
    why: '模板字符串插值',
  },
];

/** 解析 wxs 源码，产出模块元数据。语法不合法时抛错。 */
export function parseWxsSource(
  code: string,
  moduleName: string,
  sourcePath: string,
): WxsModuleMeta {
  const sf = ts.createSourceFile(
    sourcePath,
    code,
    ts.ScriptTarget.ES5,
    /* setParentNodes */ true,
    ts.ScriptKind.TS,
  );

  const exports = new Set<string>();
  const callMethods = new Set<string>();
  const problems: string[] = [];

  const walk = (node: ts.Node): void => {
    for (const rule of FORBIDDEN) {
      if (rule.test(node)) {
        problems.push(rule.why);
      }
    }
    collectExports(node, exports);
    collectCallMethods(node, callMethods);
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (problems.length) {
    throw new Error(
      `wxs 模块 "${moduleName}" 含不支持的语法: ${[...new Set(problems)].join(
        ', ',
      )}`,
    );
  }

  return {
    name: moduleName,
    sourcePath,
    exports: [...exports],
    callMethods: [...callMethods],
  };
}

/**
 * 收集 `module.exports = { a, b }` 与 `exports.c = ...`。
 *
 * 只认**字面量属性名**：`module.exports = { [k]: v }` 这种计算键
 * 静态无从得知，直接忽略（模板侧解析不到会给出明确报错）。
 */
function collectExports(node: ts.Node, out: Set<string>): void {
  if (!ts.isExpressionStatement(node)) {
    return;
  }
  const expr = node.expression;
  if (!ts.isBinaryExpression(expr)) {
    return;
  }
  if (expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
    return;
  }
  const left = expr.left.getText();

  if (left === 'module.exports' || left === 'exports') {
    if (ts.isObjectLiteralExpression(expr.right)) {
      for (const prop of expr.right.properties) {
        if (ts.isPropertyAssignment(prop) && prop.name) {
          const name = staticPropertyName(prop.name);
          if (name) {
            out.add(name);
          }
        } else if (ts.isShorthandPropertyAssignment(prop)) {
          out.add(prop.name.text);
        }
      }
    }
    return;
  }

  const memberMatch = /^exports\.([A-Za-z_$][\w$]*)$/.exec(left);
  if (memberMatch) {
    out.add(memberMatch[1]);
  }
}

function staticPropertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }
  return undefined;
}

/**
 * 收集 `<anything>.callMethod('name', ...)`。
 *
 * 只认字符串字面量首参 —— 动态方法名静态无从得知。
 * 与 uni-app `parseWxsCallMethods` 同构，保持行为一致。
 */
function collectCallMethods(node: ts.Node, out: Set<string>): void {
  if (!ts.isCallExpression(node)) {
    return;
  }
  const callee = node.expression;
  if (!ts.isPropertyAccessExpression(callee)) {
    return;
  }
  if (callee.name.text !== CALL_METHOD) {
    return;
  }
  const first = node.arguments[0];
  if (!first) {
    return;
  }
  if (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) {
    out.add(first.text);
  }
}
