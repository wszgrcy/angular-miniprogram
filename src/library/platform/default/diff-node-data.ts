interface DiffResult {
  allChange: boolean;
  object?: Record<string, unknown>;
}
function _arrayOrObjectItemDiff(
  count: number,
  prefix: string,
  fromItem: unknown,
  toItem: unknown,
  changeObject: Record<string, unknown>
) {
  if (fromItem instanceof Array && toItem instanceof Array) {
    const result = diffDataArray(fromItem, toItem, prefix);
    if (result.allChange || result.object) {
      if (result.allChange) {
        count++;
        changeObject[prefix] = toItem;
      } else {
        changeObject = { ...changeObject, ...result.object };
      }
    }
    return { count: count, changeObject };
  } else if (
    typeof fromItem === 'object' &&
    fromItem !== null &&
    typeof toItem === 'object' &&
    toItem !== null
  ) {
    const result = diffDataObject(
      fromItem as Record<string, null>,
      toItem as Record<string, null>,
      prefix
    );
    if (result.allChange || result.object) {
      if (result.allChange) {
        count++;
        changeObject[prefix] = toItem;
      } else {
        changeObject = { ...changeObject, ...result.object };
      }
    }
    return { count: count, changeObject };
  } else if (fromItem !== toItem) {
    /**
     * 微信 `setData` 不接受路径式 key 上的 `undefined`：
     *
     *   Setting data field "nodeList.11.0.__templateName" to
     *   undefined is invalid.
     *
     * 这里把 `undefined` 统一换成 `null`：语义上 diff 的「无值」
     * 就是 `null`，且 `null` 是合法 setData 值，在 wxml 里仍为 falsy，
     * `{{item.x || 'fallback'}}` 行为不变。
     *
     * 这是除源头之外的第二道防线 —— 任何一个字段（`value` /
     * `class` / `property.*`）只要变成 `undefined` 都会触发同样的
     * 「整个 setData 被拒 → 界面冻结」。
     */
    changeObject[prefix] = toItem === undefined ? null : toItem;
    count++;
    return { count: count, changeObject };
  }
  return { count: count, changeObject };
}
function diffDataObject(
  from: Record<string, unknown>,
  to: Record<string, unknown>,
  prefix: string
): DiffResult {
  const toKeyList = Object.keys(to);
  let changeObject: Record<string, unknown> = {};
  const point = prefix ? '.' : '';
  let count = 0;
  if (Object.keys(from).length !== toKeyList.length) {
    return { allChange: true };
  }

  for (let index = 0; index < toKeyList.length; index++) {
    const key = toKeyList[index];
    const fromItem = from[key];
    const toItem = to[key];
    const currentPrefix = `${prefix}${point}${key}`;
    const result = _arrayOrObjectItemDiff(
      count,
      currentPrefix,
      fromItem,
      toItem,
      changeObject
    );
    count = result.count;
    changeObject = result.changeObject;
  }
  if (count === toKeyList.length && toKeyList.length !== 0) {
    return { allChange: true };
  }
  return { allChange: false, object: changeObject };
}
function diffDataArray(
  from: unknown[],
  to: unknown[],
  prefix: string
): DiffResult {
  let changeObject: Record<string, unknown> = {};

  if (from.length !== to.length) {
    return { allChange: true };
  }
  let count = 0;
  for (let i = 0; i < to.length; i++) {
    const fromItem = from[i];
    const toItem = to[i];
    const currentPrefix = `${prefix}[${i}]`;
    const result = _arrayOrObjectItemDiff(
      count,
      currentPrefix,
      fromItem,
      toItem,
      changeObject
    );
    count = result.count;
    changeObject = result.changeObject;
  }
  if (count === to.length && to.length !== 0) {
    return {
      allChange: true,
    };
  }
  return { allChange: false, object: changeObject };
}
/**
 * 把数据里所有 `undefined` 换成 `null`。
 *
 * 微信 `setData` 不接受 `undefined`（报
 * "Setting data field ... to undefined is invalid"），且不是只丢那一个
 * 字段，而是**整个 setData 调用失败** → 界面从此不再更新。
 *
 * `null` 是合法值，且在 wxml 里仍为 falsy，
 * `{{item.x || 'fallback'}}` 行为不变。
 */
function sanitizeUndefined<T>(value: T, seen = new Set<unknown>()): T {
  if (value === undefined) {return null as unknown as T;}
  if (!value || typeof value !== 'object') {return value;}
  if (seen.has(value)) {return value;}
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
  to: Record<string, unknown>
) {
  const result = diffDataObject(from, to, '');
  if (result.allChange) {
    /**
     * allChange 会把整个 `to` 直接送进 setData。它可能含 `undefined`
     * （顶层或任意深度），必须净化，否则整次 setData 被拒。
     */
    return sanitizeUndefined(to);
  }
  return sanitizeUndefined(result.object!);
}
