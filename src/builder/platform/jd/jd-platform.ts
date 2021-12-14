import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { JdTransform } from './jd.transform';

@Injectable()
export class JdBuildPlatform extends BuildPlatform {
  packageName = 'jd';
  globalObject = 'jd';
  globalVariablePrefix = 'jd.__window';
  fileExtname = {
    style: '.jxss',
    logic: '.js',
    content: '.jxml',
    contentTemplate: '.jxml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    jd.__global = jd.__window = obj;`;
  constructor(public templateTransform: JdTransform) {
    super(templateTransform);
  }
}
