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
    changeObject[prefix] = toItem;
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
export function diffNodeData(
  from: Record<string, unknown>,
  to: Record<string, unknown>
) {
  const result = diffDataObject(from, to, '');
  if (result.allChange) {
    return to;
  }
  return result.object!;
}
