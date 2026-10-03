import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform, type CustomTabbarSpec } from '../platform';

export class JdBuildPlatform extends BuildPlatform {
  packageName = 'jd';
  customTabbar: CustomTabbarSpec = { dir: 'custom-tab-bar', flag: 'custom' };

  globalObject = 'jd';
  globalVariablePrefix = 'jd.__window';
  fileExtname = {
    style: '.jxss',
    logic: '.js',
    content: '.jxml',
    wxs: '.jds',
    contentTemplate: '.jxml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    jd.__global = jd.__window = obj;`;
}
