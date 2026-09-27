import type { TestProjectHost } from '@angular-devkit/architect/testing';
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
import { PlatformType } from '../platform/platform';
import { runViteBuilder as runBuilder } from '../vite';

/**
 * 同文件多组件支持。
 *
 * 小程序侧「一个组件 = 一个 js = 一次 Component() 调用」，所以合法形态是
 * 一个组件源文件导出多个组件，各自用独立 entry 注册。
 *
 * 改造前实测（两个组件共用源文件 + 两个独立 entry）：
 *   - 先编译的那个组件模板彻底丢失（A 的 wxml 数 = 0）
 *   - 所有 import 该文件的 entry 都渲染成最后编译的那个组件
 * 原因就是 outputContent / useComponentPath / style 三个 map 按源文件路径做 key，
 * 后写的覆盖先写的。现在 key 改成 `源文件#组件类名`。
 */

const TWO_COMPONENT_TS = `
import { Component, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-two-a',
  template: '<div>A-input:<span>{{ aInput() }}</span></div>',
})
export class TwoAComponent {
  aInput = input('');
}

@Component({
  standalone: false,
  selector: 'app-two-b',
  template: '<p>B-input:<em>{{ bInput() }}</em><b>extra</b></p>',
})
export class TwoBComponent {
  bInput = input('');
}
`;

const ENTRY_A_TS = `
import { componentRegistry } from 'angular-miniprogram';
import { TwoAComponent } from '../two-in-file.component';

componentRegistry(TwoAComponent);
`;

const ENTRY_B_TS = `
import { componentRegistry } from 'angular-miniprogram';
import { TwoBComponent } from '../two-in-file.component';

componentRegistry(TwoBComponent);
`;

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('component-template-inject: 同文件多组件', () => {
    it('两个组件各自产出独立模板，且不会互相串', async () => {
      const angularConfig = {
        ...DEFAULT_ANGULAR_CONFIG,
        platform: PlatformType.wx,
        sourceMap: false,
      };
      const root = harness.host.root();
      const myTestProjectHost = new MyTestProjectHost(harness.host);
      const list = await myTestProjectHost.getFileList(
        normalize(join(root, 'src', '__pages'))
      );
      list.push(
        ...(await myTestProjectHost.getFileList(
          normalize(join(root, 'src', '__components'))
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

      (harness.host as TestProjectHost).writeMultipleFiles({
        'src/components/two-in-file/two-in-file.component.ts': TWO_COMPONENT_TS,
        'src/components/two-in-file/entry-a/entry-a.entry.ts': ENTRY_A_TS,
        'src/components/two-in-file/entry-b/entry-b.entry.ts': ENTRY_B_TS,
      });

      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeTruthy();

      const files = await myTestProjectHost.getFileList(
        join(root, DEFAULT_ANGULAR_CONFIG.outputPath)
      );

      const read = async (p: string) =>
        virtualFs.fileBufferToString(
          await harness.host.read(normalize(p)).toPromise()
        );

      const wxmlOf = async (name: string) => {
        const hit = files.find(
          (f) => String(f).includes(name) && String(f).endsWith('.wxml')
        );
        expect(hit).toBeTruthy();
        return read(String(hit));
      };

      const aWxml = await wxmlOf('entry-a');
      const bWxml = await wxmlOf('entry-b');

      // A 的模板必须存在（改造前这里直接是 0，内容整个丢了）
      expect(aWxml).toContain('A-input');
      expect(aWxml).not.toContain('B-input');

      // B 的模板必须是 B 自己的
      expect(bWxml).toContain('B-input');
      expect(bWxml).not.toContain('A-input');

      // 两个 entry 的模板不能是同一份
      expect(aWxml).not.toBe(bWxml);
    }, 180000);
  });
});
