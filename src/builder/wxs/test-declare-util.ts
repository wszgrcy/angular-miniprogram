/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 测试辅助：给模板自动补 `<wxs module src>` 声明。
 *
 * 模块名来自声明，所以测试里用裸名（`mod.fn(a)`）时必须先声明，
 * 否则它就是个普通 Angular 属性访问。这里按已知模块清单自动前置声明，
 * 让各 spec 的断言集中在枝叶拆分 / 下标展开上。
 *
 * 多声明几个无害：改写阶段不查文件存在性（那是分析服务的事）。
 */
export const KNOWN_WXS_MODULES = [
  'mod',
  'util',
  'format',
  'm',
  'u',
  'test',
  'm1',
  'm2',
  'ghost',
  'shared',
  'real',
  'other',
  'obj',
  'evt',
  'f',
  'fn',
  'k',
];

export function withDeclarations(
  html: string,
  modules: string[] = KNOWN_WXS_MODULES,
): string {
  if (!modules.length) {
    return html;
  }
  const used = modules.filter((mod) =>
    new RegExp(`\\b${mod}\\s*[.\\[]`).test(html),
  );
  if (!used.length) {
    return html;
  }
  return (
    used
      .map((mod) => `<wxs module="${mod}" src="./${mod}.wxs"></wxs>`)
      .join('') + html
  );
}
