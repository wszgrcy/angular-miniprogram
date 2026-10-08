import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';

import { LVIEW } from './lview-layout';

/**
 * 不能用全局 `require.resolve`。`platform-core.ts` 带了
 * `/// <reference types="miniprogram-api-typings"/>`，而该包声明了全局
 * `declare const require: Require`，本文件与它同处一个编译单元，全局 `require`
 * 就被小程序那一版接管——而小程序的 `require` 没有 `resolve`，于是 TS2339。
 * `createRequire` 由 `@types/node` 完整 typing，不碰全局名字。
 */
const nodeRequire = createRequire(__filename);

/**
 * 防「静默错位」的守卫。这些 lView 下标在 @angular/core 里没有公开导出，我们只能自己持有，
 * 而它们会变。硬编码旧值的后果是 nodeList 整体错位一位，渲染错乱但不抛错误。
 * 这条用例拿我们的值去比对实际安装的 @angular/core，不一致就直接失败并列出差异。
 */
describe('lview-layout: 与已安装 @angular/core 交叉校验', () => {
  /**
   * 从已安装的 @angular/core 解析入口，dirname 直接得到 fesm 目录。
   * 不用 `path.resolve(__dirname, '../../../../node_modules/...')`：相对深度写死、
   * `fesm2022` 写死、monorepo 提升时上层路径可能不存在。
   * require.resolve 由 Node 按 package.json 的 exports 解析，平台无关、深度无关、提升无关。
   */
  const coreEntry = nodeRequire.resolve('@angular/core');
  const fesmDir = path.dirname(coreEntry);

  let bundleSource = '';

  beforeAll(() => {
    expect(
      fs.existsSync(fesmDir),
      `解析出的 @angular/core fesm 目录不存在：${fesmDir}`,
    ).toBe(true);

    const mjsFiles = fs.readdirSync(fesmDir).filter((f) => f.endsWith('.mjs'));

    // 常量声明可能分散在 core.mjs 和内部 chunk 里，所以整目录拼起来再匹配
    expect(
      mjsFiles.length,
      `fesm 目录里没有 .mjs 文件：${fesmDir}`,
    ).toBeGreaterThan(0);

    bundleSource = mjsFiles
      .map((f) => fs.readFileSync(path.join(fesmDir, f), 'utf8'))
      .join('\n');
    expect(bundleSource.length).toBeGreaterThan(0);
  });

  /** 从 bundle 里抓 `const NAME = <number>` 的字面量值 */
  function readConstFromBundle(name: string): number | undefined {
    const m = new RegExp(`(?:const|var|let)\\s+${name}\\s*=\\s*(\\d+)\\b`).exec(
      bundleSource,
    );
    return m ? Number(m[1]) : undefined;
  }

  const cases: { key: keyof typeof LVIEW; angularName: string }[] = [
    { key: 'CLEANUP', angularName: 'CLEANUP' },
    { key: 'CONTEXT', angularName: 'CONTEXT' },
    { key: 'INJECTOR', angularName: 'INJECTOR' },
    { key: 'HEADER_OFFSET', angularName: 'HEADER_OFFSET' },
    { key: 'CONTAINER_VIEW_REFS', angularName: 'VIEW_REFS' },
    {
      key: 'CONTAINER_HEADER_OFFSET',
      angularName: 'CONTAINER_HEADER_OFFSET',
    },
  ];

  for (const { key, angularName } of cases) {
    it(`${key} 应与 @angular/core 的 ${angularName} 一致`, () => {
      const actual = readConstFromBundle(angularName);

      expect(
        actual,
        `在已安装的 @angular/core fesm 里没找到 \`const ${angularName} = <n>\`。` +
          `可能 Angular 改了声明形式或常量名——此时不能想当然沿用旧值，` +
          `去 packages/core/src/render3/interfaces/{view,container}.ts 核对后再更新 lview-layout.ts`,
      ).toBeDefined();

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
    // 用对象比较：LVIEW 是 as const，字面量类型与 number 直接 expect 会 TS2345，包一层让两侧都 widen
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
