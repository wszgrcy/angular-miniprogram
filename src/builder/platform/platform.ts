import { Injectable } from 'static-injector';
import { TemplateTransformBase } from './template-transform-strategy/transform.base';

export enum PlatformType {
  wx = 'wx',
}
@Injectable()
export class BuildPlatform {
  globalObject!: string;
  globalVariablePrefix!: string;
  contextPrefix!: string;
  fileExtname!: {
    style: string;
    logic: string;
    content: string;
    contentTemplate: string;
    config?: string;
  };
  importTemplate!: string;
  constructor(public templateTransform: TemplateTransformBase) {}
}
