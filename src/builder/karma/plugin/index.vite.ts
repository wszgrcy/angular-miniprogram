import { viteKarmaFrameworkFactory } from './karma-framework';
import launcher from '../plugin/launcher';

/**
 * Vite 链路的 karma 插件入口。
 *
 * karma 通过 `plugins: [require('...')]` 加载，要求导出形如
 *   { 'framework:<name>': ['factory', fn], 'launcher:<name>': ['type', cls] }
 *
 * framework 名字沿用 `@angular-devkit/build-angular`，这样
 * karma.conf.js 里 `frameworks: ['@angular-devkit/build-angular']` 不用改，
 * 只把 plugins 里 require 的文件从 `plugin/index` 换成 `plugin/index.vite`。
 *
 * launcher 直接复用 webpack 链路那份——它跟 bundler 无关，
 * 就是个占位（真实执行是微信开发者工具连回 socket）。
 */
module.exports = {
  'framework:@angular-devkit/build-angular': ['factory', viteKarmaFrameworkFactory],
  ...launcher,
};
