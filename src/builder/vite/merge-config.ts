/**
 * 配置文件合并。
 *
 * 规则只有一条：**用户写过的不动，没写的才补**。唯一的例外是 `pages`，
 * 它是追加（用户写的在前，构建器扫出来的追加在后，按路径去重）——
 * 构建器扫出来的入口页必须进 `pages`，否则小程序里没有这个页面，
 * 而用户完全可能自己写额外页面（原生页面、第三方页面）。
 *
 * 入参一律不改，返回全新对象：解析出来的配置对象会被分包插件、assets 插件、
 * 以后的多语言插件共用同一个引用，原地改会让前一处拿到被后一处改脏的数据，
 * watch 重跑时还会基于已经改脏的数据。
 */

import type { MpConfigObject } from './config-schema';

/** 配置对象的形状由 valibot 定义（config-schema），这里只转发，不另写一份 */
export type { MpConfigObject };

/**
 * 数组追加型 key → 条目标识字段。
 *
 * `pages[0]` 是默认启动页，改顺序就是改行为，所以只能追加。
 * `subpackages` 按 root 认：构建器按入口目录派生出来的分包要能并进用户那份，
 * 而不是把用户写的整包顶掉；同一个 root 用户写了就以用户那份为准。
 */
const APPEND_KEYS: Record<string, string> = {
  pages: 'path',
  subpackages: 'root',
  subPackages: 'root',
};

/**
 * 对象合并型 key：两边都是对象时逐子项合并，patch 的同名子项覆盖。
 *
 * `usingComponents` 必须这么处理：组件路径由分析层算出来，用户手写的同名条目
 * 十有八九是过期路径，留用户的只会得到一个「组件找不到」。
 */
const MERGE_OBJECT_KEYS = new Set(['usingComponents']);

/** 同一个列表的不同写法，产物里只留一份 */
const SUB_PACKAGE_KEYS = ['subpackages', 'subPackages'] as const;

export type MpSubPackageKey = (typeof SUB_PACKAGE_KEYS)[number];

/**
 * 构建器内部字段：参与合并，但绝不进输出文件。
 *
 * `_platform` 是「按平台分段」的容器，输出里没有这个字段，
 * 各家小程序的 app.json 也不会多出这么一个 key。
 * `$schema` 是给编辑器指形状用的，只属于源文件，带进产物只是噪声。
 */
export const INTERNAL_KEYS = ['_platform', '$schema'];

/**
 * 属于 project.config.json 的字段。
 *
 * 只用来提醒「你写错文件了」，不参与分流：app.json 里出现 `appid` 照样原样输出，
 * 只是日志里说一声。做成自动分流的话，写错的人永远看不到自己写错了。
 */
export const PROJECT_CONFIG_KEYS = [
  'appid',
  'setting',
  'projectname',
  'packOptions',
  'miniprogramRoot',
  'cloudfunctionRoot',
  'pluginRoot',
  'compileType',
  'libVersion',
  'scripts',
  'watchOptions',
  'condition',
];

/** 属于 app.json 的字段（反向提醒用） */
export const APP_CONFIG_KEYS = [
  'pages',
  'entryPagePath',
  'window',
  'tabBar',
  'subpackages',
  'subPackages',
  'preloadRule',
  'usingComponents',
];

function isPlainObject(value: unknown): value is MpConfigObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** JSON 对象专用比较：键顺序一致时字符串相等即内容等价 */
function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** 条目的去重标识：对象取标识字段（字符串条目就是它自己） */
function itemKeyOf(item: unknown, identity: string): unknown {
  return isPlainObject(item) ? item[identity] : item;
}

/**
 * base 在前、patch 在后，按标识去重。
 *
 * 标识已存在的条目：`deep` 时只往它里面补没写的子字段（用户只写了分包 root，
 * pages 由构建器填），不写就一个字不动。
 */
function appendUnique(
  base: unknown[],
  patch: unknown[],
  identity: string,
  deep: boolean,
): unknown[] {
  const seen = new Map<unknown, number>();
  base.forEach((item, index) => {
    const key = itemKeyOf(item, identity);
    if (key !== undefined && !seen.has(key)) {
      seen.set(key, index);
    }
  });
  const list = [...base];
  for (const item of patch) {
    const key = itemKeyOf(item, identity);
    const at = key === undefined ? undefined : seen.get(key);
    if (at === undefined) {
      if (key !== undefined) {
        seen.set(key, list.length);
      }
      list.push(structuredClone(item));
      continue;
    }
    const existing = list[at];
    if (deep && isPlainObject(existing) && isPlainObject(item)) {
      for (const [name, sub] of Object.entries(item)) {
        applyKey(existing, name, sub, true);
      }
    }
  }
  return list;
}

/** 同一个列表的不同写法，算同一个 key */
function aliasGroup(key: string): readonly string[] {
  return (SUB_PACKAGE_KEYS as readonly string[]).includes(key)
    ? SUB_PACKAGE_KEYS
    : [key];
}

/** 已写过的那一份叫什么名字（分包两种写法只留一份，追加要追加到它身上） */
function writtenKeyOf(merged: MpConfigObject, key: string): string {
  return (
    aliasGroup(key).find(
      (name) =>
        Object.prototype.hasOwnProperty.call(merged, name) &&
        merged[name] !== undefined,
    ) ?? key
  );
}

/** 这个 key 是否已经写过：同一组的别名写法也算写过 */
function isWritten(merged: MpConfigObject, key: string): boolean {
  return aliasGroup(key).some(
    (name) =>
      Object.prototype.hasOwnProperty.call(merged, name) &&
      merged[name] !== undefined,
  );
}

/**
 * 把 patch 里 base 没写过的 key 补进 base，返回新对象。
 *
 * base 里已经存在的 key 一律不动（标量、对象、数组都一样），所以
 * `window` / `tabBar` 这类字段只要用户写了，构建器就一个字都不改。
 */
export function mergeConfig(
  base: MpConfigObject,
  patch?: MpConfigObject | null,
): MpConfigObject {
  const merged: MpConfigObject = structuredClone(base);
  if (!isPlainObject(patch)) {
    return merged;
  }
  for (const [key, value] of Object.entries(patch)) {
    applyKey(merged, key, value, false);
  }
  return merged;
}

/** 单个 key 的补空规则（`deep` 时允许往已有对象里递归补缺失子字段） */
function applyKey(
  merged: MpConfigObject,
  key: string,
  value: unknown,
  deep: boolean,
): void {
  if (INTERNAL_KEYS.includes(key) || value === undefined) {
    return;
  }
  if (!isWritten(merged, key)) {
    merged[key] = structuredClone(value);
    return;
  }
  if (APPEND_KEYS[key] !== undefined) {
    // 分包两种写法只有一份能存在，补到哪一份上要看已经写的是哪个
    const name = writtenKeyOf(merged, key);
    const current = merged[name];
    if (Array.isArray(current) && Array.isArray(value)) {
      merged[name] = appendUnique(current, value, APPEND_KEYS[key], deep);
    }
    return;
  }
  if (MERGE_OBJECT_KEYS.has(key)) {
    const current = merged[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      merged[key] = { ...current, ...structuredClone(value) };
    }
    return;
  }
  if (deep) {
    const current = merged[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      for (const [name, sub] of Object.entries(value)) {
        applyKey(current, name, sub, true);
      }
    }
  }
}

/**
 * 构建器补字段专用的合并：比用户那份的合并多一条——允许往用户已经写过的对象里
 * 补缺失的**子字段**。
 *
 * 自定义 tabBar 的开关就得这么补：用户写了 `tabBar.list` 但没写开关，
 * 开关得能进去，`list` 一个字都不能动。用户写过的子字段依旧不动。
 */
export function mergeDerived(
  base: MpConfigObject,
  patch?: MpConfigObject | null,
): MpConfigObject {
  const merged: MpConfigObject = structuredClone(base);
  if (!isPlainObject(patch)) {
    return merged;
  }
  for (const [key, value] of Object.entries(patch)) {
    applyKey(merged, key, value, true);
  }
  return merged;
}

/** 合并是否真的补进了东西（用来决定「能不能逐字节原样输出用户那份」） */
export function mergeChanged(before: MpConfigObject, after: MpConfigObject) {
  return !sameJson(before, after);
}

/**
 * 把 `subpackages` / `subPackages` 统一成当前平台的写法。
 *
 * 两种写法混在一起会输出两份分包，所以合并完必须收敛成一个 key。
 * 两边都没有时不生成这个字段——构建器不替用户决定分包。
 */
export function unifySubPackageKey(
  config: MpConfigObject,
  key: MpSubPackageKey,
): MpConfigObject {
  const lists = SUB_PACKAGE_KEYS.map((name) => config[name]).filter(
    (list): list is unknown[] => Array.isArray(list),
  );
  if (!lists.length) {
    return config;
  }
  const merged: MpConfigObject = { ...config };
  for (const name of SUB_PACKAGE_KEYS) {
    delete merged[name];
  }
  const seen = new Set<unknown>();
  const packages: unknown[] = [];
  for (const item of lists.flat()) {
    const root = isPlainObject(item) ? item.root : undefined;
    const id = typeof root === 'string' ? root : item;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    packages.push(item);
  }
  merged[key] = packages;
  return merged;
}

/** 剥掉构建器内部字段（输出前、以及每份来源参与合并前都跑一次） */
export function stripInternalKeys(config: MpConfigObject): MpConfigObject {
  if (!INTERNAL_KEYS.some((key) => key in config)) {
    return config;
  }
  const merged: MpConfigObject = { ...config };
  for (const key of INTERNAL_KEYS) {
    delete merged[key];
  }
  return merged;
}

/** 命中「写错文件」的字段名 */
export function findMisplacedKeys(
  config: MpConfigObject,
  allowed: string[],
): string[] {
  return Object.keys(config).filter((key) => allowed.includes(key));
}
