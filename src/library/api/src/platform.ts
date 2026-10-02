import { InjectionToken } from '@angular/core';
import { MpPlatform } from './types';

/**
 * 运行时平台探测。
 *
 * 构建期 vite define 会把 `miniProgramPlatform` 替换成平台全局对象名的
 * 字符串字面量（见 builder/vite/index.ts buildPlatformDefine），
 * 所以正常情况下零成本拿到平台。define 缺席时（单测 / 非常规环境）
 * 退化为对 globalThis 的特征嗅探。
 */
declare const miniProgramPlatform: MpPlatform | undefined;

export function detectMpPlatform() {
  if (typeof miniProgramPlatform !== 'undefined') {
    return miniProgramPlatform;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis;
  if (g.dd) {
    return 'dd';
  }
  if (g.my) {
    return 'my';
  }
  if (g.swan) {
    return 'swan';
  }
  if (g.tt) {
    return 'tt';
  }
  if (g.jd) {
    return 'jd';
  }
  if (g.qq) {
    return 'qq';
  }
  if (g.ks) {
    return 'ks';
  }
  if (g.xhs) {
    return 'xhs';
  }
  return 'wx';
}

/** root 单例平台标识；测试里可 override 以模拟任意平台 */
export const MP_PLATFORM = new InjectionToken<MpPlatform>('MP_PLATFORM', {
  providedIn: 'root',
  factory: () => detectMpPlatform(),
});
