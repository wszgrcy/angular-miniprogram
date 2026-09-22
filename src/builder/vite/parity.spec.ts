import { normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
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
import { runBuilder } from '../application';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

/**
 * webpack 与 Vite 两条链路的产物对等性验证。
 *
 * 同一份 fixture 分别用两个 builder 构建，比对 wxml / json。
 * wxml 必须逐字节一致（模板编译逻辑是同一套）；
 * json 语义一致（usingComponents 排序可能不同，做规范化后比较）。
 */

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
};

interface Snapshot {
  byName: Map<string, string>;
}

/** describeBuilder 回调注入的 harness，只用到 host / useTarget / executeOnce */
type ParityHarness = Parameters<Parameters<typeof describeBuilder>[2]>[0];

async function buildSnapshot(
  harness: ParityHarness,
  outputPath: string,
): Promise<Snapshot> {
  const root = harness.host.root();
  const myTestProjectHost = new MyTestProjectHost(harness.host);
  const list = await myTestProjectHost.getFileList(
    normalize(path.join(root, 'src', '__pages')),
  );
  list.push(
    ...(await myTestProjectHost.getFileList(
      normalize(path.join(root, 'src', '__components')),
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

  harness.useTarget('build', {
    ...angularConfig,
    outputPath,
  } as never);
  const result = await harness.executeOnce();
  if (!result.result?.success) {
    const errLogs = (result.logs || [])
      .filter((l: { level: string }) => l.level === 'error')
      .map((l: { message?: unknown; value?: unknown }) =>
        String(l.message ?? l.value),
      );
    throw new Error(
      `构建失败 (${outputPath}): ${errLogs.join(' ~~ ').slice(0, 1200)}`,
    );
  }

  const base = result.result?.baseOutputPath as string;
  const byName = new Map<string, string>();
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(wxml|json|js|wxss)$/.test(entry.name)) {
        const rel = path.relative(base, full).split(path.sep).join('/');
        byName.set(rel, fs.readFileSync(full, 'utf8'));
      }
    }
  };
  walk(base);
  return { byName };
}

function memoize<T>(fn: () => Promise<T>) {
  let promise: Promise<T> | undefined;
  return () => (promise = promise ?? fn());
}

// 两个 builder 各构建一次，结果存模块级，供对等性用例复用
const webpackSnap = { load: () => Promise.resolve<Snapshot | null>(null) };
const viteSnap = { load: () => Promise.resolve<Snapshot | null>(null) };

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('parity: webpack 侧构建', () => {
    webpackSnap.load = memoize(() =>
      buildSnapshot(harness, 'dist/parity-webpack'),
    );
    it('webpack 构建成功', async () => {
      const snap = await webpackSnap.load();
      expect(snap.byName.size).toBeGreaterThan(0);
    }, 600000);
  });
});

describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('parity: vite 侧构建', () => {
    viteSnap.load = memoize(() => buildSnapshot(harness, 'dist/parity-vite'));
    it('vite 构建成功', async () => {
      const snap = await viteSnap.load();
      expect(snap.byName.size).toBeGreaterThan(0);
    }, 600000);
  });
});

describe('parity: webpack vs vite 产物对等', () => {
  /**
   * 小程序侧产物（wxml / json / wxss / app.*）清单必须完全一致。
   *
   * JS chunk 结构不纳入严格比对——webpack 有 runtime.js / vendor.js /
   * module-chunk.js 这种自己的拆包产物，Vite（rolldown）的 hash 和拆包
   * 策略本来就不同，比这个没有意义。真正要比的是「小程序能跑起来需要的
   * 那批文件在两边都在、内容对」。
   */
  it('小程序侧产物清单一致（排除 js chunk 结构差异）', async () => {
    const [w, v] = await Promise.all([webpackSnap.load(), viteSnap.load()]);
    const isMpArtifact = (k: string) =>
      /\.(wxml|json|wxss)$/.test(k) || k === 'app.js' || k === 'app.wxss';
    const wKeys = [...w.byName.keys()].filter(isMpArtifact).sort();
    const vKeys = [...v.byName.keys()].filter(isMpArtifact).sort();
    const onlyWebpack = wKeys.filter((k) => !v.byName.has(k));
    const onlyVite = vKeys.filter((k) => !w.byName.has(k));
    expect({ onlyWebpack, onlyVite }).toEqual({
      onlyWebpack: [],
      onlyVite: [],
    });
    // 防止过滤条件写错导致空对空
    expect(wKeys.length).toBeGreaterThan(20);
  }, 600000);

  it('每个页面/组件入口 js 两边都存在', async () => {
    const [w, v] = await Promise.all([webpackSnap.load(), viteSnap.load()]);
    const entries = (snap: Snapshot) =>
      [...snap.byName.keys()]
        .filter(
          (k) =>
            /\.(js)$/.test(k) && /^(pages|components)\/[\w./-]+\.js$/.test(k),
        )
        .sort();
    const wEntries = entries(w);
    const vEntries = entries(v);
    expect({ onlyWebpack: wEntries.filter((k) => !v.byName.has(k)) }).toEqual({
      onlyWebpack: [],
    });
    expect({ onlyVite: vEntries.filter((k) => !w.byName.has(k)) }).toEqual({
      onlyVite: [],
    });
    expect(wEntries.length).toBeGreaterThan(10);
  }, 600000);

  /**
   * chunk 数量不能失控。
   *
   * 小程序里每个 chunk 都是一次文件加载，chunk 数量爆炸会直接拖慢启动。
   * 实测 webpack=34 / vite=35，基本持平，所以这里卡一个宽松上限，
   * 防止以后改配置改出几十上百个碎片 chunk。
   */
  it('产物 chunk 数量与 webpack 相当（防止 chunk 爆炸）', async () => {
    const [w, v] = await Promise.all([webpackSnap.load(), viteSnap.load()]);
    const js = (snap: Snapshot) =>
      [...snap.byName.keys()].filter((k) => k.endsWith('.js'));
    const wCount = js(w).length;
    const vCount = js(v).length;
    expect(wCount).toBeGreaterThan(0);
    expect(vCount).toBeLessThanOrEqual(Math.ceil(wCount * 1.2));
  }, 600000);

  it('app.js 里 require 的文件都真实存在', async () => {
    const v = await viteSnap.load();
    const appJs = v.byName.get('app.js') ?? '';
    const required = [...appJs.matchAll(/require\('\.\/([^']+)'\)/g)].map(
      (m) => m[1],
    );
    expect(required.length).toBeGreaterThan(0);
    const missing = required.filter((f) => !v.byName.has(normalize(f)));
    expect(missing).toEqual([]);
  }, 600000);

  it('app.js 存在且是 require 列表', async () => {
    const [w, v] = await Promise.all([webpackSnap.load(), viteSnap.load()]);
    const wApp = w.byName.get('app.js');
    const vApp = v.byName.get('app.js');
    expect(typeof wApp).toBe('string');
    expect(typeof vApp).toBe('string');
    // 小程序没有模块系统，app.js 靠一串 require 把启动需要的 chunk 拉起来
    expect(wApp).toContain('require(');
    expect(vApp).toContain('require(');
  }, 600000);

  it('wxml 内容逐字节一致', async () => {
    const [w, v] = await Promise.all([webpackSnap.load(), viteSnap.load()]);
    const diff: string[] = [];
    for (const [name, content] of w.byName) {
      if (!name.endsWith('.wxml')) {
        continue;
      }
      if (v.byName.get(name) !== content) {
        diff.push(name);
      }
    }
    expect(diff).toEqual([]);
  }, 600000);

  it('json 语义一致（忽略 key 顺序）', async () => {
    const [w, v] = await Promise.all([webpackSnap.load(), viteSnap.load()]);
    const canon = (raw: string) =>
      JSON.stringify(JSON.parse(raw), Object.keys(JSON.parse(raw)).sort());
    const diff: string[] = [];
    for (const [name, content] of w.byName) {
      if (!name.endsWith('.json')) {
        continue;
      }
      const other = v.byName.get(name);
      if (other === undefined) {
        continue;
      }
      try {
        if (canon(content) !== canon(other)) {
          diff.push(name);
        }
      } catch (error) {
        diff.push(`${name} (JSON 解析失败)`);
      }
    }
    expect(diff).toEqual([]);
  }, 600000);
});
