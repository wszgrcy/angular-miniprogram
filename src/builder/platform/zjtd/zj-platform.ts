import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform } from '../platform';
/** 字节小程序适配 */
export class ZjBuildPlatform extends BuildPlatform {
  packageName = 'zjtd';
  globalObject = 'tt';
  globalVariablePrefix = 'tt.__window';
  fileExtname = {
    style: '.ttss',
    logic: '.js',
    content: '.ttml',
    wxs: '.sjs',
    contentTemplate: '.ttml',
    config: '.json',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    tt.__global = tt.__window = obj;`;
}
