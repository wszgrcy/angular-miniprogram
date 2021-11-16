import * as path from 'path';
import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { WxTransform } from '../template-transform-strategy/wx.transform';

@Injectable()
export class WxBuildPlatform extends BuildPlatform {
  globalObject = 'wx';
  globalVariablePrefix = 'wx.__window';
  contextPrefix = 'ctx.originVar';
  fileExtname = {
    style: '.wxss',
    logic: '.js',
    content: '.wxml',
    contentTemplate: '.wxml',
  };
  importTemplate = path.resolve(__dirname, './template/app-template.js');
  constructor(public templateTransform: WxTransform) {
    super(templateTransform);
  }
}
