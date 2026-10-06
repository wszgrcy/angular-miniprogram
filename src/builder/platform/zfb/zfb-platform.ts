import * as fs from 'fs-extra';
import * as path from 'path';
import {
  alipayNormalizeAppJson,
  alipayNormalizeProjectJson,
} from '../mp-config-normalize';
import { alipayProjectDefaults } from '../mp-project-defaults';
import {
  BuildPlatform,
  type CustomTabbarSpec,
  type MpPlatformConfig,
} from '../platform';

export class ZfbBuildPlatform extends BuildPlatform {
  packageName = 'zfb';
  /** 支付宝的目录名和开关字段都和微信系不同，只能由平台自己声明 */
  customTabbar: CustomTabbarSpec = {
    dir: 'customize-tab-bar',
    flag: 'customize',
  };

  mpConfig: MpPlatformConfig = {
    projectFilename: 'mini.project.json',
    projectOverrides: ['project.my.json'],
    subPackageKey: 'subPackages',
    projectDefaults: alipayProjectDefaults,
    capabilities: {
      subpackages: true,
      independentSubpackages: true,
      workers: true,
      darkmode: true,
      customTabbar: true,
    },
    normalizeAppJson: alipayNormalizeAppJson,
    normalizeProjectJson: alipayNormalizeProjectJson,
  };

  globalObject = 'my';
  globalVariablePrefix = 'my.__window';
  fileExtname = {
    style: '.acss',
    logic: '.js',
    content: '.axml',
    wxs: '.sjs',
    contentTemplate: '.axml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    my.__global = my.__window = obj;`;
}
