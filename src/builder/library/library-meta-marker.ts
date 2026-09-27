import fs from 'fs-extra';
import path from 'path';

/**
 * 库构建期间产出的「指令 host listeners / host properties」标记文本暂存区。
 *
 * ## 为什么需要这个文件
 *
 * 应用构建时，`MiniProgramCompilerService.getLibraryDirectiveMeta()` 会从库的
 * `.d.ts` 里查这两个 `declare const`：
 *
 * ```ts
 * declare const DefaultValueAccessor_Listeners: ["bindinput", "bindblur"];
 * declare const DefaultValueAccessor_Properties: [...];
 * ```
 *
 * 它们被 `ComponentContext` 用来给 wxml 生成事件绑定：
 *
 * ```html
 * <input bind:input="bindEvent" bind:blur="bindEvent" .../>
 * ```
 *
 * **ng-packagr 22 的 d.ts 扁平化会把不在导出引用图里的 `declare const`
 * tree-shake 掉**（加 `export` 也没用，因为入口的 re-export 列表里没有它们）。
 * 标记一丢：
 *
 * ```
 * getLibraryDirectiveMeta() → listeners: []
 *   → ComponentContext 用 [] 覆盖掉 host.listeners
 *   → wxml 里一个事件绑定都没有
 *   → 表单输入、勾选、picker 全部不响应，且毫无报错
 * ```
 *
 * 所以标记必须在**扁平化之后**补写回最终的 `dist/types/*.d.ts`。
 * 本文件就是这个「暂存 + 补写」的载体。
 */

/** 追加块的起止哨兵，用于幂等：重复构建时整块替换而不是无限累加。 */
const MARKER_BEGIN = '/* __mp_library_meta_begin__ */';
const MARKER_END = '/* __mp_library_meta_end__ */';

/** entry moduleId（如 `angular-miniprogram/forms`）→ 标记文本 */
const store = new Map<string, string>();

/** 累积某个 entry point 产出的标记文本。 */
export function recordLibraryMetaMarker(
  entryPoint: string,
  markerText: string
): void {
  if (!markerText) {
    return;
  }
  store.set(entryPoint, (store.get(entryPoint) ?? '') + markerText);
}

/** 仅供测试：查看当前暂存内容。 */
export function peekLibraryMetaMarkers(): ReadonlyMap<string, string> {
  return store;
}

/** 仅供测试：清空暂存。 */
export function clearLibraryMetaMarkers(): void {
  store.clear();
}

/**
 * 把暂存的标记补写进库产物里所有对外的 `.d.ts`。
 *
 * 定位方式：扫 `distRoot` 下的 `package.json`，读 `typings` 字段。
 *
 * **所有标记写进所有 entry 的 d.ts**。理由：
 *
 * - 应用侧是按「指令类所在的那个 d.ts 文件」查标记的，把全集写进每个文件
 *   可以保证无论 TS 把某个指令解析到哪个文件都能命中；
 * - 扁平化后的 d.ts 是**模块**（含 `export`），`declare const` 是模块作用域，
 *   多个文件里有同名声明也不会互相冲突；
 * - 一个指令只属于一个 entry，不存在同名不同义的情况。
 *
 * 返回被写入的文件列表，便于日志与测试断言。
 */
export function flushLibraryMetaMarkers(distRoot: string): string[] {
  const markerText = [...store.values()].join('\n');
  if (!markerText) {
    return [];
  }
  const block = `\n${MARKER_BEGIN}\n${markerText}\n${MARKER_END}\n`;

  const written: string[] = [];
  for (const dtsPath of collectEntryTypingsFiles(distRoot)) {
    const original = fs.readFileSync(dtsPath, 'utf8');
    const stripped = stripExistingBlock(original);
    fs.writeFileSync(dtsPath, stripped + block);
    written.push(dtsPath);
  }
  return written;
}

/**
 * 找出 `distRoot` 下所有被 `package.json#typings` 指到的 `.d.ts`。
 *
 * 只认 `typings` 实际指向的文件，避免把中间产物或无关 d.ts 也改了。
 */
function collectEntryTypingsFiles(distRoot: string): string[] {
  const result = new Set<string>();
  if (!fs.existsSync(distRoot)) {
    return [];
  }
  for (const pkgJsonPath of findPackageJsonFiles(distRoot)) {
    let typings: unknown;
    try {
      typings = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')).typings;
    } catch {
      continue;
    }
    if (typeof typings !== 'string') {
      continue;
    }
    const resolved = path.resolve(path.dirname(pkgJsonPath), typings);
    if (fs.existsSync(resolved)) {
      result.add(resolved);
    }
  }
  return [...result];
}

function findPackageJsonFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findPackageJsonFiles(full));
    } else if (entry.name === 'package.json') {
      out.push(full);
    }
  }
  return out;
}

/** 去掉上一次追加的块，保证幂等（watch 模式会反复调用）。 */
function stripExistingBlock(content: string): string {
  const begin = content.indexOf(MARKER_BEGIN);
  if (begin === -1) {
    return content;
  }
  const end = content.indexOf(MARKER_END, begin);
  if (end === -1) {
    return content.slice(0, begin);
  }
  return content.slice(0, begin) + content.slice(end + MARKER_END.length);
}
