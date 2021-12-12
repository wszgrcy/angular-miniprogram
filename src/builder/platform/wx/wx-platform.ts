import * as fs from 'fs-extra';
import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { WxTransform } from './wx.transform';

@Injectable()
export class WxBuildPlatform extends BuildPlatform {
  globalObject = 'wx';
  globalVariablePrefix = 'wx.__window';
  fileExtname = {
    style: '.wxss',
    logic: '.js',
    content: '.wxml',
    contentTemplate: '.wxml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    wx.__global = wx.__window = obj;`;
  constructor(public templateTransform: WxTransform) {
    super(templateTransform);
  }
}
