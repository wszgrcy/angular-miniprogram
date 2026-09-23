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
  outputPath: string
): Promise<Snapshot> {
  const root = harness.host.root();
  const myTestProjectHost = new MyTestProjectHost(harness.host);
  const list = await myTestProjectHost.getFileList(
    normalize(path.join(root, 'src', '__pages'))
  );
  list.push(
    ...(await myTestProjectHost.getFileList(
      normalize(path.join(root, 'src', '__components'))
    ))
  );
  await myTestProjectHost.importPathRename(list);
  await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
  await myTestProjectHost.moveDir(
    ALL_COMPONENT_NAME_LIST,
    '__components',
    'components'
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
        String(l.message ?? l.value)
      );
    throw new Error(
      `构建失败 (${outputPath}): ${errLogs.join(' ~~ ').slice(0, 1200)}`
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
      buildSnapshot(harness, 'dist/parity-webpack')
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

    /**
     * main.js 必须真的带 app 引导。
     *
     * 只断言 app.js require 了 ./main.js 是不够的：main 指到别的文件时
     * require 照样成立，但小程序起不来。这里直接验内容。
     */
    it('main.js 带 platformMiniProgram 引导', async () => {
      const snap = await viteSnap.load();
      const main = snap.byName.get('main.js');
      expect(typeof main).toBe('string');
      expect(main).toContain('platformMiniProgram');
      expect(main).toContain('bootstrapModule');
    }, 600000);

    /**
     * library 组件的 .js 必须真的调 componentRegistry。
     *
     * 这个 entry 是我在 vite 侧新写的（对齐 webpack 的
     * DynamicLibraryComponentEntryPlugin）。只验「文件存在」不够——
     * 空文件也存在，但组件注册不上，小程序里组件就是空的。
     */
    it('library 组件 entry 调 componentRegistry', async () => {
      const snap = await viteSnap.load();
      const libJs = [...snap.byName.entries()].filter(
        ([name]) => name.startsWith('library/') && name.endsWith('.js')
      );
      expect(libJs.length).toBeGreaterThan(0);
      const missing = libJs
        .filter(([, src]) => !String(src).includes('componentRegistry'))
        .map(([name]) => name);
      expect({ libraryEntriesMissingRegistry: missing }).toEqual({
        libraryEntriesMissingRegistry: [],
      });
    }, 600000);

    /**
     * page entry 必须真的调 bootstrapPage / pageStartup。
     * 同理：文件存在不等于会注册成小程序页面。
     */
    it('page entry 调 bootstrapPage 或 pageStartup', async () => {
      const snap = await viteSnap.load();
      const pageJs = [...snap.byName.entries()].filter(
        ([name]) => name.startsWith('pages/') && name.endsWith('.js')
      );
      expect(pageJs.length).toBeGreaterThan(0);
      const missing = pageJs
        .filter(
          ([, src]) =>
            !String(src).includes('bootstrapPage') &&
            !String(src).includes('pageStartup')
        )
        .map(([name]) => name);
      expect({ pageEntriesMissingBootstrap: missing }).toEqual({
        pageEntriesMissingBootstrap: [],
      });
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
            /\.(js)$/.test(k) && /^(pages|components)\/[\w./-]+\.js$/.test(k)
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
      (m) => m[1]
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

    // require 路径必须是正斜杠。Windows 下若混进反斜杠，
    // `require('./a\b.js')` 里 `` 会被 JS 当成退格符、`\c` 之类
    // 直接吃掉反斜杠，路径静默损坏成 `./ab.js`，运行时找不到模块。
    const badInVite = ((vApp as string).match(/\\/g) || []).length;
    expect({ badBackslashesInViteApp: badInVite }).toEqual({
      badBackslashesInViteApp: 0,
    });
    // 顺带确认 webpack 侧本来也是干净的（作为对照，说明这条约束不是新加的怪要求）
    const badInWebpack = ((wApp as string).match(/\\/g) || []).length;
    expect(badInWebpack).toBe(0);

    /**
     * app.js 不能 require page / component / library entry。
     *
     * 这些 entry 在文件顶层调 Page() / Component()，必须由小程序运行时
     * 在正确上下文加载（导航到页面 = page 上下文；注册组件 = 组件初始化）。
     * 从 app.js require 它们会触发：
     *   "Please do not call Page constructor in files that not listed
     *    in pages section of app.json"
     *   "Component constructors should be called while initialization"
     *
     * webpack 侧的 app.js 用 json.scripts，只含 app 主入口依赖的 chunk，
     * 天然不含 entry。Vite 侧必须显式守住这条。
     */
    const required = [
      ...(vApp as string).matchAll(/require\('([^']+)'\)/g),
    ].map((m) => m[1]);
    const entryRequires = required.filter(
      (r) =>
        r.startsWith('./pages/') ||
        r.startsWith('./components/') ||
        r.startsWith('./library/')
    );
    expect({ entryChunksRequiredByAppJs: entryRequires }).toEqual({
      entryChunksRequiredByAppJs: [],
    });
    // app 引导入口必须在，否则小程序起不来
    expect(required).toContain('./main.js');
  }, 600000);

  it('产物是 CJS 而非 ESM（小程序运行时只认 CommonJS）', async () => {
    const snap = await viteSnap.load();
    const jsFiles = [...snap.byName.entries()].filter(([name]) =>
      name.endsWith('.js')
    );
    expect(jsFiles.length).toBeGreaterThan(0);

    // 顶层 import / export 语句 = ESM。小程序运行时是 CommonJS，
    // 出现这些就得靠开发者工具「增强编译」兜，属于隐式依赖：
    // 关掉增强编译 / 真机 / CI 直接跑就可能挂。
    const esmFiles = jsFiles
      .filter(([, src]) => /^\s*(import\s|export\s)/m.test(String(src)))
      .map(([name]) => name);
    expect({ esmChunks: esmFiles }).toEqual({ esmChunks: [] });

    // 反向确认确实是 CJS：入口文件里应有 require()
    const main = String(snap.byName.get('main.js'));
    expect(main).toMatch(/\brequire\(/);
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
