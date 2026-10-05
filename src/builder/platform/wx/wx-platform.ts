import * as fs from 'fs-extra';
import * as path from 'path';
import { wxStyleProjectDefaults } from '../mp-project-defaults';
import {
  BuildPlatform,
  type CustomTabbarSpec,
  type MpPlatformConfig,
} from '../platform';

export class WxBuildPlatform extends BuildPlatform {
  packageName = 'wx';
  customTabbar: CustomTabbarSpec = { dir: 'custom-tab-bar', flag: 'custom' };

  mpConfig: MpPlatformConfig = {
    projectFilename: 'project.config.json',
    subPackageKey: 'subpackages',
    projectDefaults: wxStyleProjectDefaults,
    capabilities: {
      subpackages: true,
      independentSubpackages: true,
      workers: true,
      darkmode: true,
      customTabbar: true,
    },
  };

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
