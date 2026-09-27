import { viteKarmaFrameworkFactory } from '../vite/karma-framework';
import launcher from '../plugin/launcher';

/**
 * Vite 链路的 karma 插件入口。
 *
 * karma 通过 `plugins: [require('...')]` 加载，要求导出形如
 *   { 'framework:<name>': ['factory', fn], 'launcher:<name>': ['type', cls] }
 *
 * framework 名字沿用 `@angular-devkit/build-angular`，这样
 * karma.conf.js 里 `frameworks: ['@angular-devkit/build-angular']` 不用改，
 * plugins 里 require 本文件即可（webpack 链路已移除，不再需要区分 .vite 后缀）。
 *
 * launcher 与 bundler 无关，直接复用。
 * 就是个占位（真实执行是微信开发者工具连回 socket）。
 */
module.exports = {
  'framework:@angular-devkit/build-angular': ['factory', viteKarmaFrameworkFactory],
  ...launcher,
};
