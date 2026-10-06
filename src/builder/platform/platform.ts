import { inject } from 'static-injector';
import type { MpConfigObject } from '../vite/config-schema';
import type { MpSubPackageKey } from '../vite/merge-config';
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

/**
 * 平台对配置文件的影响，全部写成数据，不在构建器里写 if。
 *
 * 平台之间的差别（文件名、分包 key 的写法、字段改名）由平台自己声明，
 * 构建器只负责按声明输出。这里只声明「当前平台应该怎么写」，
 * 不做跨平台翻译——把 wx 的配置翻成 zfb 的配置是另一个量级的事，
 * 出错还极难排查。
 */
export interface MpPlatformConfig {
  /** project 配置文件名：微信系 project.config.json / 支付宝 mini.project.json / 百度 project.swan.json */
  projectFilename?: string;
  /** 用户覆盖文件的查找顺序（排在 projectFilename 之前，先命中先用） */
  projectOverrides?: string[];
  /** 分包列表在这个平台叫什么 key */
  subPackageKey?: MpSubPackageKey;
  /** project 配置的内置默认值（用户文件里有的按文件，没有的补默认） */
  projectDefaults?: () => MpConfigObject;
  /**
   * 这个平台支持哪些能力。
   *
   * 只有显式写 `false` 才参与校验：各家字段一直在加，「列出来才允许」会随平台
   * 更新不断漏，表现成「新字段写了但输出里没有」，最难查。
   */
  capabilities?: MpConfigCapabilities;
  /** app 配置输出前按平台改写（字段改名、写法转换） */
  normalizeAppJson?: (app: MpConfigObject) => MpConfigObject;
  /** project 配置输出前按平台改写 */
  normalizeProjectJson?: (project: MpConfigObject) => MpConfigObject;
}

/** 能力开关：app.json 里出现平台不支持的字段就是配错了 */
export interface MpConfigCapabilities {
  subpackages?: boolean;
  independentSubpackages?: boolean;
  workers?: boolean;
  darkmode?: boolean;
  customTabbar?: boolean;
}

/** 能力名 → app.json 里对应的字段（分包两种写法都算） */
const CAPABILITY_KEYS: Record<keyof MpConfigCapabilities, string[]> = {
  subpackages: ['subpackages', 'subPackages'],
  independentSubpackages: ['subpackages', 'subPackages'],
  workers: ['workers'],
  darkmode: ['darkmode', 'darkMode'],
  customTabbar: ['tabBar'],
};

/**
 * 平台不支持却被写进 app 配置的字段，返回可读的错。
 *
 * `customTabbar` 看的是 `tabBar` 里的自定义开关（字段名由平台给），
 * 其余按能力名对应的字段判定。
 */
export function findUnsupportedCapabilities(
  config: MpConfigObject,
  platform: BuildPlatform,
): string[] {
  const capabilities = platform.mpConfig?.capabilities;
  if (!capabilities) {
    return [];
  }
  const errors: string[] = [];
  for (const [name, supported] of Object.entries(capabilities)) {
    if (supported !== false) {
      continue;
    }
    const keys = CAPABILITY_KEYS[name as keyof MpConfigCapabilities];
    const hit = keys.find((key) => key in config);
    if (!hit) {
      continue;
    }
    if (name === 'customTabbar') {
      const tabBar = config['tabBar'];
      const flag = platform.customTabbar?.flag;
      const on =
        tabBar && typeof tabBar === 'object'
          ? (tabBar as MpConfigObject)[flag ?? 'custom']
          : undefined;
      if (on) {
        errors.push(
          `${platform.packageName} 平台没有自定义 tabBar，但 app 配置里开了 tabBar.${flag ?? 'custom'}`,
        );
      }
      continue;
    }
    if (name === 'independentSubpackages') {
      const list = config[hit];
      const independent = Array.isArray(list)
        ? list.some((item) => {
            return (
              typeof item === 'object' &&
              item !== null &&
              !!(item as MpConfigObject).independent
            );
          })
        : false;
      if (independent) {
        errors.push(
          `${platform.packageName} 平台不支持独立分包，但 app 配置里有 independent: true`,
        );
      }
      continue;
    }
    errors.push(
      `${platform.packageName} 平台不支持 ${hit}，请从 app 配置里删掉`,
    );
  }
  return errors;
}

export class BuildPlatform {
  packageName!: string;
  globalObject!: string;
  globalVariablePrefix!: string;
  fileExtname!: PlatformFileExtname;
  importTemplate!: string;
  /** 自定义 tabBar，不声明即该平台不支持 */
  customTabbar?: CustomTabbarSpec;
  /** 配置文件相关的平台事实（文件名、分包 key、字段改写） */
  mpConfig?: MpPlatformConfig;
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
