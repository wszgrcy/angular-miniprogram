import { subpackageChunkPlugin } from './subpackage-chunk.plugin';

/**
 * 分包校验插件的单元级验证（不走真实构建，直接喂 bundle）。
 *
 * 集成用例见 `src/builder/vite/subpackage.build.spec.ts`，这里补的是
 * 「路径归一化」这类只有直接控制 moduleIds 才能覆盖的分支。
 */
interface FakeChunk {
  type: 'chunk';
  fileName: string;
  moduleIds: string[];
  imports: string[];
}

/** 跑一次 generateBundle，返回校验错误信息（没报错返回 '<no error>'） */
function runGenerateBundle(
  sourceRoot: string,
  bundle: Record<string, FakeChunk>
): string {
  const plugin = subpackageChunkPlugin({
    appConfig: {
      pages: [],
      subpackages: [
        { root: 'packageA', pages: [] },
        { root: 'packageB', pages: [], independent: true },
      ],
    },
    sourceRoot,
  });
  const generateBundle = (
    plugin as unknown as {
      generateBundle: (
        this: { error: (msg: string) => void },
        opts: unknown,
        bundle: unknown
      ) => void;
    }
  ).generateBundle;

  let message = '<no error>';
  const ctx = {
    error(msg: string) {
      message = msg;
      // this.error 语义是「抛出」，这里照抛，模拟 bundler 中断
      throw new Error(msg);
    },
  };
  try {
    generateBundle.call(ctx, {}, bundle);
  } catch (e) {
    void e;
  }
  return message;
}

/** 跨分包：packageB 的 chunk require 了落在 packageA 的共享 chunk */
const CROSS_SUBPACKAGE_BUNDLE: Record<string, FakeChunk> = {
  'packageB/pages/sub-b/sub-b-entry.js': {
    type: 'chunk',
    fileName: 'packageB/pages/sub-b/sub-b-entry.js',
    moduleIds: ['ROOT/src/packageB/pages/sub-b/sub-b.entry.ts'],
    imports: ['packageA/sub-page.component-abc.js'],
  },
  'packageA/sub-page.component-abc.js': {
    type: 'chunk',
    fileName: 'packageA/sub-page.component-abc.js',
    moduleIds: ['ROOT/src/packageA/pages/sub-page/sub-page.component.ts'],
    imports: [],
  },
};

const withDrive = (drive: string) =>
  mapBundleIds(CROSS_SUBPACKAGE_BUNDLE, (id) =>
    id.replace('ROOT', `${drive}:/proj`)
  );

function mapBundleIds(
  bundle: Record<string, FakeChunk>,
  fn: (id: string) => string
): Record<string, FakeChunk> {
  const out: Record<string, FakeChunk> = {};
  for (const [name, chunk] of Object.entries(bundle)) {
    out[name] = { ...chunk, moduleIds: chunk.moduleIds.map(fn) };
  }
  return out;
}

describe('subpackageChunkPlugin: 跨分包校验', () => {
  const SOURCE_ROOT_WIN = 'C:\\proj\\src';

  it('同大小写盘符：跨分包静态依赖被拦截', () => {
    const msg = runGenerateBundle(SOURCE_ROOT_WIN, withDrive('C'));
    expect(msg).toContain('跨分包静态依赖');
    expect(msg).toContain('packageB');
    expect(msg).toContain('packageA/sub-page.component-abc.js');
  });

  it('moduleIds 盘符大小写与 sourceRoot 不一致时，仍能拦截', () => {
    // Windows 下 getSystemPath 给大写盘符，bundler 回传可能是小写。
    // 归一化前这里会静默放行（分包白拆 + 校验漏报）。
    const msg = runGenerateBundle(SOURCE_ROOT_WIN, withDrive('c'));
    expect(msg).toContain('跨分包静态依赖');
  });

  it('同分包内部依赖不报错', () => {
    const msg = runGenerateBundle(SOURCE_ROOT_WIN, {
      'packageA/pages/a1/a1-entry.js': {
        type: 'chunk',
        fileName: 'packageA/pages/a1/a1-entry.js',
        moduleIds: ['C:/proj/src/packageA/pages/a1/a1.entry.ts'],
        imports: ['packageA/shared-comp-abc.js'],
      },
      'packageA/shared-comp-abc.js': {
        type: 'chunk',
        fileName: 'packageA/shared-comp-abc.js',
        moduleIds: ['C:/proj/src/packageA/shared/comp.ts'],
        imports: [],
      },
    });
    expect(msg).toBe('<no error>');
  });

  it('独立分包依赖主包 chunk 被拦截', () => {
    const msg = runGenerateBundle(SOURCE_ROOT_WIN, {
      'packageB/pages/b1/b1-entry.js': {
        type: 'chunk',
        fileName: 'packageB/pages/b1/b1-entry.js',
        moduleIds: ['C:/proj/src/packageB/pages/b1/b1.entry.ts'],
        imports: ['utils-abc.js'],
      },
      'utils-abc.js': {
        type: 'chunk',
        fileName: 'utils-abc.js',
        moduleIds: ['C:/proj/src/utils/util.ts'],
        imports: [],
      },
    });
    expect(msg).toContain('独立分包');
  });

  it('模块横跨分包与主包的混合 chunk 不参与判定（不误报）', () => {
    const msg = runGenerateBundle(SOURCE_ROOT_WIN, {
      'mixed-abc.js': {
        type: 'chunk',
        fileName: 'mixed-abc.js',
        moduleIds: [
          'C:/proj/src/packageB/pages/b1/b1.component.ts',
          'C:/proj/src/utils/util.ts',
        ],
        imports: ['packageA/shared-comp-abc.js'],
      },
      'packageA/shared-comp-abc.js': {
        type: 'chunk',
        fileName: 'packageA/shared-comp-abc.js',
        moduleIds: ['C:/proj/src/packageA/shared/comp.ts'],
        imports: [],
      },
    });
    expect(msg).toBe('<no error>');
  });
});
