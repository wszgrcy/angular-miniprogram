import { getSystemPath, join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  MyTestProjectHost,
  describeBuilder,
} from '../../../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_KARMA_CONFIG,
} from '../../../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../../../test/util/file';
import { PlatformType } from '../../platform/platform';
import { getBuildPlatform } from '../../vite';
import { KarmaViteBuilderOptions, createKarmaViteConfig } from './index';

/**
 * createKarmaViteConfig 实际只用到 workspaceRoot / target.project /
 * getProjectMetadata，给个最小实现即可，不需要整个 architect context。
 */
function minimalContext(workspaceRoot: string) {
  return {
    workspaceRoot,
    target: { project: 'test', target: 'build', configuration: undefined },
    getProjectMetadata: async () => ({ root: '.', sourceRoot: 'src' }),
    logger: console,
  };
}

/**
 * Vite 打包 karma 测试产物的正确性。
 *
 * 只验**构建**，不起 karma server——真实跑测试要微信开发者工具连回来，
 * 容器里做不到。这里验的是「Vite 产出的测试 bundle 和 webpack 版等价」，
 * 具体是三个必须成立的编译期替换：
 *
 *   1. jasmine 全局（describe/it/expect…）被替换成 wx.__window.*
 *   2. KARMA_PORT / KARMA_CLIENT_CONFIG 被注入
 *   3. 组件模板注入（propertyChange）照常生效
 */
describeBuilder(
  () => {
    throw new Error('unused');
  },
  BROWSER_BUILDER_INFO,
  (harness) => {
    describe('karma-vite: 测试产物', () => {
      it('jasmine 全局替换 + karma 常量注入 + 模板注入', async () => {
        const root = harness.host.root();
        const host = new MyTestProjectHost(harness.host);
        const list = await host.getFileList(
          normalize(join(root, 'src', 'spec'))
        );
        list.push(
          ...(await host.getFileList(
            normalize(join(root, 'src', 'spec-component'))
          ))
        );
        await host.importPathRename(list);

        const buildPlatform = getBuildPlatform(PlatformType.wx);
        const outDir = path.join(
          // 必须用 getSystemPath，不能用 .toString()。
          // host.root() 是 devkit 的虚拟 Path，Windows 上形态是
          // `/C:/code/...`（posix 化，盘符前带斜杠），
          // .toString() 会把这个虚拟形态原样带出去，下游 path.resolve
          // 把它当「无盘符绝对路径」重新补盘 -> C:\C\code\...
          // getSystemPath -> asWindowsPath 才是官方还原：/C:/x -> C:\x
          getSystemPath(harness.host.root()),
          'dist/karma-vite'
        );

        const config = await createKarmaViteConfig({
          karmaOptions: {
            ...(DEFAULT_ANGULAR_KARMA_CONFIG as KarmaViteBuilderOptions),
            outputPath: 'dist/karma-vite',
            platform: PlatformType.wx,
            port: 9876,
          },
          context: minimalContext(getSystemPath(harness.host.root())) as never,
          buildPlatform,
        });

        const vite = await import('vite');
        await vite.build(config);

        // 收集所有 js
        const jsFiles: string[] = [];
        const walk = (dir: string) => {
          if (!fs.existsSync(dir)) {
            return;
          }
          for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
              walk(full);
            } else if (e.name.endsWith('.js')) {
              jsFiles.push(full);
            }
          }
        };
        walk(outDir);
        expect(jsFiles.length).toBeGreaterThan(0);

        const all = jsFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

        // 1. jasmine 全局必须被替换成 wx.__window.*
        //    只断言 fixture spec 里真正用到的那几个
        //    （现有 spec 只用了 describe / it / beforeEach / jasmine，
        //    断言没用过的会假失败）
        expect(all).toContain('wx.__window.describe');
        expect(all).toContain('wx.__window.it');
        expect(all).toContain('wx.__window.beforeEach');
        expect(all).toContain('wx.__window.jasmine');

        // 不该有未替换的裸全局调用——但只能查 spec 自己的产物。
        // jasmine-core 自己就定义了 describe / it 这些函数，
        // 拿整个 bundle 去比会把 jasmine-core 的定义当成「没替换」，误报。
        const specOnly = jsFiles
          .filter((f) => f.includes(`${path.sep}specs${path.sep}`))
          .map((f) => fs.readFileSync(f, 'utf8'))
          .join('\n');
        expect(specOnly).not.toBe('');
        expect(/(^|[^.\w])describe\s*\(/m.test(specOnly)).toBeFalsy();
        expect(/(^|[^.\w])beforeEach\s*\(/m.test(specOnly)).toBeFalsy();

        // 2. karma 常量注入
        expect(all).toContain('9876');

        // 3. 模板注入照常生效
        expect(all).toContain('propertyChange');
      }, 300000);
    });
  }
);
