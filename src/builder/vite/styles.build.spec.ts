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
import { executeOnceShared } from '../../../test/util/shared-build';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

/**
 * 样式产出集成验证：全局样式 → app.wxss，组件 styleUrls / 内联 styles → 各自 wxss。
 *
 * ## 为什么要单独钉住
 *
 * `CustomStyleSheetProcessor` 把编译结果存进自己的 `styleMap`，
 * 返回给调用方的 `contents` 是**故意置空**的（组件 JS 不内联样式）。
 * 消费侧一旦去读返回值而不是 styleMap，拿到的就是空串：
 * 构建照样绿，产物里所有 .wxss 全是 0 字节，只有跑到页面上才发现没样式。
 *
 * 内联样式（`@Component.styles`）踩的正是同一个坑的另一半：ngtsc 把它存在
 * `analysis.inlineStyles`，而 `analysis.styleUrls` 里一个字都没有，
 * 只看 styleUrls 的构建器会把它整个丢掉 —— 产物里那个 wxss 存在但是空的。
 *
 * 所以这里断言的是**「产物里有编译后的内容」**，而不是「构建成功」。
 */

/** 构建一次，多个用例复用同一份产物（sandbox 随用例销毁，产物先读进内存） */
function memoize<T>(fn: () => Promise<T>) {
  let promise: Promise<T> | undefined;
  return () => (promise = promise ?? fn());
}

describeBuilder(runViteBuilder, BROWSER_BUILDER_INFO, (harness) => {
  const setupBase = async () => {
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
          'pages/styled/styled-entry',
          'pages/inline/inline-entry',
          'pages/inline-scss/inline-scss-entry',
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

  /** 组件装饰器里那段数组的公共外壳 */
  const componentFile = (opts: {
    className: string;
    selector: string;
    template: string;
    styleField: string;
  }) =>
    [
      "import { Component } from '@angular/core';",
      "import { CommonModule } from '@angular/common';",
      '@Component({',
      '  standalone: true,',
      '  imports: [CommonModule],',
      `  selector: '${opts.selector}',`,
      `  template: '${opts.template}',`,
      opts.styleField,
      '})',
      `export class ${opts.className} {}`,
      '',
    ].join('\n');

  const writeFixtures = async () => {
    await write(
      'src/styles.css',
      'page { background: #f5f6f8; }\n.global-card { padding: 24rpx; }\n',
    );
    await write(
      'src/pages/styled/styled.component.scss',
      '.styled {\n  color: red;\n  &__title {\n    font-size: 40rpx;\n  }\n}\n',
    );
    await write(
      'src/pages/styled/styled.component.ts',
      componentFile({
        className: 'StyledComponent',
        selector: 'app-styled',
        template:
          '<view class="styled"><text class="styled__title">t</text></view>',
        styleField: [
          "  styleUrls: ['./styled.component.scss'],",
          // 与 styleUrls 共存：两边都要落进同一个 wxss，不是二选一
          "  styles: ['.styled--inline { color: #123456; }'],",
        ].join('\n'),
      }),
    );
    await write(
      'src/pages/styled/styled.entry.ts',
      "export { StyledComponent as default } from './styled.component';\n",
    );

    // 内联样式：两条，验「多条都要落进去」
    await write(
      'src/pages/inline/inline.component.ts',
      componentFile({
        className: 'InlineComponent',
        selector: 'app-inline',
        template:
          '<view class="inline"><text class="inline__title">t</text></view>',
        styleField: [
          '  styles: [',
          "    '.inline { color: blue; }',",
          "    '.inline__title { font-size: 30rpx; }',",
          '  ],',
        ].join('\n'),
      }),
    );
    await write(
      'src/pages/inline/inline.entry.ts',
      "export { InlineComponent as default } from './inline.component';\n",
    );

    // 内联样式写 scss：只有 inlineStyleLanguage 传到位才编得出来
    await write(
      'src/pages/inline-scss/inline-scss.component.ts',
      componentFile({
        className: 'InlineScssComponent',
        selector: 'app-inline-scss',
        template:
          '<view class="scss"><text class="scss__title">t</text></view>',
        styleField: [
          '  styles: [',
          "    '.scss { color: red; &__title { font-size: 28rpx; } }',",
          '  ],',
        ].join('\n'),
      }),
    );
    await write(
      'src/pages/inline-scss/inline-scss.entry.ts',
      "export { InlineScssComponent as default } from './inline-scss.component';\n",
    );
  };

  const build = async (overrides: Record<string, unknown> = {}) => {
    const result = await executeOnceShared(harness, 'build', {
      tsConfig: 'src/tsconfig.app.json',
      outputPath: 'dist/vite-styles',
      main: DEFAULT_ANGULAR_CONFIG.main,
      pages: DEFAULT_ANGULAR_CONFIG.pages,
      styles: DEFAULT_ANGULAR_CONFIG.styles,
      assets: DEFAULT_ANGULAR_CONFIG.assets.filter(
        (a) => a.glob !== 'app.json',
      ),
      appJson: 'src/app.config.json',
      platform: PlatformType.wx,
      sourceMap: false,
      ...overrides,
    });
    if (!result.result?.success) {
      const errLogs = (result.logs || [])
        .filter((l: { level: string }) => l.level === 'error')
        .map((l: { message?: string }) => String(l.message));
      throw new Error(`构建失败: ${errLogs.join(' ~~ ').slice(0, 4000)}`);
    }
  };

  /**
   * 默认参数那一次构建：全局样式 / styleUrls / 内联 css 三条用例共用。
   *
   * 每个用例跑完 sandbox 会被 restore，所以产物必须在第一次就全读进内存。
   */
  const load = memoize(async () => {
    await setupBase();
    await writeFixtures();
    await build();

    return {
      appWxss: await readOutput('dist/vite-styles/app.wxss'),
      styledWxss: await readOutput(
        'dist/vite-styles/pages/styled/styled-entry.wxss',
      ),
      inlineWxss: await readOutput(
        'dist/vite-styles/pages/inline/inline-entry.wxss',
      ),
    };
  });

  /**
   * `inlineStyleLanguage: 'scss'` 那一次。
   *
   * 语言选项是全局的，跟默认（css）那次共用不了产物，只能再建一遍。
   * 不钉这条的话，「选项声明了但没往下传」这种问题永远测不出来 ——
   * scss 嵌套当 css 编，esbuild 不报错，只是那条规则整个消失。
   */
  const loadScss = memoize(async () => {
    await setupBase();
    await writeFixtures();
    await build({
      inlineStyleLanguage: 'scss',
      outputPath: 'dist/vite-styles-scss',
    });

    return {
      inlineWxss: await readOutput(
        'dist/vite-styles-scss/pages/inline-scss/inline-scss-entry.wxss',
      ),
    };
  });

  it('全局 styles 编译进 app.wxss（非空、且是编译后的 css）', async () => {
    const { appWxss } = await load();
    expect(appWxss).toContain('page{background:#f5f6f8}');
    expect(appWxss).toContain('.global-card{padding:24rpx}');
  }, 300000);

  it('组件 styleUrls 编译进组件自己的 wxss（scss 嵌套被展开）', async () => {
    const { styledWxss } = await load();
    expect(styledWxss).toContain('.styled{color:red}');
    expect(styledWxss).toContain('.styled__title{font-size:40rpx}');
  }, 300000);

  it('styleUrls 与内联 styles 共存时两份都在', async () => {
    const { styledWxss } = await load();
    expect(styledWxss).toContain('.styled{color:red}');
    expect(styledWxss).toContain('.styled--inline{color:#123456}');
  }, 300000);

  it('组件内联 styles 编译进组件自己的 wxss（多条都要在）', async () => {
    const { inlineWxss } = await load();
    expect(inlineWxss).toContain('.inline{color:#00f}');
    expect(inlineWxss).toContain('.inline__title{font-size:30rpx}');
  }, 300000);

  it('内联样式按 inlineStyleLanguage 编译（scss 嵌套被展开）', async () => {
    const { inlineWxss } = await loadScss();
    expect(inlineWxss).toContain('.scss{color:red}');
    expect(inlineWxss).toContain('.scss__title{font-size:28rpx}');
  }, 300000);
});
