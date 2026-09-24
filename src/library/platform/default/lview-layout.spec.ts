import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';

import { LVIEW } from './lview-layout';

/**
 * 不能用全局 `require.resolve`。
 *
 * `platform-core.ts` 带了 `/// <reference types="miniprogram-api-typings"/>`，
 * 而该包声明了**全局** `interface Require` + `declare const require: Require`。
 * 本文件与它同处一个编译单元，全局 `require` 就被小程序那一版接管——
 * 而小程序的 `require` 只有 `()` 和 `.async()`，**没有 `resolve`**，
 * 于是 TS2339。
 *
 * `createRequire` 由 `@types/node` 完整 typing，不碰全局名字，
 * 两个类型体系互不干扰。
 */
const nodeRequire = createRequire(__filename);

/**
 * 防「静默错位」的守卫。
 *
 * 这些 lView 下标在 @angular/core 里没有公开导出（既无公开 API 也无 ɵ），
 * 我们只能自己持有。而它们**会变**——HEADER_OFFSET 在 v19→v20 就从 26
 * 变成了 27。硬编码旧值的后果是 nodeList 整体错位一位，
 * 渲染错乱但不抛错误。
 *
 * 所以每次升级 Angular 后跑这条用例，它会拿我们的值去比对
 * **实际安装的** @angular/core，不一致就直接失败并列出差异。
 */
describe('lview-layout: 与已安装 @angular/core 交叉校验', () => {
  /**
   * 从**已安装的** @angular/core 解析入口，dirname 直接得到 fesm 目录。
   *
   * 不用 `path.resolve(__dirname, '../../../../node_modules/...')`，
   * 那种写法有三个坑：
   *
   * 1. 相对深度写死。本文件刚从 util/ 移到 default/（同深度才侥幸没坏），
   *    再挪一次就得跟着改，漏改就是路径不存在。
   * 2. `fesm2022` 写死。Angular 有按 target 递进的习惯（fesm2015→2018→
   *    2022→2024），哪天只出 fesm2024，这里直接找不到目录。
   * 3. monorepo / node_modules 提升（hoisting）时，`../../../../node_modules`
   *    可能根本不存在——包实际装在上层。
   *
   * require.resolve 由 Node 按 package.json 的 exports 解析，
   * 平台无关（Windows 下返回原生 C:\... 路径）、深度无关、
   * 提升无关，且 fesm 版本自动跟随。
   */
  const coreEntry = nodeRequire.resolve('@angular/core');
  const fesmDir = path.dirname(coreEntry);

  let bundleSource = '';

  beforeAll(() => {
    expect(fs.existsSync(fesmDir))
      .withContext(`解析出的 @angular/core fesm 目录不存在：${fesmDir}`)
      .toBe(true);

    const mjsFiles = fs.readdirSync(fesmDir).filter((f) => f.endsWith('.mjs'));

    // 常量声明可能分散在 core.mjs 和内部 chunk（如 _debug_node-chunk.mjs）
    // 里，所以整目录拼起来再匹配，不能只读 core.mjs。
    expect(mjsFiles.length)
      .withContext(`fesm 目录里没有 .mjs 文件：${fesmDir}`)
      .toBeGreaterThan(0);

    bundleSource = mjsFiles
      .map((f) => fs.readFileSync(path.join(fesmDir, f), 'utf8'))
      .join('\n');
    expect(bundleSource.length).toBeGreaterThan(0);
  });

  /** 从 bundle 里抓 `const NAME = <number>` 的字面量值 */
  function readConstFromBundle(name: string): number | undefined {
    const m = new RegExp(`(?:const|var|let)\\s+${name}\\s*=\\s*(\\d+)\\b`).exec(
      bundleSource
    );
    return m ? Number(m[1]) : undefined;
  }

  const cases: { key: keyof typeof LVIEW; angularName: string }[] = [
    { key: 'CLEANUP', angularName: 'CLEANUP' },
    { key: 'CONTEXT', angularName: 'CONTEXT' },
    { key: 'INJECTOR', angularName: 'INJECTOR' },
    { key: 'HEADER_OFFSET', angularName: 'HEADER_OFFSET' },
    { key: 'CONTAINER_VIEW_REFS', angularName: 'VIEW_REFS' },
  ];

  for (const { key, angularName } of cases) {
    it(`${key} 应与 @angular/core 的 ${angularName} 一致`, () => {
      const actual = readConstFromBundle(angularName);

      expect(actual)
        .withContext(
          `在已安装的 @angular/core fesm 里没找到 \`const ${angularName} = <n>\`。` +
            `可能 Angular 改了声明形式或常量名——此时不能想当然沿用旧值，` +
            `去 packages/core/src/render3/interfaces/{view,container}.ts 核对后再更新 lview-layout.ts`
        )
        .toBeDefined();

      expect({
        [key]: LVIEW[key],
        [`@angular/core ${angularName}`]: actual,
      }).toEqual({
        [key]: actual,
        [`@angular/core ${angularName}`]: actual,
      });
    });
  }

  it('HEADER_OFFSET 单独兜一条：这是历史上变过的值', () => {
    // v19=26, v20+=27。若哪天又变，这条给出最直白的提示。
    // 用对象比较：LVIEW 是 as const，字面量类型 27 与 number 直接 expect
    // 会 TS2345，包一层对象让两侧都 widen 到 number。
    const actual = readConstFromBundle('HEADER_OFFSET');
    expect({
      ours: LVIEW.HEADER_OFFSET as number,
      installedAngular: actual as number,
    }).toEqual({
      ours: actual as number,
      installedAngular: actual as number,
    });
  });
});
