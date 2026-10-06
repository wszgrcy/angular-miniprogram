import { join, normalize } from '@angular-devkit/core';
import { Injector } from 'static-injector';
import {
  MyTestProjectHost,
  describeBuilder,
} from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
  TEST_LIBRARY_COMPONENT_LIST,
} from '../../test/util/file';
import { executeOnceShared } from '../../test/util/shared-build';
// 主测试链路已切到 Vite builder（webpack 链路待删除）
import { LIBRARY_OUTPUT_ROOTDIR } from './library';
import { BuildPlatform, PlatformType } from './platform/platform';
import { getBuildPlatformInjectConfig } from './platform/platform-inject-config';
import { runViteBuilder as runBuilder } from './vite';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  sourceMap: false,
};

/**
 * 全量构建的冒烟用例：跑通「页面 + 组件 + 库」整条链路，并核对产物扩展名。
 *
 * ## 为什么只跑 wx 和 zfb
 *
 * 十家平台以前各构建一次，一次 2s，光这个文件就 21s。但每条用例真正断言的
 * 只有两件事：构建没报错、产物扩展名对得上（`app.wxss` / `self.wxml` /
 * 库组件的 `.qml` `.axml` …）。而「每家平台的 globalObject / 指令前缀 /
 * 四种产物扩展名」已经被 `platform/platform-registry.spec.ts` 逐字钉死在
 * 一张表里（十家 1ms 跑完），构建侧的平台差异（define、`.wx.ts` 变体、
 * 死分支 DCE）另有 `vite/platform-flags.build.spec.ts` 覆盖。
 *
 * 所以这里留两个代表：wx 是基准，zfb 是差异最大的一家
 * （全局对象 `my`、前缀 `a`、`.axml/.acss/.sjs`）。
 * 新增平台若带来了这两张表没覆盖的行为，再往数组里加。
 */
const SMOKE_PLATFORMS = [PlatformType.wx, PlatformType.zfb];

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-dev', () => {
    for (const platform of SMOKE_PLATFORMS) {
      it(`运行${PlatformType[platform]}`, async () => {
        const root = harness.host.root();
        const myTestProjectHost = new MyTestProjectHost(harness.host);
        const list = await myTestProjectHost.getFileList(
          normalize(join(root, 'src', '__pages')),
        );
        list.push(
          ...(await myTestProjectHost.getFileList(
            normalize(join(root, 'src', '__components')),
          )),
        );
        await myTestProjectHost.importPathRename(list);
        await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
        await myTestProjectHost.moveDir(
          ALL_COMPONENT_NAME_LIST,
          '__components',
          'components',
        );
        await myTestProjectHost.addPageEntry(ALL_PAGE_NAME_LIST);

        const result = await executeOnceShared(harness, 'build', {
          ...angularConfig,
          platform,
        });
        expect(result).toBeTruthy();
        expect(result.error).toBeFalsy();
        // Vite 链路可能不产生日志，logs[0] 会是 undefined；
        // 本意是「构建没报错」，那就查全部而不是只看第一条。
        expect(
          result.logs.filter((l) => l.level === 'error').map((l) => l.value),
        ).toEqual([]);
        expect(result.result?.success).toBeTruthy();

        const injectList = getBuildPlatformInjectConfig(platform);
        const injector = Injector.create({ providers: injectList });
        const buildPlatform = injector.get(BuildPlatform);
        harness
          .expectFile(
            join(
              normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
              `app${buildPlatform.fileExtname.style}`,
            ),
          )
          .toExist();
        const libraryPath = join(
          normalize(DEFAULT_ANGULAR_CONFIG.outputPath),
          LIBRARY_OUTPUT_ROOTDIR,
          'test-library',
        );
        const librarySelfTemplateFile = harness.expectFile(
          join(libraryPath, `self${buildPlatform.fileExtname.contentTemplate}`),
        );
        librarySelfTemplateFile.toExist();
        librarySelfTemplateFile.content.toContain(`$$mp$$__self__$$`);
        TEST_LIBRARY_COMPONENT_LIST.forEach((item) => {
          const componentPath = join(libraryPath, item, item);
          harness
            .expectFile(componentPath + buildPlatform.fileExtname.logic)
            .toExist();
          harness
            .expectFile(
              componentPath + (buildPlatform.fileExtname.config || '.json'),
            )
            .toExist();
          harness
            .expectFile(componentPath + buildPlatform.fileExtname.content)
            .toExist();
        });
      });
    }
  });
});
