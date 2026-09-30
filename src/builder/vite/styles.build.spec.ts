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
import { runViteBuilder } from './index';

/**
 * 样式产出集成验证：全局样式 → app.wxss，组件 styleUrls → 各自 wxss。
 *
 * ## 为什么要单独钉住
 *
 * `CustomStyleSheetProcessor` 把编译结果存进自己的 `styleMap`，
 * 返回给调用方的 `contents` 是**故意置空**的（组件 JS 不内联样式）。
 * 消费侧一旦去读返回值而不是 styleMap，拿到的就是空串：
 * 构建照样绿，产物里所有 .wxss 全是 0 字节，只有跑到页面上才发现没样式。
 *
 * 这条链路原先没有任何断言覆盖，所以在这里补上——关键是断言
 * **「产物里有编译后的内容」**，而不是「构建成功」。
 */
describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupBase = async (extraPages: string[] = []) => {
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
    await write(
      'src/app.config.json',
      JSON.stringify({
        pages: [
          ...ALL_PAGE_NAME_LIST.map((n) => `pages/${n}/${n}-entry`),
          ...extraPages,
        ],
      }),
    );
  };

  const write = async (rel: string, content: string) => {
    await harness.host
      .write(
        join(harness.host.root(), rel),
        virtualFs.stringToFileBuffer(content),
      )
      .toPromise();
  };

  const readOutput = async (rel: string) =>
    virtualFs.fileBufferToString(
      await harness.host.read(join(harness.host.root(), rel)).toPromise(),
    );

  const build = async () => {
    harness.useTarget('build', {
      tsConfig: 'src/tsconfig.app.json',
      outputPath: 'dist/vite-styles',
      main: DEFAULT_ANGULAR_CONFIG.main,
      pages: DEFAULT_ANGULAR_CONFIG.pages,
      components: DEFAULT_ANGULAR_CONFIG.components,
      styles: DEFAULT_ANGULAR_CONFIG.styles,
      assets: (DEFAULT_ANGULAR_CONFIG.assets as Array<{ glob: string }>).filter(
        (a) => a.glob !== 'app.json',
      ),
      appJson: 'src/app.config.json',
      platform: PlatformType.wx,
      sourceMap: false,
    } as never);
    const result = await harness.executeOnce();
    if (!result.result?.success) {
      const errLogs = (result.logs || [])
        .filter((l: { level: string }) => l.level === 'error')
        .map((l: { message?: unknown }) => String(l.message));
      throw new Error(`构建失败: ${errLogs.join(' ~~ ').slice(0, 4000)}`);
    }
  };

  it('全局 styles 编译进 app.wxss（非空、且是编译后的 css）', async () => {
    await setupBase();
    await write(
      'src/styles.css',
      'page { background: #f5f6f8; }\n.global-card { padding: 24rpx; }\n',
    );
    await build();

    const appWxss = await readOutput('dist/vite-styles/app.wxss');
    expect(appWxss).toContain('page{background:#f5f6f8}');
    expect(appWxss).toContain('.global-card{padding:24rpx}');
  }, 300000);

  it('组件 styleUrls 编译进组件自己的 wxss（scss 嵌套被展开）', async () => {
    await setupBase(['pages/styled/styled-entry']);
    await write(
      'src/pages/styled/styled.component.scss',
      '.styled {\n  color: red;\n  &__title {\n    font-size: 40rpx;\n  }\n}\n',
    );
    await write(
      'src/pages/styled/styled.component.ts',
      [
        "import { Component } from '@angular/core';",
        "import { CommonModule } from '@angular/common';",
        '@Component({',
        '  standalone: true,',
        '  imports: [CommonModule],',
        "  selector: 'app-styled',",
        '  template: \'<view class="styled"><text class="styled__title">t</text></view>\',',
        "  styleUrls: ['./styled.component.scss'],",
        '})',
        'export class StyledComponent {}',
        '',
      ].join('\n'),
    );
    await write(
      'src/pages/styled/styled.entry.ts',
      [
        "import { bootstrapPage } from 'angular-miniprogram';",
        "import { StyledComponent } from './styled.component';",
        'bootstrapPage(StyledComponent);',
        '',
      ].join('\n'),
    );
    await build();

    const wxss = await readOutput(
      'dist/vite-styles/pages/styled/styled-entry.wxss',
    );
    expect(wxss).toContain('.styled{color:red}');
    expect(wxss).toContain('.styled__title{font-size:40rpx}');
  }, 300000);
});
