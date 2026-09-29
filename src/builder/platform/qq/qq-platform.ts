import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform } from '../platform';

export class QqBuildPlatform extends BuildPlatform {
  packageName = 'qq';
  globalObject = 'qq';
  globalVariablePrefix = 'qq.__window';
  fileExtname = {
    style: '.qss',
    logic: '.js',
    content: '.qml',
    wxs: '.qs',
    contentTemplate: '.qml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    qq.__global = qq.__window = obj;`;
}
