import { join, normalize, virtualFs } from '@angular-devkit/core';
import {
  MyTestProjectHost,
  describeBuilder,
} from '../../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../../test/util/file';
import { memoize } from '../../../test/util/memoize';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

/**
 * project 配置文件的构建集成验证：
 *  - 内置默认值打底，用户文件里有的按文件
 *  - appid 缺省值、condition 生成（开关）
 *  - project.private.config.json 永远原样拷贝
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupFixture = async () => {
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
    return { root, myTestProjectHost };
  };

  const write = async (rel: string, content: string) => {
    await harness.host
      .write(
        join(harness.host.root(), rel),
        virtualFs.stringToFileBuffer(content),
      )
      .toPromise();
  };

  const readOutput = async (p: string) =>
    virtualFs.fileBufferToString(
      await harness.host.read(join(harness.host.root(), p)).toPromise(),
    );

  const assetsWithout = (glob: string) =>
    (DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>).filter(
      (a) => a.glob !== glob,
    );

  const build = (outputPath: string, extra: Record<string, unknown> = {}) =>
    harness.useTarget('build', {
      tsConfig: 'src/tsconfig.app.json',
      outputPath,
      pages: DEFAULT_ANGULAR_CONFIG.pages,
      assets: DEFAULT_ANGULAR_CONFIG.assets,
      platform: PlatformType.wx,
      sourceMap: false,
      ...extra,
    } as never);

  /**
   * 有用户文件的一族：默认值打底 / 静态优先于 projectConfig 选项 / private 原样拷，
   * 三条都是同一次构建的不同侧面。静态那份的 appid 与 jsonc 里的不一样，所以
   * 「产物里是静态那份的 appid」这一个断言同时钉住了两条优先级。
   */
  const privateConfig = { compileHotReLoad: true, miniprogramRoot: 'x/' };
  const loadWithUserFile = memoize(async () => {
    await setupFixture();
    await write(
      'src/project.config.json',
      JSON.stringify({ appid: 'wx-custom-appid', setting: { es6: true } }),
    );
    await write(
      'src/project.config.jsonc',
      JSON.stringify({ appid: 'from-option', projectname: 'demo' }),
    );
    await write(
      'src/project.private.config.json',
      JSON.stringify(privateConfig),
    );
    build('dist/vite-project-merge', {
      assets: [
        ...(DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>),
        { glob: 'project.private.config.json', input: './src', output: './' },
      ],
      projectConfig: 'src/project.config.jsonc',
    });
    const result = await harness.executeOnce();
    if (!result.result?.success) {
      const errLogs = (result.logs || [])
        .filter((l: { level: string }) => l.level === 'error')
        .map((l: { message?: string }) => String(l.message));
      console.log('PROJECT_ERR>>>' + errLogs.join(' ~~ ').slice(0, 4000));
    }
    expect(result.result?.success).toBeTruthy();

    return {
      project: JSON.parse(
        await readOutput('dist/vite-project-merge/project.config.json'),
      ) as Record<string, unknown>,
      privateText: await readOutput(
        'dist/vite-project-merge/project.private.config.json',
      ),
    };
  });

  /**
   * 没用户文件的一族：appid 缺省值与 deriveCondition。deriveCondition 只是往产物里多写一个
   * condition，不影响 appid / compileType；「不开关时不生成 condition」由 mp-config.spec 在单元层面钉住。
   */
  const loadWithoutUserFile = memoize(async () => {
    await setupFixture();
    build('dist/vite-project-default', {
      assets: assetsWithout('project.config.json'),
      deriveCondition: true,
    });
    const result = await harness.executeOnce();
    expect(result.result?.success).toBeTruthy();

    return JSON.parse(
      await readOutput('dist/vite-project-default/project.config.json'),
    ) as {
      appid: string;
      compileType: string;
      condition: { miniprogram: { list: Array<{ pathName: string }> } };
    };
  });

  describe('vite: project 配置', () => {
    it('内置默认值打底，用户文件里有的按文件', async () => {
      const { project } = await loadWithUserFile();
      expect(project.appid).toBe('wx-custom-appid');
      expect(project.setting).toEqual({ es6: true });
      // 用户没写的字段由默认值补上
      expect(project.compileType).toBe('miniprogram');
    }, 300000);

    it('没有用户文件时也能出一个可打开的 project 配置（appid 缺省值）', async () => {
      const project = await loadWithoutUserFile();
      expect(project.appid).toBe('touristappid');
      expect(project.compileType).toBe('miniprogram');
    }, 300000);

    it('deriveCondition 打开后按页面生成调试启动项', async () => {
      const project = await loadWithoutUserFile();
      expect(project.condition.miniprogram.list.length).toBe(
        ALL_PAGE_NAME_LIST.length,
      );
      expect(project.condition.miniprogram.list[0].pathName).toContain(
        'pages/',
      );
    }, 300000);

    it('project.private.config.json 原样拷贝，不参与合并', async () => {
      const { privateText } = await loadWithUserFile();
      expect(JSON.parse(privateText)).toEqual(privateConfig);
    }, 300000);

    it('projectConfig 选项与静态文件合并，静态优先', async () => {
      const { project } = await loadWithUserFile();
      // jsonc 里写的是 from-option，产物里是静态那份的值 => 静态优先
      expect(project.appid).toBe('wx-custom-appid');
      // 静态里没写的字段从选项补进来
      expect(project.projectname).toBe('demo');
    }, 300000);
  });
});
