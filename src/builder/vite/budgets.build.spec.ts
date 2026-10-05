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
 * budgets / statsJson 的构建集成验证。
 *
 * 判定逻辑本身在 plugins/budgets.spec.ts 里用假 bundle 钉死了，这里只验
 * 「插件真的挂上了、真的能决定构建成败」—— 判定对但没接线同样是零效果。
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
  };

  const assetsWithoutAppJson = (
    DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>
  ).filter((a) => a.glob !== 'app.json');

  const build = async (
    outputPath: string,
    overrides: Record<string, unknown>,
  ) => {
    harness.useTarget('build', {
      tsConfig: 'src/tsconfig.app.json',
      outputPath,
      pages: DEFAULT_ANGULAR_CONFIG.pages,
      assets: assetsWithoutAppJson,
      platform: PlatformType.wx,
      sourceMap: false,
      ...overrides,
    } as never);
    return harness.executeOnce();
  };

  const readOutput = async (p: string) =>
    virtualFs.fileBufferToString(
      await harness.host.read(join(harness.host.root(), p)).toPromise(),
    );

  const logsOf = (result: { logs?: readonly { message?: string }[] }) =>
    (result.logs || []).map((l) => String(l.message)).join(' ~~ ');

  const load = memoize(async () => {
    await setupFixture();
    const result = await build('dist/vite-stats-warn', {
      statsJson: true,
      budgets: [{ type: 'any', maximumWarning: '1kb' }],
    });
    return {
      success: result.result?.success,
      logs: logsOf(result),
      stats: JSON.parse(
        await readOutput('dist/vite-stats-warn/stats.json'),
      ) as { assets: { name: string; size: number }[] },
    };
  });

  it('statsJson 产出 stats.json（带各文件体积）', async () => {
    const { success, stats } = await load();
    expect(success).toBeTruthy();

    expect(stats.assets.some((a) => a.name.endsWith('-entry.js'))).toBe(true);
    // 无样式的组件会产出空 .wxss，size 允许为 0，但必须是数字
    expect(
      stats.assets.every((a) => Number.isFinite(a.size) && a.size >= 0),
    ).toBe(true);
    expect(stats.assets.reduce((sum, a) => sum + a.size, 0)).toBeGreaterThan(0);
    // stats.json 不参与自己的体积核算
    expect(stats.assets.some((a) => a.name === 'stats.json')).toBe(false);
  }, 300000);

  it('单文件超 maximumError → 构建失败', async () => {
    await setupFixture();
    const result = await build('dist/vite-budget-error', {
      budgets: [{ type: 'any', maximumError: '1kb' }],
    });
    expect(result.result?.success).toBeFalsy();
    expect(logsOf(result)).toContain('budgets');
  }, 300000);

  it('只配 maximumWarning → 构建成功但告警', async () => {
    const { success, logs } = await load();
    expect(success).toBeTruthy();
    expect(logs).toContain('exceeded maximum budget');
  }, 300000);
});
