/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * key 级协议引擎，参考 uni-app wrapper.ts 的 processArgs：
 * 一张声明式映射表同时用于「参数改写」和「结果改写」。
 *
 * 字段规则（按 key 匹配源对象）：
 *
 * | 规则形态                        | 行为                                  |
 * |--------------------------------|----------------------------------------|
 * | `key: 'newKey'`                | 改名                                   |
 * | `key: false`                   | 丢弃（平台不支持该参数）                  |
 * | `key: (v, from, to) => value`  | 值转换；`false` 丢弃，`undefined` 保留原值 |
 * | `key: { name?, value }`        | 改名 + 指定值                           |
 * | 未声明的 key                    | 原样透传                               |
 *
 * 函数形态的整表写法 `(from, to) => fieldMap | void`：
 * 直接往 `to` 写入的字段优先于透传（用于产出 0/'' 这类假值场景），
 * 返回值可再叠加一层字段级映射。
 *
 * 与参考实现的差异（有意为之）：函数返回值按「值」理解，
 * 不再复用「返回字符串=改名」的歧义语义；改名只走静态形态。
 */

export type MpFieldTransform = (
  value: any,
  from: Record<string, any>,
  to: Record<string, any>,
) => any;

export interface MpFieldDescriptor {
  name?: string;
  value: any;
}

export type MpFieldOption = string | false | MpFieldTransform | MpFieldDescriptor;

export type MpFieldMap = Record<string, MpFieldOption>;

/** 整表函数形态：直接写 to，可返回补充的字段映射 */
export type MpMapFn = (
  from: Record<string, any>,
  to: Record<string, any>,
) => MpFieldMap | void | null | undefined;

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
  );
}

export function applyFieldMap(
  from: Record<string, any> | null | undefined,
  map?: MpFieldMap | MpMapFn,
) {
  const to: Record<string, any> = {};
  let fields: MpFieldMap = {};

  if (typeof map === 'function') {
    fields = map(from ?? {}, to) ?? {};
  } else if (map) {
    fields = map;
  }

  for (const key of Object.keys(from ?? {})) {
    if (!Object.prototype.hasOwnProperty.call(fields, key)) {
      // 未声明：透传，但函数形态已显式写入的字段优先
      if (!Object.prototype.hasOwnProperty.call(to, key)) {
        to[key] = from![key];
      }
      continue;
    }

    const option = fields[key];

    if (option === false) {
      continue;
    }
    if (typeof option === 'string') {
      to[option] = from![key];
      continue;
    }
    if (typeof option === 'function') {
      const result = option(from![key], from ?? {}, to);
      if (result === false) {
        continue;
      }
      if (result === undefined) {
        if (!Object.prototype.hasOwnProperty.call(to, key)) {
          to[key] = from![key];
        }
        continue;
      }
      to[key] = result;
      continue;
    }
    if (isPlainObject(option)) {
      to[option.name ?? key] = option.value;
      continue;
    }
    to[key] = from![key];
  }

  return to;
}
