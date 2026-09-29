import * as path from 'path';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * wxs 声明的提取。
 *
 * 照 uni-app 的显式引入模型：模板里必须写出来，
 * 不再靠「同目录同名」的隐式约定 —— 隐式约定让共享脚本无法表达，
 * 而且出问题时完全看不出模块从哪来。
 *
 *   <wxs module="format" src="./format.wxs"></wxs>
 *
 * `src` 相对**组件源文件**解析，所以共享脚本写 `../common/format.wxs` 即可。
 *
 * 注：**模板内联形式不支持**。Angular 解析器会把裸 JS 的 `{` 当成
 * ICU / 插值起始符，`module.exports={a:a}` 直接解析失败；
 * 而 `<script lang="wxs">` 会被 Angular 从模板里整块剥掉。
 * uni-app 能做内联是因为它有 SFC 预处理器抢在 Angular 之前摘走，
 * 我们没有那一层。要内联只能走 TS 侧，不是模板侧。
 */
export interface WxsDeclaration {
  module: string;
  src: string;
}

const WXS_TAG = 'wxs';

function kindOf(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  return (node as any).constructor?.name ?? '';
}

function attrValue(node: any, name: string): string | undefined {
  const found = (node.attributes ?? []).find((a: any) => a.name === name);
  return found?.value;
}

/**
 * 找出并**摘除**模板里的 `<wxs>` 声明节点。
 *
 * 必须摘除：它不是渲染节点，留在树里会被当成一个真实元素产出空标签。
 * 摘除后声明信息交给上层做解析与落盘。
 */
export function extractWxsDeclarations(nodes: any[]): WxsDeclaration[] {
  const out: WxsDeclaration[] = [];
  if (!Array.isArray(nodes)) {
    return out;
  }
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (kindOf(node) !== 'Element' || node.name !== WXS_TAG) {
      continue;
    }
    const module = attrValue(node, 'module');
    const src = attrValue(node, 'src');
    if (!module || !src) {
      throw new Error(
        `<wxs> 声明必须同时带 module 和 src：` +
          `<wxs module="format" src="./format.wxs"></wxs>。` +
          `当前 module=${module ?? '<缺失>'} src=${src ?? '<缺失>'}。`,
      );
    }
    if (node.children?.length) {
      throw new Error(
        `<wxs module="${module}"> 不支持内联写法：Angular 会把裸 JS 的 ` +
          `{ 当成 ICU/插值起始符。请把代码放进 ${src} 文件里。`,
      );
    }
    out.unshift({ module, src });
    nodes.splice(i, 1);
  }
  // 递归处理 ng-template / 子树里的声明
  for (const node of nodes) {
    if (!node || typeof node !== 'object') {
      continue;
    }
    if (Array.isArray(node.children)) {
      out.push(...extractWxsDeclarations(node.children));
    }
    if (node.template) {
      out.push(...extractWxsDeclarations([node.template]));
    }
  }
  return out;
}

/** 声明重名检查：同名指向不同文件会让后声明的静默覆盖前一个 */
export function assertNoDuplicateModule(decls: WxsDeclaration[]): void {
  const seen = new Map<string, string>();
  for (const d of decls) {
    const prev = seen.get(d.module);
    if (prev !== undefined && prev !== d.src) {
      throw new Error(
        `wxs 模块名 "${d.module}" 重复声明且 src 不同：` +
          `"${prev}" 与 "${d.src}"。同名会让后者静默覆盖前者。`,
      );
    }
    seen.set(d.module, d.src);
  }
}

/**
 * 共享落盘计划：把多个组件的声明归并成「每个源文件只落一份」。
 *
 * 集中到 `<sharedDir>/<module><extname>`，所有 wxml 用应用根
 * 绝对路径引用。**不能按组件各存副本** —— 那会带来包体重复、
 * 改一处要同步多处、模块状态不唯一。
 *
 * 同名不同源必须报错：它们会撞同一个产物路径，谁覆盖谁全看遍历顺序。
 */
export function planSharedWxsEmit(
  entries: Array<{ module: string; resolvedSource: string }>,
  sharedDir: string,
  extname: string,
): { outPath: string; module: string; source: string }[] {
  const moduleToSource = new Map<string, string>();
  const plan: { outPath: string; module: string; source: string }[] = [];
  const emitted = new Set<string>();

  for (const e of entries) {
    const norm = path.normalize(e.resolvedSource);
    const prev = moduleToSource.get(e.module);
    if (prev !== undefined && prev !== norm) {
      throw new Error(
        `wxs 模块名 "${e.module}" 指向了两个不同的源文件：\n` +
          `  ${prev}\n  ${norm}\n` +
          `集中落盘会撞同一个产物 ${sharedDir}/${e.module}${extname}，` +
          `必须让模块名与源文件一一对应。`,
      );
    }
    moduleToSource.set(e.module, norm);

    const outPath = `${sharedDir}/${e.module}${extname}`;
    if (emitted.has(outPath)) {
      continue;
    }
    emitted.add(outPath);
    plan.push({ outPath, module: e.module, source: norm });
  }
  return plan;
}
