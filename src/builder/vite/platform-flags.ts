import { PlatformType } from '../platform/platform';

/**
 * 条件编译（define 方案）。
 *
 * 不采用 uni-app 的 `#ifdef` 注释指令（预处理指令绕过类型系统，
 * IDE / lint 全部失效）。改用 bundler 的常量替换 + DCE：
 *
 *  - `__MP_PLATFORM__`：当前平台字符串（`"wx"` / `"zfb"` ...）
 *  - `__MP_WX__` / `__MP_ZFB__` / ...：布尔常量，当前平台为 true，
 *    其余为 false。`if (__MP_WX__) {...}` 的死分支在 esbuild/rollup
 *    常量折叠后被整体移除，零运行时开销。
 *
 * 文件级替换见 `plugins/platform-file-resolve.plugin.ts`
 * （`foo.ts` + `foo.wx.ts` → wx 平台优先取后者）。
 *
 * 用户工程需在 tsconfig 引入 `platform-flags.d.ts` 获得类型声明。
 */
export const PLATFORM_FLAG_NAMES: Record<PlatformType, string> = {
  [PlatformType.wx]: '__MP_WX__',
  [PlatformType.zj]: '__MP_ZJ__',
  [PlatformType.jd]: '__MP_JD__',
  [PlatformType.bdzn]: '__MP_BDZN__',
  [PlatformType.zfb]: '__MP_ZFB__',
  [PlatformType.qq]: '__MP_QQ__',
  [PlatformType.dd]: '__MP_DD__',
  [PlatformType.library]: '__MP_LIBRARY__',
};

/** 生成注入 Vite `define` 的平台常量表 */
export function platformConditionDefine(
  platform: PlatformType
): Record<string, string> {
  const define: Record<string, string> = {
    __MP_PLATFORM__: `"${platform}"`,
  };
  for (const [candidate, flag] of Object.entries(PLATFORM_FLAG_NAMES)) {
    define[flag] = candidate === platform ? 'true' : 'false';
  }
  return define;
}
