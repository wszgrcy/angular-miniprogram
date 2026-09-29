import { inject } from 'static-injector';
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
export class BuildPlatform {
  packageName!: string;
  globalObject!: string;
  globalVariablePrefix!: string;
  fileExtname!: PlatformFileExtname;
  importTemplate!: string;
  /**
   * 具体实现由各平台的 provider 通过
   * `{ provide: TemplateTransformBase, useExisting: XxxTransform }` 绑定。
   * 放在基类注入而不是子类构造参数里，是为了避免子类字段初始化晚于 `super()`。
   */
  templateTransform = inject(TemplateTransformBase);

  constructor() {
    this.templateTransform.init();
  }
}
