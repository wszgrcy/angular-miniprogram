/**
 * project 配置文件的内置默认值。只在用户没提供文件时打底，或补进用户文件里没写的字段；
 * 用户写了的一律按文件。这些值是「开发者工具打开这个目录需要看到什么」：
 * 缺 `compileType` 工具会问一遍，缺 `appid` 直接不给开项目。
 *
 * `setting` 里那些 `es6` / `postcss` / `minified` 一律关着：产物已经由本构建器编到
 * CommonJS + 未压缩，工具再转一遍只会让构建产物和调试时看到的代码对不上。需要工具兜底的
 * 用户在自己的文件里打开即可。
 */

import type { MpConfigObject } from '../vite/merge-config';

/** 微信系（wx / qq / jd）以及沿用同一套 setting 的快手、小红书 */
export function wxStyleProjectDefaults(): MpConfigObject {
  return {
    description: '项目配置文件。',
    packOptions: { ignore: [] },
    setting: {
      urlCheck: false,
      es6: false,
      enhance: false,
      postcss: false,
      minified: false,
      minifyWXSS: false,
      newFeature: true,
    },
    compileType: 'miniprogram',
    libVersion: '',
    appid: 'touristappid',
    projectname: '',
  };
}

/** 字节系（zj / fs）：setting 形状与微信系一致，只是工具名不同 */
export function ttStyleProjectDefaults(): MpConfigObject {
  return {
    setting: {
      urlCheck: false,
      es6: false,
      postcss: false,
      minified: false,
      newFeature: true,
    },
    appid: 'testAppId',
    projectname: '',
  };
}

/** 支付宝系（zfb / dd）：文件名是 mini.project.json，字段与微信系完全不同 */
export function alipayProjectDefaults(): MpConfigObject {
  return {
    appid: 'touristappid',
    format: 2,
    component2: true,
    enableAppxNg: true,
    axmlStrictCheck: false,
    enableDistFileMinify: false,
    enableParallelLoader: false,
    uploadExclude: [],
    assetsInclude: [],
  };
}

/** 百度（bdzn）：文件名是 project.swan.json，键名用连字符 */
export function baiduProjectDefaults(): MpConfigObject {
  return {
    appid: 'touristappid',
    projectname: '',
    host: 'baiduboxapp',
    setting: { urlCheck: false, autoAudits: false },
    'compilation-args': {
      common: {
        enhance: false,
        ignorePrefixCss: true,
        babelSetting: { ignore: [] },
      },
      selected: -3,
    },
  };
}
