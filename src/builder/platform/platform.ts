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
  /** 快手 */
  ks = 'ks',
  /** 小红书 */
  xhs = 'xhs',
  /** 飞书（宿主命名空间沿用字节的 tt，见 fs/fs-platform.ts） */
  fs = 'fs',
  /** 这个属性只会在内部被使用 */
  library = 'library',
}

/**
 * 自定义 tabBar 的平台事实。
 *
 * 产物目录名和开关字段都是平台写死的，而且各平台并不一致：微信系（wx / qq / jd）
 * 是 `custom-tab-bar/index` + `tabBar.custom`，支付宝是 `customize-tab-bar/index`
 * + `tabBar.customize`。所以只能由平台声明，定死在构建器里就会在另一个平台上
 * 产出一个没人加载的目录。undefined = 该平台没有自定义 tabBar。
 */
export interface CustomTabbarSpec {
  /** 平台写死的产物目录（产物落这里才算自定义 tabBar） */
  dir: string;
  /** app.json 里开启它的字段 */
  flag: 'custom' | 'customize';
}

export class BuildPlatform {
  packageName!: string;
  globalObject!: string;
  globalVariablePrefix!: string;
  fileExtname!: PlatformFileExtname;
  importTemplate!: string;
  /** 自定义 tabBar，不声明即该平台不支持 */
  customTabbar?: CustomTabbarSpec;
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
