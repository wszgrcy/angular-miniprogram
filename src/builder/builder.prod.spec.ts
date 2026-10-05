import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
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
        normalize(join(root, 'src', '__pages')),
      );
      list.push(
        ...(await myTestProjectHost.getFileList(
          normalize(join(root, 'src', '__components')),
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

/**
 * 生产构建下的 wxs 剥离回归。
 *
 * ## 复现的坑
 *
 * wxs（渲染层脚本）的绑定应该被分析层从 Angular 模板里剥掉，只留在 wxml：
 * 逻辑层 js 里只应该看到「枝叶数组」属性（`[__wxXXXXXX]="[price()]"`），
 * **不该**出现 `fmt.money(...)` 这种逻辑层去调 wxs 的鬼东西（运行时根本没有 `fmt`）。
 *
 * 但 `fileReplacements` 非空时（生产配置里几乎必然带 environment 替换），
 * analog 才会注册它的 `rollup-plugin-replace-files`（也是 `enforce: 'pre'`）。
 * 它和 `mini-program:wxs-strip` 的 resolveId 会互相把对方顶空：两个都返回 null，
 * vite 退回默认解析 = 原组件文件，于是 Angular 那份**没剥离**的模板被编进 js
 * （wxml 却还是对的，所以只表现为「js 里混进了 wxs」）。
 * dev 没有 environment 替换 ⇒ 插件根本没注册 ⇒ 全绿，只有 `build:prod` 会碎。
 *
 * 所以这个用例的关键不是「跑个 prod」，而是 **prod + fileReplacements 同时在场**。
 */

const WXS_SCRIPT = `var CURRENCY = '¥';
function money(v) {
  var n = parseFloat(v);
  return isNaN(n) ? '--' : CURRENCY + n.toFixed(2);
}
function cls(base, on) {
  return on ? base + ' ' + base + '--on' : base;
}
module.exports = { money: money, cls: cls };
`;

/** `NO_ERRORS_SCHEMA` 是必需的：`<wxs>` 和 `fmt.xxx` 都不是 Angular 的东西 */
const WXS_TEMPLATE = `<wxs module="fmt" src="./format.wxs"></wxs>
<view class="page">
  <text>money = {{ fmt.money(price()) }}</text>
  <text>{{ fmt.money(price()) + ' 元' }}</text>
  <view [class]="fmt.cls('box', on())">class 下推</view>
  <button (tap)="toggle()">切换</button>
</view>
`;

const WXS_COMPONENT = `import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-wxs-probe',
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './wxs-probe.component.html',
})
export class WxsProbeComponent {
  price = signal(1234.5);
  on = signal(false);
  toggle() {
    this.on.update((v) => !v);
  }
}
`;

describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('builder-prod: wxs 剥离（prod + fileReplacements 同时在场）', () => {
    it('wxs 调用留在渲染层，不该被编进逻辑层 js', async () => {
      const root = harness.host.root();
      const myTestProjectHost = new MyTestProjectHost(harness.host);

      const list = await myTestProjectHost.getFileList(
        normalize(join(root, 'src', '__pages')),
      );
      list.push(
        ...(await myTestProjectHost.getFileList(
          normalize(join(root, 'src', '__components')),
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

      // 入口由 pages 的 glob（`**/*.entry.ts`）收，不用动 app.json
      await harness.writeFile('src/pages/wxs-probe/format.wxs', WXS_SCRIPT);
      await harness.writeFile(
        'src/pages/wxs-probe/wxs-probe.component.html',
        WXS_TEMPLATE,
      );
      await harness.writeFile(
        'src/pages/wxs-probe/wxs-probe.component.ts',
        WXS_COMPONENT,
      );
      await harness.writeFile(
        'src/pages/wxs-probe/wxs-probe.entry.ts',
        `export { WxsProbeComponent as default } from './wxs-probe.component';\n`,
      );

      harness.useTarget('build', {
        ...angularConfig,
        outputPath: 'dist/prod-wxs',
        // 就是这一行把坑踩出来的：替换表非空 ⇒ analog 注册 replace-files 插件
        fileReplacements: [
          {
            replace: 'src/environments/environment.ts',
            with: 'src/environments/environment.prod.ts',
          },
        ],
      });
      const result = await harness.executeOnce();
      const errorLogs = result.logs.filter((l) => l.level === 'error');
      expect({ errorLogs: errorLogs.map((l) => l.value) }).toEqual({
        errorLogs: [],
      });
      expect(result.result?.success).toBeTruthy();

      const base = String(result.result!.baseOutputPath);
      const entryJs = fs.readFileSync(
        path.join(base, 'pages/wxs-probe/wxs-probe-entry.js'),
        'utf8',
      );

      // 1. 逻辑层 js 不该有任何 `fmt.xxx(` 调用（模板没被剥离的直接症状）
      expect(entryJs).not.toMatch(/\bfmt\.\w+\s*\(/);
      // 2. 这份 js 必须是 AOT 编过的。退回原文件时 analog 不产出模板，
      //    vite 只把裸 TS 转译一遍，`templateUrl` 装饰器会原样留在产物里
      //    （小程序里没有运行时编译器，也没有 .html，必碎）。
      expect(entryJs).not.toContain('templateUrl');
      // 3. 剥离后的正确形态：枝叶数组属性 `__wxXXXXXX`
      expect(entryJs).toMatch(/__wx[0-9a-z]{4,}/);

      // 渲染层那半边照旧，顺手把整条链路钉住
      const entryWxml = fs.readFileSync(
        path.join(base, 'pages/wxs-probe/wxs-probe-entry.wxml'),
        'utf8',
      );
      expect(entryWxml).toContain('<wxs module="fmt" src="/common/fmt.wxs"/>');
      expect(entryWxml).toContain('fmt.money(');
      expect(fs.existsSync(path.join(base, 'common', 'fmt.wxs'))).toBe(true);
    });
  });
});
