import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { BdZnTransform } from './bdzn.transform';

@Injectable()
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
  constructor(public templateTransform: BdZnTransform) {
    super(templateTransform);
  }
}
