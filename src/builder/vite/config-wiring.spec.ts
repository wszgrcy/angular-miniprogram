import type { BuilderContext } from '@angular-devkit/architect';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PlatformType } from '../platform/platform';
import { createVitestViteConfig } from '../vitest/vite/index';
import { createMiniProgramViteConfig, getBuildPlatform, mpConfigWatchFiles } from './index';

/**
 * 两条构建链路对 `viteConfig` 的接线。
 *
 * 钩子本身的加载/应用在 `config-hook/index.spec.ts` 里已经验透了，这里只钉
 * 一件事：**两个 builder 组装完的配置确实经过了钩子**。所以直接调
 * `create*ViteConfig` 拿返回的 config，不跑 vite build。
 *
 * 工程夹具用 `test/hello-world-app`（只读），钩子文件放临时目录并用绝对路径
 * 引用，免得往夹具里落脏文件。
 */

const FIXTURE = path.resolve(__dirname, '../../../test/hello-world-app');

function makeContext(): { context: BuilderContext; logs: string[] } {
  const logs: string[] = [];
  const push =
    (level: string) =>
    (message: string) =>
      void logs.push(`${level}:${message}`);
  const logger = {
    info: push('info'),
    warn: push('warn'),
    error: push('error'),
    debug: push('debug'),
    verbose: push('verbose'),
  };
  return {
    context: {
      workspaceRoot: FIXTURE,
      currentDirectory: FIXTURE,
      target: { project: 'app', target: 'build' },
      logger,
      getProjectMetadata: async () =>
        ({ root: 'src', sourceRoot: 'src' }) as never,
      getBuilderNameForTarget: async () => 'angular-miniprogram:application',
      getTargetOptions: async () => ({}),
    } as unknown as BuilderContext,
    logs,
  };
}

let workspace = '';
beforeEach(() => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-vite-wiring-'));
});
afterEach(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

/** 往临时目录写钩子，返回绝对路径（选项也允许绝对路径） */
function writeHook(content: string): string {
  const abs = path.join(workspace, 'hook.ts');
  fs.writeFileSync(abs, content, 'utf8');
  return abs;
}

/** vite 的 PluginOption 是一堆形状的和，这里只关心「顶层有没有这个 name」 */
function hasPlugin(config: { plugins?: unknown }, name: string): boolean {
  const list = Array.isArray(config.plugins) ? config.plugins : [];
  return list.some(
    (p) => !!p && (p as { name?: string }).name === name,
  );
}

const MARKER_HOOK = `export default (config: any) => {
  config.define = { ...config.define, __FROM_HOOK__: '"1"' };
  config.plugins = [...(config.plugins || []), { name: 'spec-marker' }];
};`;

const appViteOptions = (viteConfig?: string) =>
  ({
    tsConfig: 'src/tsconfig.app.json',
    outputPath: 'dist/app',
    main: 'src/main.ts',
    platform: PlatformType.wx,
    pages: [{ glob: '**/*.entry.ts', input: './src/spec', output: 'pages' }],
    sourceMap: false,
    viteConfig,
  }) as unknown as Parameters<typeof createMiniProgramViteConfig>[0]['viteOptions'];

const vitestOptions = (viteConfig?: string) =>
  ({
    main: 'src/test.ts',
    tsConfig: 'src/tsconfig.spec.json',
    platform: PlatformType.wx,
    pages: [{ glob: '**/*.entry.ts', input: './src/spec', output: 'pages' }],
    include: ['**/*.spec.ts'],
    viteConfig,
  }) as unknown as Parameters<typeof createVitestViteConfig>[0]['vitestOptions'];

describe('application builder：viteConfig', () => {
  it('钩子的改动确实进了交给 vite 的配置', async () => {
    const { context } = makeContext();
    const config = await createMiniProgramViteConfig({
      viteOptions: appViteOptions(writeHook(MARKER_HOOK)),
      context,
      buildPlatform: getBuildPlatform(PlatformType.wx),
    });
    expect(config.define).toMatchObject({ __FROM_HOOK__: '"1"' });
    expect(hasPlugin(config, 'spec-marker')).toBe(true);
  }, 120000);

  it('没配 viteConfig 就完全不碰文件', async () => {
    const { context } = makeContext();
    const config = await createMiniProgramViteConfig({
      viteOptions: appViteOptions(),
      context,
      buildPlatform: getBuildPlatform(PlatformType.wx),
    });
    expect(config.define).not.toHaveProperty('__FROM_HOOK__');
  }, 120000);

  it('钩子抛错就构建失败，不静默出个没改过的包', async () => {
    const { context } = makeContext();
    await expect(
      createMiniProgramViteConfig({
        viteOptions: appViteOptions(
          writeHook(`export default () => { throw new Error('钩子炸了'); };`),
        ),
        context,
        buildPlatform: getBuildPlatform(PlatformType.wx),
      }),
    ).rejects.toThrow(/钩子炸了/);
  }, 120000);

  it('钩子文件在 watch 清单里', () => {
    const files = mpConfigWatchFiles(
      { viteConfig: 'tools/hook.ts' } as never,
      '/ws',
    );
    expect(files).toContain(path.resolve('/ws', 'tools/hook.ts'));
  });
});

describe('vitest builder：viteConfig', () => {
  it('测试产物走同一个入口', async () => {
    const { context } = makeContext();
    const config = await createVitestViteConfig({
      vitestOptions: vitestOptions(writeHook(MARKER_HOOK)),
      context,
    });
    expect(config.define).toMatchObject({ __FROM_HOOK__: '"1"' });
    expect(hasPlugin(config, 'spec-marker')).toBe(true);
  }, 120000);

  it('ctx.target 区分得出来，钩子能按链路分支', async () => {
    const { context } = makeContext();
    const config = await createVitestViteConfig({
      vitestOptions: vitestOptions(
        writeHook(
          `export default (config: any, ctx: any) => ({ ...config, target: ctx.target });`,
        ),
      ),
      context,
    });
    expect((config as { target?: string }).target).toBe('vitest');
  }, 120000);
});
