import { Injectable } from 'static-injector';
import { TemplateTransformBase } from './template-transform-strategy/transform.base';
import { PlatformFileExtname } from './type';

export enum PlatformType {
  wx = 'wx',
  zj = 'zj',
  jd = 'jd',
  bdzn = 'bdzn',
  zfb = 'zfb',
  qq = 'qq',
  dd = 'dd',
  /** 这个属性只会在内部被使用 */
  library = 'library',
}
@Injectable()
export class BuildPlatform {
  packageName!: string;
  globalObject!: string;
  globalVariablePrefix!: string;
  fileExtname!: PlatformFileExtname;
  importTemplate!: string;
  constructor(public templateTransform: TemplateTransformBase) {
    this.templateTransform.init();
  }
}
