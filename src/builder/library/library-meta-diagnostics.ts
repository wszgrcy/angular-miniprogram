/**
 * 库元数据缺失诊断。
 *
 * 「查不到元数据」如果返回空集合并覆盖掉 `host.listeners`，结果是 wxml 一个事件绑定都没有、
 * 表单全部不响应，而且没有任何报错。这里把所有「没查到」显式登记，由构建器在每轮构建结束时
 * 打一条汇总日志——第三方库指令也会走到这里，逐个打会刷屏。
 *
 * 诊断只针对「本可以用本工具链构建、但没构建」的第三方库。`@angular/*` 直接跳过。
 */

/**
 * `@angular/*` 不登记元数据缺失。框架自己的包永远不会有 sidecar，报出来只会淹没真信号：
 * `NgClass` / `NgStyle` 的结果直接进 `nodeList[i].class` / `.style`，`NgIf` / `NgForOf`
 * 被编成 `wx:if` / `wx:for`，都不靠 host 绑定；`NgPlural` 之类本工具链用不到。
 *
 * 按路径段匹配，兼容两种分隔符、pnpm 的 `.pnpm/@angular+common@…/node_modules/@angular/…`
 * 与 fesm 子路径。
 */
const ANGULAR_PACKAGE_RE = /(^|[/\\])@angular[/\\]/;

export function isAngularFrameworkSource(sourceFile: string): boolean {
  return ANGULAR_PACKAGE_RE.test(sourceFile);
}

export type LibraryMetaMissReason =
  /** 来源包根本没有 sidecar（非本工具链构建的库，或应用自己的源码） */
  | 'no-sidecar'
  /** sidecar 有，但里面没有这个类（多半是库没重新构建 / 类不是指令） */
  | 'sidecar-missing-class';

export interface LibraryMetaMiss {
  className: string;
  sourceFile: string;
  reason: LibraryMetaMissReason;
}

let misses: LibraryMetaMiss[] = [];
const seen = new Set<string>();

export function recordLibraryMetaMiss(miss: LibraryMetaMiss): void {
  if (isAngularFrameworkSource(miss.sourceFile)) {
    return;
  }
  const key = `${miss.reason}::${miss.className}::${miss.sourceFile}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  misses.push(miss);
}

export function getLibraryMetaMisses(): readonly LibraryMetaMiss[] {
  return misses;
}

export function clearLibraryMetaMisses(): void {
  misses = [];
  seen.clear();
}

/**
 * 汇总成人可读的一段话。没有缺失时返回空串。
 * `sidecar-missing-class` 排在前面——它比「对方压根不是本工具链的库」更可能是真问题。
 */
export function formatLibraryMetaSummary(): string {
  if (misses.length === 0) {
    return '';
  }
  const stale = misses.filter((m) => m.reason === 'sidecar-missing-class');
  const noSidecar = misses.filter((m) => m.reason === 'no-sidecar');
  const parts: string[] = [];
  if (stale.length) {
    parts.push(
      `${stale.length} 个指令所在库有元数据文件但查不到该类（多半是库改完没重新构建），` +
        `不会生成 host 事件/属性绑定：` +
        stale.map((m) => `${m.className} @ ${m.sourceFile}`).join('、'),
    );
  }
  if (noSidecar.length) {
    parts.push(
      `${noSidecar.length} 个指令来自没有元数据文件的包（非本工具链构建），` +
        `不会生成 host 事件/属性绑定：` +
        noSidecar.map((m) => `${m.className}`).join('、'),
    );
  }
  return parts.join('\n');
}
