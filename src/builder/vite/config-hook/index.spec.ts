import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { MpViteConfigLogger } from './types';
import {
  applyMpViteConfig,
  defineMpViteConfig,
  needsJiti,
  resolveMpViteConfigPath,
  toViteConfigHook,
} from './index';

/**
 * 钩子的加载与应用。全部走临时目录 + 真文件，不碰 vite：这一层要验的就是「读文件 + 交还 config」。
 */

interface Logged {
  info: string[];
  warn: string[];
  error: string[];
}

function makeLogger(): { logger: MpViteConfigLogger; logged: Logged } {
  const logged: Logged = { info: [], warn: [], error: [] };
  const logger: MpViteConfigLogger = {
    info: (m) => void logged.info.push(m),
    warn: (m) => void logged.warn.push(m),
    error: (m) => void logged.error.push(m),
  };
  return { logger, logged };
}

let workspace = '';
beforeEach(() => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-vite-config-'));
});
afterEach(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

/** 往临时工作区写一个钩子文件，返回相对 workspaceRoot 的路径 */
function writeHook(rel: string, content: string): string {
  const abs = path.join(workspace, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  return rel;
}

function apply(viteConfig: string | undefined, tsConfig?: string) {
  const { logger, logged } = makeLogger();
  return applyMpViteConfig(
    { define: { fromBuilder: '1' } },
    {
      viteConfig,
      target: 'application',
      platform: 'wx',
      isProduction: false,
      workspaceRoot: workspace,
      tsConfig,
      logger,
    },
  ).then((config) => ({ config, logged }));
}

describe('defineMpViteConfig', () => {
  it('原样返回，只是给类型推导用', () => {
    const hook = defineMpViteConfig(() => undefined);
    expect(typeof hook).toBe('function');
  });
});

describe('needsJiti', () => {
  it('只有 TS 家族要 jiti', () => {
    expect(['a.ts', 'a.mts', 'a.cts', 'a.tsx'].map(needsJiti)).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
  it('JS 家族原生 import 就够', () => {
    expect(['a.js', 'a.mjs', 'a.cjs'].map(needsJiti)).toEqual([
      false,
      false,
      false,
    ]);
  });
});

describe('resolveMpViteConfigPath', () => {
  it('相对路径按 workspaceRoot 解析', () => {
    expect(resolveMpViteConfigPath('tools/x.ts', workspace)).toBe(
      path.join(workspace, 'tools', 'x.ts'),
    );
  });
  it('绝对路径原样采纳', () => {
    const abs = path.join(workspace, 'x.ts');
    expect(resolveMpViteConfigPath(abs, workspace)).toBe(abs);
  });
});

describe('toViteConfigHook', () => {
  it('函数直接用', () => {
    const fn = () => undefined;
    expect(toViteConfigHook(fn, 'x.ts')).toBe(fn);
  });
  it('命名空间对象取 default', () => {
    const fn = () => undefined;
    expect(toViteConfigHook({ default: fn }, 'x.ts')).toBe(fn);
  });
  it('不是函数就报错，并且说清是哪个文件', () => {
    expect(() => toViteConfigHook({ vite: 1 }, '/tmp/x.ts')).toThrow(
      /\/tmp\/x\.ts/,
    );
  });
});

describe('applyMpViteConfig', () => {
  it('没配 viteConfig 时原对象直接返回', async () => {
    const { config } = await apply(undefined);
    expect(config.define).toEqual({ fromBuilder: '1' });
  });

  it('文件不存在：报错带绝对路径', async () => {
    await expect(apply('tools/missing.ts')).rejects.toThrow(
      path.join(workspace, 'tools', 'missing.ts'),
    );
  });

  it('.ts 默认导出函数，返回新对象则用返回值', async () => {
    const rel = writeHook(
      'tools/hook.ts',
      `export default (config: any) => ({ ...config, base: '/from-hook/' });`,
    );
    const { config, logged } = await apply(rel);
    expect((config as { base?: string }).base).toBe('/from-hook/');
    expect(logged.info.join('\n')).toContain('已应用');
  });

  it('不返回就按就地修改算', async () => {
    const rel = writeHook(
      'tools/mutate.ts',
      `export default (config: any) => { config.define = { ...config.define, ADDED: '1' }; };`,
    );
    const { config } = await apply(rel);
    expect(config.define).toEqual({ fromBuilder: '1', ADDED: '1' });
  });

  it('await 出来的 promise 也认', async () => {
    const rel = writeHook(
      'tools/async.ts',
      `export default async (config: any) => { await Promise.resolve(); return { ...config, mode: 'async' }; };`,
    );
    const { config } = await apply(rel);
    expect((config as { mode?: string }).mode).toBe('async');
  });

  it('.mjs 与 .cjs 两种模块形态都收', async () => {
    const mjs = writeHook(
      'tools/esm.mjs',
      `export default (config) => ({ ...config, tag: 'mjs' });`,
    );
    expect((await apply(mjs)).config).toMatchObject({ tag: 'mjs' });

    const cjs = writeHook(
      'tools/cjs.cjs',
      `module.exports = (config) => ({ ...config, tag: 'cjs' });`,
    );
    expect((await apply(cjs)).config).toMatchObject({ tag: 'cjs' });
  });

  it('ctx 带得上构建上下文', async () => {
    const rel = writeHook(
      'tools/ctx.ts',
      `export default (config: any, ctx: any) => ({ ...config, ctx });`,
    );
    const { config } = await apply(rel);
    expect((config as { ctx: Record<string, unknown> }).ctx).toMatchObject({
      target: 'application',
      platform: 'wx',
      isProduction: false,
      mode: 'development',
      workspaceRoot: workspace,
      configPath: path.join(workspace, 'tools', 'ctx.ts'),
    });
  });

  it('钩子抛错：消息里既认得出文件，也留得下原始错误', async () => {
    const rel = writeHook(
      'tools/boom.ts',
      `export default () => { throw new Error('插件不存在'); };`,
    );
    await expect(apply(rel)).rejects.toThrow(/执行失败[\s\S]*插件不存在/);
  });

  it('返回非对象直接报错，不静默', async () => {
    const rel = writeHook('tools/bad.ts', `export default () => 42;`);
    await expect(apply(rel)).rejects.toThrow(/必须返回配置对象/);
  });

  it('改了钩子文件下一轮就是新内容（watch 的前提）', async () => {
    const rel = writeHook(
      'tools/live.ts',
      `export default (config: any) => ({ ...config, tag: 'first' });`,
    );
    expect((await apply(rel)).config).toMatchObject({ tag: 'first' });
    writeHook(
      rel,
      `export default (config: any) => ({ ...config, tag: 'second' });`,
    );
    expect((await apply(rel)).config).toMatchObject({ tag: 'second' });
  });

  it('钩子文件里能用工程 tsconfig 的 paths 别名', async () => {
    fs.writeFileSync(
      path.join(workspace, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { baseUrl: '.', paths: { '@app/*': ['./src/*'] } },
      }),
    );
    fs.mkdirSync(path.join(workspace, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(workspace, 'src', 'flag.ts'),
      `export const tag = 'from-paths';`,
    );
    const rel = writeHook(
      'tools/paths.ts',
      `import { tag } from '@app/flag';
export default (config: any) => ({ ...config, tag });`,
    );
    expect((await apply(rel, 'tsconfig.json')).config).toMatchObject({
      tag: 'from-paths',
    });
  });
});
