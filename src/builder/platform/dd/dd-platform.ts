import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { DdTransform } from './dd.transform';

@Injectable()
export class DdBuildPlatform extends BuildPlatform {
  packageName = 'dd';
  globalObject = 'dd';
  globalVariablePrefix = 'dd.__window';
  fileExtname = {
    style: '.acss',
    logic: '.js',
    content: '.axml',
    contentTemplate: '.axml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    dd.__global = dd.__window = obj;`;
  constructor(public templateTransform: DdTransform) {
    super(templateTransform);
  }
}
