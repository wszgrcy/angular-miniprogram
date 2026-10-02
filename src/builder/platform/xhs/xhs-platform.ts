import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform } from '../platform';
/** 小红书小程序适配 */
export class XhsBuildPlatform extends BuildPlatform {
  packageName = 'xhs';
  globalObject = 'xhs';
  globalVariablePrefix = 'xhs.__window';
  fileExtname = {
    style: '.css',
    logic: '.js',
    content: '.xhsml',
    wxs: '.sjs',
    contentTemplate: '.xhsml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    xhs.__global = xhs.__window = obj;`;
}
