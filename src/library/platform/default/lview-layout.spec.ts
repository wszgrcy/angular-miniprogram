import * as fs from 'fs';
import * as path from 'path';

import { LVIEW } from './lview-layout';

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
  const fesmDir = path.resolve(
    __dirname,
    '../../../../node_modules/@angular/core/fesm2022'
  );

  let bundleSource = '';

  beforeAll(() => {
    expect(fs.existsSync(fesmDir))
      .withContext(`找不到 @angular/core fesm2022 目录：${fesmDir}`)
      .toBe(true);

    bundleSource = fs
      .readdirSync(fesmDir)
      .filter((f) => f.endsWith('.mjs'))
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
