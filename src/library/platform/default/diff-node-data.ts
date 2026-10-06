/**
 * setData diff 算法。
 *
 * 语义：
 *  - 部分变更：产出路径式 key 的扁平对象，如 `{ 'a.b': 2 }`。
 *  - 折叠（allChange）：当某对象/数组的每一个子项都「完全变更」时，改为整体送出该子树，
 *    如 `{ a: { b: 2 } }`，减少 setData 的 key 数量。只要有任意一个子项是部分变更，父级就不折叠。
 *  - key 数 / 数组长度不一致：无法逐字段对齐，整体送出 `to`。
 *  - 任何 `undefined` 一律转 `null`（微信 setData 对路径式 undefined 直接拒绝整次调用）。
 *
 * 性能：
 *  1. 引用相等短路：`fromItem === toItem` 直接判定未变，跳过整棵子树。
 *  2. 单一累加器 + Object.assign：避免每层每个变更都展开对象造成的 O(N²) 拷贝。
 *  3. 单趟净化：逐字段写时内联把 undefined 转 null；只有整体送出的子树才需要 sanitize。
 */

/** 子项相对父级的变更状态 */
const SAME = 0; // 未变
const PARTIAL = 1; // 变了，但是「部分变更」（父级不因此折叠）
const FULL = 2; // 完全变更（叶子变化，或子树整体折叠）——计入父级折叠判定

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * 整体送出 `value`：prefix 为空串表示顶层整体变更，把净化后的 to 并入 out 本身；
 * 否则以 prefix 为 key 挂上净化后的整棵子树。
 */
function emitWhole(
  prefix: string,
  value: unknown,
  out: Record<string, unknown>,
): void {
  if (prefix === '') {
    Object.assign(out, sanitizeUndefined(value));
  } else {
    out[prefix] = sanitizeUndefined(value);
  }
}

/** 比较任意两个值，把变更写入共享累加器 out，返回变更状态。 */
function diffValue(
  fromItem: unknown,
  toItem: unknown,
  prefix: string,
  out: Record<string, unknown>,
): number {
  // 引用相等（含所有相同原始值）直接短路，跳过整棵子树
  if (fromItem === toItem) {
    return SAME;
  }
  if (Array.isArray(fromItem) && Array.isArray(toItem)) {
    return diffArray(fromItem, toItem, prefix, out);
  }
  if (isPlainObject(fromItem) && isPlainObject(toItem)) {
    return diffObject(fromItem, toItem, prefix, out);
  }
  // 叶子：值不同。内联把 undefined 转 null。
  out[prefix] = toItem === undefined ? null : toItem;
  return FULL;
}

function diffObject(
  from: Record<string, unknown>,
  to: Record<string, unknown>,
  prefix: string,
  out: Record<string, unknown>,
): number {
  const toKeys = Object.keys(to);
  // key 数不一致：无法逐字段对齐，整体送出
  if (Object.keys(from).length !== toKeys.length) {
    emitWhole(prefix, to, out);
    return FULL;
  }

  // 子累加器：先收在本层，若最终折叠则丢弃、改整体送出
  const childOut: Record<string, unknown> = {};
  const point = prefix ? '.' : '';
  let fullCount = 0;
  let anyChange = false;
  for (let i = 0; i < toKeys.length; i++) {
    const key = toKeys[i];
    const status = diffValue(
      from[key],
      to[key],
      prefix + point + key,
      childOut,
    );
    if (status !== SAME) {
      anyChange = true;
      if (status === FULL) {
        fullCount++;
      }
    }
  }
  if (!anyChange) {
    return SAME;
  }
  // 每个子项都「完全变更」→ 折叠为整体送出
  if (fullCount === toKeys.length && toKeys.length !== 0) {
    emitWhole(prefix, to, out);
    return FULL;
  }
  // 部分变更：把子累加器一次性并入父累加器
  Object.assign(out, childOut);
  return PARTIAL;
}

function diffArray(
  from: unknown[],
  to: unknown[],
  prefix: string,
  out: Record<string, unknown>,
): number {
  if (from.length !== to.length) {
    emitWhole(prefix, to, out);
    return FULL;
  }
  const childOut: Record<string, unknown> = {};
  let fullCount = 0;
  let anyChange = false;
  for (let i = 0; i < to.length; i++) {
    const status = diffValue(from[i], to[i], `${prefix}[${i}]`, childOut);
    if (status !== SAME) {
      anyChange = true;
      if (status === FULL) {
        fullCount++;
      }
    }
  }
  if (!anyChange) {
    return SAME;
  }
  if (fullCount === to.length && to.length !== 0) {
    emitWhole(prefix, to, out);
    return FULL;
  }
  Object.assign(out, childOut);
  return PARTIAL;
}

/**
 * 把数据里所有 `undefined` 换成 `null`。微信 `setData` 不接受 `undefined`，且不是只丢那一个
 * 字段，而是整个 setData 调用失败 → 界面从此不再更新。`null` 是合法值，且在 wxml 里仍为 falsy。
 * 仅在「整体送出」子树时调用。
 */
function sanitizeUndefined<T>(value: T, seen = new Set<unknown>()): T {
  if (value === undefined) {
    return null as unknown as T;
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUndefined(item, seen)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  Object.keys(value as Record<string, unknown>).forEach((k) => {
    out[k] = sanitizeUndefined((value as Record<string, unknown>)[k], seen);
  });
  return out as unknown as T;
}

export function diffNodeData(
  from: Record<string, unknown>,
  to: Record<string, unknown>,
) {
  const out: Record<string, unknown> = {};
  diffValue(from, to, '', out);
  return out;
}
