import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform, type CustomTabbarSpec } from '../platform';

export class WxBuildPlatform extends BuildPlatform {
  packageName = 'wx';
  customTabbar: CustomTabbarSpec = { dir: 'custom-tab-bar', flag: 'custom' };

  globalObject = 'wx';
  globalVariablePrefix = 'wx.__window';
  fileExtname = {
    style: '.wxss',
    logic: '.js',
    content: '.wxml',
    wxs: '.wxs',
    contentTemplate: '.wxml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    wx.__global = wx.__window = obj;`;
}
