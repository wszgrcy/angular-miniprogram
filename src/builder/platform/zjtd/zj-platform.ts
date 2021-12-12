import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { ZjTransform } from './zj.transform';
/** 字节小程序适配 */
@Injectable()
export class ZjBuildPlatform extends BuildPlatform {
  packageName = 'zjtd';
  globalObject = 'tt';
  globalVariablePrefix = 'tt.__window';
  fileExtname = {
    style: '.ttss',
    logic: '.js',
    content: '.ttml',
    contentTemplate: '.ttml',
    config: '.json',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    tt.__global = tt.__window = obj;`;
  constructor(public templateTransform: ZjTransform) {
    super(templateTransform);
  }
}
