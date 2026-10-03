import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform, type CustomTabbarSpec } from '../platform';

export class ZfbBuildPlatform extends BuildPlatform {
  packageName = 'zfb';
  /** 支付宝的目录名和开关字段都和微信系不同，只能由平台自己声明 */
  customTabbar: CustomTabbarSpec = {
    dir: 'customize-tab-bar',
    flag: 'customize',
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
