import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { ZfbTransform } from './zfb.transform';

@Injectable()
export class ZfbBuildPlatform extends BuildPlatform {
  packageName = 'zfb';
  globalObject = 'my';
  globalVariablePrefix = 'my.__window';
  fileExtname = {
    style: '.acss',
    logic: '.js',
    content: '.axml',
    contentTemplate: '.axml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    my.__global = my.__window = obj;`;
  constructor(public templateTransform: ZfbTransform) {
    super(templateTransform);
  }
}
