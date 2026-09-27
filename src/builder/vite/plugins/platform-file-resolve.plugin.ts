import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'vite';
import { PlatformType } from '../../platform/platform';

/** 参与平台变体替换的扩展名 */
const RESOLVABLE_EXTS = ['.ts', '.tsx', '.js', '.mts', '.mjs'];

/**
 * 文件级条件编译：`foo.ts` + `foo.<platform>.ts` → 平台构建优先取变体。
 *
 * 与 define 布尔常量互补：小分支用 `__MP_WX__`，整文件差异用后缀
 * （等价 uni-app 的 `index.mp-weixin.vue`，但走标准 resolve 钩子，
 * 不碰源码文本）。
 *
 * 规则：
 *  - 只处理相对路径 / 绝对路径 import（bare specifier 属包解析，不动）
 *  - 请求本身已带平台后缀时直接放行（防自替换死循环）
 *  - 变体不存在时维持原解析结果，行为零变化
 */
export function platformFileResolvePlugin(options: {
  platform: PlatformType;
}): Plugin {
  const suffix = `.${options.platform}`;
  return {
    name: 'mini-program:platform-file-resolve',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!importer || source.startsWith('\0') || source.startsWith('#')) {
        return null;
      }
      const isRelative = source.startsWith('./') || source.startsWith('../');
      if (!isRelative && !path.isAbsolute(source)) {
        return null;
      }
      // 请求已指向平台变体（foo.wx / foo.wx.ts），放行避免循环
      if (source.endsWith(suffix) || source.includes(`${suffix}.`)) {
        return null;
      }
      const resolved = await this.resolve(source, importer, {
        skipSelf: true,
      });
      if (!resolved || resolved.external) {
        return null;
      }
      const ext = path.extname(resolved.id);
      if (!RESOLVABLE_EXTS.includes(ext)) {
        return null;
      }
      const variant = `${resolved.id.slice(0, -ext.length)}${suffix}${ext}`;
      if (variant !== resolved.id && fs.existsSync(variant)) {
        return variant;
      }
      return null;
    },
  };
}
