/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 库元信息标记（`<Directive>_Listeners` / `<Directive>_Properties`）
 * 必须存在于**最终对外的 `.d.ts`** 里。
 *
 * 为什么这是必须的：
 *
 *   应用构建 → getLibraryDirectiveMeta() 从库 d.ts 查标记
 *            → ComponentContext 用它**覆盖** host.listeners
 *            → wxml 生成 bind:input / bind:change 等事件绑定
 *
 * ng-packagr 22 的 d.ts 扁平化会把不在导出引用图里的 `declare const`
 * tree-shake 掉，标记丢失后 listeners 变空数组，**wxml 一个事件绑定都没有**，
 * 表单输入/勾选/picker 全部不响应，且**没有任何报错**。
 *
 * 本文件用真实构建产物钉住这条链路。
 */
import { normalize } from '@angular-devkit/core';
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
import { PlatformType } from './platform/platform';
import { runViteBuilder as runBuilder } from './vite';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
};

function memoize<T>(fn: () => Promise<T>) {
  let p: Promise<T> | undefined;
  return () => (p = p ?? fn());
}

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('库元信息标记 → wxml 事件绑定', () => {
    const load = memoize(async () => {
      const root = harness.host.root();
      const h = new MyTestProjectHost(harness.host);
      const list = await h.getFileList(
        normalize(path.join(root, 'src', '__pages'))
      );
      list.push(
        ...(await h.getFileList(
          normalize(path.join(root, 'src', '__components'))
        ))
      );
      await h.importPathRename(list);
      await h.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
      await h.moveDir(ALL_COMPONENT_NAME_LIST, '__components', 'components');
      await h.addPageEntry(ALL_PAGE_NAME_LIST);
      harness.useTarget('build', angularConfig);
      const r = await harness.executeOnce();
      const base = r.result?.baseOutputPath as string;
      return {
        wxml: fs.readFileSync(
          path.join(base, 'pages/base-forms/base-forms-entry.wxml'),
          'utf8'
        ),
      };
    });

    /** 库对外 d.ts 的根（构建产物，非中间产物） */
    const distTypes = path.resolve(
      __dirname,
      '../../dist/types'
    );

    it('库 d.ts 里存在 _Listeners 标记（回归根因）', () => {
      const formsDts = path.join(distTypes, 'angular-miniprogram-forms.d.ts');
      expect(fs.existsSync(formsDts)).withContext('forms d.ts 应存在').toBeTrue();
      const content = fs.readFileSync(formsDts, 'utf8');

      // 根因就是这些标记被扁平化 tree-shake 掉了
      expect(content).toContain('DefaultValueAccessor_Listeners');
      expect(content).toContain('CheckBoxGroupValueAccessor_Listeners');
      expect(content).toContain('SwitchValueAccessor_Listeners');
    });

    it('标记内容含正确的微信事件名', () => {
      const content = fs.readFileSync(
        path.join(distTypes, 'angular-miniprogram-forms.d.ts'),
        'utf8'
      );
      expect(content).toMatch(
        /DefaultValueAccessor_Listeners:\s*\[[^\]]*"bindinput"[^\]]*\]/
      );
      expect(content).toMatch(
        /CheckBoxGroupValueAccessor_Listeners:\s*\[[^\]]*"bindchange"[^\]]*\]/
      );
    });

    it('base-forms 的 wxml 里 input 有 bind:input / bind:blur', async () => {
      const { wxml } = await load();
      expect(wxml).toContain('bind:input="bindEvent"');
      expect(wxml).toContain('bind:blur="bindEvent"');
    });

    it('base-forms 的 wxml 里 checkbox-group 有 bind:change', async () => {
      const { wxml } = await load();
      expect(wxml).toContain('bind:change="bindEvent"');
    });

    it('反向对照：断言不是恒真（去掉标记后 wxml 会失去事件）', async () => {
      // 直接验证「事件绑定确实来自标记」：把标记内容当作集合，
      // 与 wxml 中出现的事件一一对应。若事件是别处硬编码来的，
      // 这个对应关系就不会成立。
      const content = fs.readFileSync(
        path.join(distTypes, 'angular-miniprogram-forms.d.ts'),
        'utf8'
      );
      const { wxml } = await load();

      const markerEvents = new Set<string>();
      const re = /_Listeners:\s*\[([^\]]*)\]/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(content))) {
        m[1]
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''))
          .filter(Boolean)
          .forEach((e) => markerEvents.add(e));
      }

      // wxml 里出现的 bind:<x> 必须都能在标记里找到来源
      const wxmlEvents = new Set<string>();
      const re2 = /bind:([a-z]+)=/g;
      let m2: RegExpExecArray | null;
      while ((m2 = re2.exec(wxml))) {
        wxmlEvents.add(m2[1]);
      }

      expect(wxmlEvents.size).withContext('wxml 应有事件绑定').toBeGreaterThan(0);
      wxmlEvents.forEach((e) =>
        expect(markerEvents.has(e))
          .withContext(`wxml 事件 bind:${e} 应能在库标记里找到来源`)
          .toBeTrue()
      );
    });
  });
});
