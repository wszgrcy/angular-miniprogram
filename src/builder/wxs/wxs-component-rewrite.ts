import * as path from 'path';
import ts from 'typescript';

/**
 * 生成「给 Angular 编译的那份组件文件」。
 *
 * 替换是**文件级**的（fileReplacements 只能整档换），所以一个 .ts 里
 * 只要有任何一个组件带 wxs 模板，整个文件都要重新生成。重新生成会挪
 * 位置，于是三类引用必须一起处理：
 *
 *   templateUrl（带 wxs 的那个） → template: "<剥离后的文本>"
 *   templateUrl（同文件其它组件） → 原样留着，把 html 复制过来
 *   styleUrl / styleUrls          → 原样留着，把样式复制过来
 *   import { A } from './a'       → 绝对路径
 *
 * 资源为什么走复制而不是绝对化：ngtsc 把资源串当 URL 看，
 * `^[a-zA-Z][a-zA-Z\d+\-.]*?:` 会把 Windows 盘符认成 scheme，
 * `C:/.../x.scss` 直接被当成外部 URL 解析失败，组件被 poison，
 * AOT 静默退化成 JIT。相对路径 + 同结构目录没有这个雷。
 *
 * import 绝对化不受影响 —— 那是 TS 模块解析，不吃 URL 规则。
 *
 * 全部走「AST 定位 + 原文按 span 拼接」，不用 createPrinter 重印 ——
 * 重印会把整个文件格式化掉，改动面失控。
 */
export interface ResourceCopy {
  /** 资源原文件绝对路径 */
  from: string;
  /** 应落到 cache 里的绝对路径（相对位置与原文件保持一致） */
  to: string;
}

export interface ComponentRewriteResult {
  code: string;
  /** 本次内联掉的模板绝对路径 */
  inlinedTemplates: string[];
  /** 需要复制进 cache 的资源 */
  resources: ResourceCopy[];
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

const TEMPLATE_URL = 'templateUrl';
const TEMPLATE = 'template';
const STYLE_URL = 'styleUrl';
const STYLE_URLS = 'styleUrls';

function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/');
}

function stringLiteralValue(node: ts.Node | undefined): string | undefined {
  if (
    node &&
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
  ) {
    return (node as ts.StringLiteral).text;
  }
  return undefined;
}

function propertyName(prop: ts.ObjectLiteralElementLike): string | undefined {
  if (!('name' in prop) || !prop.name) {
    return undefined;
  }
  const name = prop.name as ts.PropertyName;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text;
  }
  return undefined;
}

/** 收集 @Component / @Directive 里的元数据对象字面量 */
function metadataObjects(sf: ts.SourceFile): ts.ObjectLiteralExpression[] {
  const out: ts.ObjectLiteralExpression[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
      for (const dec of ts.getDecorators(node) ?? []) {
        const expr = dec.expression;
        if (!ts.isCallExpression(expr) || expr.arguments.length !== 1) {
          continue;
        }
        const arg = expr.arguments[0];
        if (ts.isObjectLiteralExpression(arg)) {
          out.push(arg);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

function applyEdits(source: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = source;
  for (const e of sorted) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return out;
}

/**
 * 重写组件源文件。
 *
 * `templates` 一个都没命中时返回 `null`，调用方据此跳过生成。
 *
 * `cachedFileName` 是生成文件将要落到的绝对路径，用来算资源该复制到哪。
 */
export function rewriteComponentForWxs(
  source: string,
  fileName: string,
  cachedFileName: string,
  /** 模板绝对路径 -> 剥离后的文本；没登记过返回 undefined */
  strippedForFile: (templateAbsPath: string) => string | undefined,
  /** inline 模板原文 -> 剥离后的文本 */
  strippedForInline: (rawTemplate: string) => string | undefined = () =>
    undefined,
): ComponentRewriteResult | null {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );
  const dir = path.dirname(fileName);
  const cachedDir = path.dirname(cachedFileName);
  const edits: Edit[] = [];
  const inlinedTemplates: string[] = [];
  const resources: ResourceCopy[] = [];
  /** inline `template` 命中数；本文件没有 templateUrl 时靠它判定「改过」 */
  const inlineHits: string[] = [];

  /** 相对资源串 -> 复制项；非相对（绝对 / http）原样交给 Angular */
  const trackResource = (url: string | undefined): void => {
    if (url === undefined || !url.startsWith('.')) {
      return;
    }
    resources.push({
      from: toPosixPath(path.resolve(dir, url)),
      to: toPosixPath(path.resolve(cachedDir, url)),
    });
  };

  for (const meta of metadataObjects(sf)) {
    for (const prop of meta.properties) {
      const name = propertyName(prop);

      if (name === TEMPLATE_URL && ts.isPropertyAssignment(prop)) {
        const url = stringLiteralValue(prop.initializer);
        if (url === undefined) {
          // 非字面量 templateUrl：无从判断它指不指 wxs 模板，跳过。
          // 在这里报错会为了一个无关组件卡住整个构建。
          continue;
        }
        const abs = toPosixPath(path.resolve(dir, url));
        const stripped = strippedForFile(abs);
        if (stripped === undefined) {
          /**
           * 同文件里其他组件的模板：没 wxs，不动源码，把 html 复制过来，
           * 相对路径在新位置照样能解析到。
           */
          trackResource(url);
          continue;
        }
        edits.push({
          start: prop.getStart(sf),
          end: prop.getEnd(),
          text: `template: ${JSON.stringify(stripped)}`,
        });
        inlinedTemplates.push(abs);
        continue;
      }

      /**
       * inline `template`：模板文本就在本文件里，没有外部路径可查，
       * 所以按「原文字面量全文」去 `inlineTemplates` 里查剥离结果。
       *
       * 整条属性替换（不是按偏移切）：模板字符串里可能有 `\n`、`\`` 这类
       * 转义，源码偏移和 Angular 看到的求值后文本偏移不等，做偏移运算必错。
       */
      if (name === TEMPLATE && ts.isPropertyAssignment(prop)) {
        const raw = stringLiteralValue(prop.initializer);
        if (raw === undefined) {
          // 含 `${}` 的模板字符串：静态取不到全文，跳过
          continue;
        }
        const strippedInline = strippedForInline(raw);
        if (strippedInline === undefined) {
          continue;
        }
        edits.push({
          start: prop.getStart(sf),
          end: prop.getEnd(),
          text: `template: ${JSON.stringify(strippedInline)}`,
        });
        inlineHits.push(fileName);
        continue;
      }

      if (
        (name === STYLE_URL || name === STYLE_URLS) &&
        ts.isPropertyAssignment(prop)
      ) {
        if (name === STYLE_URL) {
          trackResource(stringLiteralValue(prop.initializer));
        } else if (ts.isArrayLiteralExpression(prop.initializer)) {
          for (const item of prop.initializer.elements) {
            trackResource(stringLiteralValue(item));
          }
        }
      }
    }
  }

  if (!inlinedTemplates.length && !inlineHits.length) {
    return null;
  }

  /**
   * 相对 import 绝对化。
   *
   * 只在真的内联了模板之后才做 —— 没挪文件就没有挪路径的理由。
   * 覆盖 `import ... from` 与 `export ... from`；动态 import() 里写
   * 相对路径的极少，且绝对化它会改变 chunk 语义，不在这里动。
   */
  const absolutizeSpecifier = (node: ts.Expression): void => {
    const v = stringLiteralValue(node);
    if (v === undefined || !v.startsWith('.')) {
      return;
    }
    edits.push({
      start: node.getStart(sf),
      end: node.getEnd(),
      text: JSON.stringify(toPosixPath(path.resolve(dir, v))),
    });
  };

  const visitImports = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    ) {
      absolutizeSpecifier(node.moduleSpecifier);
    }
    ts.forEachChild(node, visitImports);
  };
  visitImports(sf);

  return { code: applyEdits(source, edits), inlinedTemplates, resources };
}

/**
 * 找出一个 .ts 里所有**含 `<wxs`** 的 inline `template` 字面量全文。
 *
 * 返回的是求值后的文本（`node.text`），即 Angular 实际看到的那份，
 * 不是源码里的原始字节 —— 两者在有转义时不等价。
 *
 * 含 `${}` 插值的模板字符串取不到静态全文，直接不报：宁可漏报让
 * Angular 自己报 `fmt is not defined`，也不要为了它卡住整个构建。
 */
export function findInlineWxsTemplates(source: string): string[] {
  if (!source.includes('<wxs')) {
    return [];
  }
  const sf = ts.createSourceFile(
    'scan.ts',
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );
  const out: string[] = [];
  for (const meta of metadataObjects(sf)) {
    for (const prop of meta.properties) {
      if (propertyName(prop) !== TEMPLATE || !ts.isPropertyAssignment(prop)) {
        continue;
      }
      const raw = stringLiteralValue(prop.initializer);
      if (raw !== undefined && raw.includes('<wxs')) {
        out.push(raw);
      }
    }
  }
  return out;
}
