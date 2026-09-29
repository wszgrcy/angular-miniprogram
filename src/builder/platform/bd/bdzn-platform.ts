import * as fs from 'fs-extra';
import * as path from 'path';
import { BuildPlatform } from '../platform';

export class BdZnBuildPlatform extends BuildPlatform {
  packageName = 'bd';
  globalObject = 'swan';
  globalVariablePrefix = 'swan.__window';
  fileExtname = {
    style: '.css',
    logic: '.js',
    content: '.swan',
    contentTemplate: '.swan',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    swan.__global = swan.__window = obj;`;
}
