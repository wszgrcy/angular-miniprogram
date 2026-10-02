import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform } from '../platform';
/** 快手小程序适配 */
export class KsBuildPlatform extends BuildPlatform {
  packageName = 'ks';
  globalObject = 'ks';
  globalVariablePrefix = 'ks.__window';
  fileExtname = {
    style: '.css',
    logic: '.js',
    content: '.ksml',
    wxs: '.sjs',
    contentTemplate: '.ksml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    ks.__global = ks.__window = obj;`;
}
