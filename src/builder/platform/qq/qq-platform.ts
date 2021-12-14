import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { QqTransform } from './qq.transform';

@Injectable()
export class QqBuildPlatform extends BuildPlatform {
  packageName = 'qq';
  globalObject = 'qq';
  globalVariablePrefix = 'qq.__window';
  fileExtname = {
    style: '.qss',
    logic: '.js',
    content: '.qml',
    contentTemplate: '.qml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    qq.__global = qq.__window = obj;`;
  constructor(public templateTransform: QqTransform) {
    super(templateTransform);
  }
}
