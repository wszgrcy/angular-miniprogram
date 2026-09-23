import { join, normalize } from '@angular-devkit/core';
import {
  MyTestProjectHost,
  describeBuilder,
  setWorkspaceRoot,
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
  buildOptimizer: true,
  optimization: true,
  extractLicenses: true,
};

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-prod', () => {
    it('运行', async () => {
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
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result).toBeTruthy();
      expect(result.error).toBeFalsy();
      // 不能写 logs[0].level !== 'error'：
      // 1. Vite 链路可能一条日志都不产生，logs[0] 直接 undefined
      // 2. 就算有，只看第一条也漏掉了后面的 error
      // 本意是「构建过程没有报错」，那就该查全部。
      const errorLogs = result.logs.filter((l) => l.level === 'error');
      expect({ errorLogs: errorLogs.map((l) => l.value) }).toEqual({
        errorLogs: [],
      });
      expect(result.result?.success).toBeTruthy();
    });
  });
});
