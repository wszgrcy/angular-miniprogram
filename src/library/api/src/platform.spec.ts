/* eslint-disable @typescript-eslint/no-explicit-any */
import { detectMpPlatform } from './platform';

/**
 * define 缺席时（单测 / 非常规环境）靠全局对象特征嗅探平台。
 *
 * 每加一家都要在这里补一条：漏了不会报错，只会静默回退成 'wx'，
 * 于是协议表、系统信息增强全部按微信口径跑，症状是「某些字段莫名不对」。
 */
describe('detectMpPlatform 全局对象嗅探', () => {
  const GLOBAL_KEYS = ['dd', 'my', 'swan', 'tt', 'jd', 'qq', 'ks', 'xhs'];

  afterEach(() => {
    GLOBAL_KEYS.forEach((key) => {
      delete (globalThis as any)[key];
    });
  });

  it.each(GLOBAL_KEYS)('%s 命中自身', (key) => {
    (globalThis as any)[key] = {};
    expect(detectMpPlatform()).toBe(key);
  });

  it('一个都没有时回退 wx', () => {
    expect(detectMpPlatform()).toBe('wx');
  });
});
