/**
 * 按平台改写配置输出。
 *
 * 只做「同一个意思在这个平台叫什么」的改写，不做跨平台翻译：一次构建只认一个
 * 平台，输入写的是哪个平台的写法，输出就按那个平台的要求落。
 */

import type { MpConfigObject } from '../vite/config-schema';

function isPlainObject(value: unknown): value is MpConfigObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 支付宝系 app.json：
 *   - `darkmode` 在这个平台叫 `darkMode`（大小写不同）
 *   - `window.allowsBounceVertical` 只收 `'YES'` / `'NO'`，不收布尔
 */
export function alipayNormalizeAppJson(app: MpConfigObject): MpConfigObject {
  const merged: MpConfigObject = { ...app };
  if ('darkmode' in merged) {
    merged['darkMode'] = merged['darkmode'];
    delete merged['darkmode'];
  }
  const window = merged['window'];
  if (
    isPlainObject(window) &&
    typeof window.allowsBounceVertical === 'boolean'
  ) {
    merged['window'] = {
      ...window,
      allowsBounceVertical: window.allowsBounceVertical ? 'YES' : 'NO',
    };
  }
  return merged;
}

/**
 * 支付宝系 project 配置：调试启动项不叫 `condition`，叫 `compileModeJson`，
 * 形状也从 `{name, pathName, query}` 变成 `{title, page, pageQuery}`。
 */
export function alipayNormalizeProjectJson(
  project: MpConfigObject,
): MpConfigObject {
  const condition = project['condition'];
  if (!isPlainObject(condition)) {
    return project;
  }
  const miniprogram = condition['miniprogram'];
  if (!isPlainObject(miniprogram) || !Array.isArray(miniprogram.list)) {
    return project;
  }
  const merged: MpConfigObject = { ...project };
  delete merged['condition'];
  merged['compileModeJson'] = {
    modes: (miniprogram.list as MpConfigObject[]).map((item) => ({
      title: item['name'],
      page: item['pathName'],
      pageQuery: item['query'] ?? '',
    })),
  };
  return merged;
}
