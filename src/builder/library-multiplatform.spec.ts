/**
 * 多平台：一份库产物，通吃非 wx 平台。
 *
 * 库构建产出的是 `${}` 插值模板串（平台中立）：平台相关处写成 `${directivePrefix}` /
 * `${eventListConvert(["tap"])}`，wxml 自己的 `{{hasLoad}}` 是静态文本原样进出；
 * 填充发生在主构建，用目标平台的 `LibraryTemplateValues` 跑 `renderLibraryTemplate()`。
 * 所以库只需要构建一次，平台相关的东西一个都不烘进库里。
 *
 * 这里用 zfb（支付宝）做对照，因为它跟 wx 的差异足够大：指令前缀 `a:if`、事件名 `onTap`、
 * 模板 `.axml`、样式 `.acss`。
 *
 * 单独开一个 spec 文件而不是塞进 `library-meta-sidecar.spec.ts`：那个文件里 wx 的 `load()` 是
 * memoize 的，再跑一次 zfb 构建会把同一批 `.js` chunk 覆盖掉，两个平台的断言会互相污染。
 */
import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';

import {
  MyTestProjectHost,
  describeBuilder,
} from '../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
} from '../../test/util/file';
import { analyzeFileInjection } from '../../test/util/template-inject-ast';
import { PlatformType } from './platform/platform';
import { runViteBuilder as runBuilder } from './vite';

const LIB_COMPONENT = 'other-component';
const LIB_COMPONENT_PATH = `library/test-library/${LIB_COMPONENT}/${LIB_COMPONENT}`;

function memoize<T>(fn: () => Promise<T>) {
  let p: Promise<T> | undefined;
  return () => (p = p ?? fn());
}

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const loadZfb = memoize(async () => {
    const root = harness.host.root();
    const h = new MyTestProjectHost(harness.host);
    const list = await h.getFileList(
      normalize(path.join(root, 'src', '__pages')),
    );
    list.push(
      ...(await h.getFileList(
        normalize(path.join(root, 'src', '__components')),
      )),
    );
    await h.importPathRename(list);
    await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
    await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
    await h.addPageEntry(ALL_PAGE_NAME_LIST);

    // app harness 跑不了 library target，test-library 靠外部先构建，这里验一下副本新鲜度，避免假绿灯
    const installedLib = Buffer.from(
      await harness.host
        .read(
          join(
            normalize(root),
            'node_modules/test-library/fesm2022/test-library.mjs',
          ),
        )
        .toPromise(),
    ).toString('utf8');
    expect(
      installedLib,
      'node_modules/test-library 副本已过期，' +
        '先跑 `vitest run src/builder/library/library.spec.ts` 重新生成',
    ).toContain('LIB_TEST_LIBRARY_RENDERED');

    // 关键：库不重新构建，只是主构建换了平台。库产物（含 sidecar）与 wx 那次用的是同一份。
    const angularConfig = {
      ...DEFAULT_ANGULAR_CONFIG,
      platform: PlatformType.zfb,
      sourceMap: false,
    };
    harness.useTarget('build', angularConfig);
    const r = await harness.executeOnce();
    const base = r.result?.baseOutputPath as string;

    /** 读产物；文件不存在返回 ''，让断言给出「缺哪个扩展名」的清晰信息 */
    const read = (rel: string) => {
      const p = path.join(base, rel);
      return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
    };

    return {
      base,
      axml: read(`${LIB_COMPONENT_PATH}.axml`),
      wxml: read(`${LIB_COMPONENT_PATH}.wxml`),
      acss: read(`${LIB_COMPONENT_PATH}.acss`),
      wxss: read(`${LIB_COMPONENT_PATH}.wxss`),
      allJs: (() => {
        const out: { name: string; content: string }[] = [];
        const walk = (dir: string) => {
          for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, item.name);
            if (item.isDirectory()) {
              walk(p);
            } else if (item.name.endsWith('.js')) {
              out.push({ name: p, content: fs.readFileSync(p, 'utf8') });
            }
          }
        };
        walk(base);
        return out;
      })(),
    };
  });

  describe('同一份库产物在 zfb 平台下', () => {
    it('库组件模板按目标平台扩展名产出（.axml 而不是 .wxml）', async () => {
      const r = await loadZfb();
      expect(
        r.axml.length,
        'zfb 应产出 .axml，说明库 content 被填成了目标平台模板',
      ).toBeGreaterThan(0);
      expect(r.wxml, 'zfb 平台不该出现 .wxml').toBe('');
    });

    it('指令前缀按平台转换（a:if 而不是 wx:if）', async () => {
      const { axml } = await loadZfb();
      expect(axml).toContain('a:if');
      expect(axml).not.toContain('wx:if');
    });

    it('事件名按平台转换（onTap 而不是 bind:tap）', async () => {
      const { axml } = await loadZfb();
      expect(axml).toContain('onTap');
      expect(axml).not.toContain('bind:tap');
      expect(axml).not.toContain('bindtap');
    });

    it('样式按平台扩展名产出（.acss 而不是 .wxss）', async () => {
      const r = await loadZfb();
      expect(r.acss).toBeDefined();
      expect(r.wxss).toBe('');
    });

    it('运行时注入与平台无关：库组件仍被注入恰好 1 次 propertyChange', async () => {
      const { allJs } = await loadZfb();
      let count = 0;
      for (const f of allJs) {
        const report = analyzeFileInjection(f.name, f.content);
        for (const c of report.components) {
          if (c.componentName === 'OtherComponent') {
            count += c.propertyChangeCount;
          }
        }
      }
      expect(
        count,
        'propertyChange 注入走的是 JS 层，与模板平台无关，换平台也必须是 1 次',
      ).toBe(1);
    });
  });
});
