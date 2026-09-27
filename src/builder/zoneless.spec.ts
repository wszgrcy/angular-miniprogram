import { normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
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
// 主测试链路已切到 Vite builder（webpack 链路待删除）
import { PlatformType } from './platform/platform';
import { runViteBuilder as runBuilder } from './vite';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  sourceMap: false,
};

/** 递归收集目录下所有 js 文件内容 */
function collectJs(basePath: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const entry of fs.readdirSync(basePath, { withFileTypes: true })) {
    const full = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      for (const [k, v] of collectJs(full)) {
        result.set(k, v);
      }
    } else if (entry.name.endsWith('.js')) {
      result.set(full, fs.readFileSync(full, 'utf8'));
    }
  }
  return result;
}

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('zoneless', () => {
    it('构建产物不应该包含 zone.js', async () => {
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
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result.error).toBeFalsy();
      expect(result.result?.success).toBeTruthy();

      const realTestPath: string = result.result?.baseOutputPath as string;
      const files = collectJs(realTestPath);
      const all = [...files.values()].join('\n');

      expect(files.size).toBeGreaterThan(0);
      // 不应该有 zone.js 相关的产物文件
      for (const filePath of files.keys()) {
        expect(path.basename(filePath)).not.toMatch(/zone(\.js)?$/);
      }
      // zone.js 运行时的特征符号，产物里不应该出现
      expect(all).not.toContain('__zone_symbol__');
      expect(all).not.toContain('zone.js/dist');
      // 应该使用 zoneless 的调度器实现
      expect(all).toContain('ChangeDetectionSchedulerImpl');
    });
  });
});
