import { Injector } from 'static-injector';
import { BuildPlatform, PlatformType } from './platform';
import { getBuildPlatformInjectConfig } from './platform-inject-config';
import { TemplateTransformBase } from './template-transform-strategy/transform.base';
import { WxTransformLike } from './template-transform-strategy/wx-like/wx-transform.base';

/**
 * 平台注册表：每加一家都要同时补齐的四张表，漏一处不会编译报错，
 * 只会在构建或运行时以「未能匹配到相关平台」「xxx is not a function」
 * 的形式冒出来，所以这里用一张表统一钉死。
 *
 * `globalObject` 是 vite define 里 `wx -> <global>` 的来源，写错等于
 * 整个运行时调不到任何宿主 API；`directivePrefix` 写错则模板能产出、
 * 小程序读不到指令，页面白屏且不报错。这两列必须逐字核对。
 */
interface PlatformExpectation {
  type: PlatformType;
  packageName: string;
  globalObject: string;
  style: string;
  content: string;
  wxs: string;
  directivePrefix: string;
}

const PLATFORMS: PlatformExpectation[] = [
  {
    type: PlatformType.wx,
    packageName: 'wx',
    globalObject: 'wx',
    style: '.wxss',
    content: '.wxml',
    wxs: '.wxs',
    directivePrefix: 'wx',
  },
  {
    type: PlatformType.qq,
    packageName: 'qq',
    globalObject: 'qq',
    style: '.qss',
    content: '.qml',
    wxs: '.qs',
    directivePrefix: 'qq',
  },
  {
    type: PlatformType.zfb,
    packageName: 'zfb',
    globalObject: 'my',
    style: '.acss',
    content: '.axml',
    wxs: '.sjs',
    directivePrefix: 'a',
  },
  {
    type: PlatformType.dd,
    packageName: 'dd',
    globalObject: 'dd',
    style: '.acss',
    content: '.axml',
    wxs: '.sjs',
    directivePrefix: 'a',
  },
  {
    type: PlatformType.bdzn,
    packageName: 'bd',
    globalObject: 'swan',
    style: '.css',
    content: '.swan',
    wxs: '.sjs',
    directivePrefix: 's',
  },
  {
    type: PlatformType.zj,
    packageName: 'zjtd',
    globalObject: 'tt',
    style: '.ttss',
    content: '.ttml',
    wxs: '.sjs',
    directivePrefix: 'tt',
  },
  {
    type: PlatformType.jd,
    packageName: 'jd',
    globalObject: 'jd',
    style: '.jxss',
    content: '.jxml',
    wxs: '.jds',
    directivePrefix: 'jd',
  },
  {
    type: PlatformType.ks,
    packageName: 'ks',
    globalObject: 'ks',
    style: '.css',
    content: '.ksml',
    wxs: '.sjs',
    directivePrefix: 'ks',
  },
  {
    type: PlatformType.xhs,
    packageName: 'xhs',
    globalObject: 'xhs',
    style: '.css',
    content: '.xhsml',
    wxs: '.sjs',
    directivePrefix: 'xhs',
  },
  // 飞书语法与抖音同源，宿主命名空间沿用 tt，差异只在产物扩展名与条件编译常量
  {
    type: PlatformType.fs,
    packageName: 'fs',
    globalObject: 'tt',
    style: '.ttss',
    content: '.ttml',
    wxs: '.sjs',
    directivePrefix: 'tt',
  },
];

function resolve(platform: PlatformType) {
  const injector = Injector.create({
    providers: [...getBuildPlatformInjectConfig(platform)],
  });
  return {
    buildPlatform: injector.get(BuildPlatform),
    transform: injector.get(TemplateTransformBase) as WxTransformLike,
  };
}

describe('平台注册表', () => {
  it('除内部 library 外，每个 PlatformType 都有期望条目', () => {
    const covered = PLATFORMS.map((p) => p.type).sort();
    const declared = Object.values(PlatformType)
      .filter((t) => t !== PlatformType.library)
      .sort();
    expect(covered).toEqual(declared);
  });

  PLATFORMS.forEach((expectation) => {
    describe(expectation.type, () => {
      const { buildPlatform, transform } = resolve(expectation.type);

      it('packageName / globalObject / 产物扩展名', () => {
        expect(buildPlatform.packageName).toBe(expectation.packageName);
        expect(buildPlatform.globalObject).toBe(expectation.globalObject);
        expect(buildPlatform.globalVariablePrefix).toBe(
          `${expectation.globalObject}.__window`,
        );
        expect(buildPlatform.fileExtname.style).toBe(expectation.style);
        expect(buildPlatform.fileExtname.content).toBe(expectation.content);
        expect(buildPlatform.fileExtname.contentTemplate).toBe(
          expectation.content,
        );
        expect(buildPlatform.fileExtname.wxs).toBe(expectation.wxs);
      });

      it('指令前缀与 transform 一致，且 importTemplate 挂在同一个全局上', () => {
        expect(transform.directivePrefix).toBe(expectation.directivePrefix);
        expect(buildPlatform.importTemplate).toContain(
          `${expectation.globalObject}.__global = ${expectation.globalObject}.__window = obj;`,
        );
      });
    });
  });
});
