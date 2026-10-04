import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  isExternalSpecifier,
  mergeDefine,
  resolveCssPreprocessorOptions,
  resolveOptimization,
  resolveOutputNames,
  resolveSourcemap,
  toAbsoluteFileReplacements,
} from './options';

describe('resolveOptimization', () => {
  it('未配置 / false：不压缩、按 development', () => {
    expect(resolveOptimization(undefined)).toEqual({
      isProduction: false,
      minifyScripts: false,
      minifyStyles: false,
    });
    expect(resolveOptimization(false).isProduction).toBe(false);
  });

  it('true：production 且 js / css 都压', () => {
    expect(resolveOptimization(true)).toEqual({
      isProduction: true,
      minifyScripts: true,
      minifyStyles: true,
    });
  });

  /**
   * 回归：以前是 `!!options.optimization`，对象写法恒为真，
   * 「想关压缩」反而开了压缩。
   */
  it('对象形态按子项取值，不再被真值判断一把梭', () => {
    expect(resolveOptimization({ scripts: false, styles: false })).toEqual({
      isProduction: true,
      minifyScripts: false,
      minifyStyles: false,
    });
    expect(
      resolveOptimization({ scripts: true, styles: { minify: false } }),
    ).toEqual({
      isProduction: true,
      minifyScripts: true,
      minifyStyles: false,
    });
  });
});

describe('resolveSourcemap', () => {
  it('布尔形态直接透传', () => {
    expect(resolveSourcemap(undefined)).toBe(false);
    expect(resolveSourcemap(true)).toBe(true);
  });

  it('hidden 优先（vite 的 build.sourcemap 认 hidden）', () => {
    expect(resolveSourcemap({ scripts: true, hidden: true })).toBe('hidden');
  });

  it('scripts / styles 取并集', () => {
    expect(resolveSourcemap({ scripts: true, styles: false })).toBe(true);
    expect(resolveSourcemap({ scripts: false, styles: false })).toBe(false);
  });
});

describe('resolveOutputNames', () => {
  it('默认（none）不带 hash —— 小程序没有 HTTP 缓存', () => {
    expect(resolveOutputNames()).toEqual({
      chunkFileNames: '[name].js',
      assetFileNames: '[name].[ext]',
    });
  });

  it('all 两边都 hash，bundles 只 hash chunk，media 只 hash 资源', () => {
    expect(resolveOutputNames('all')).toEqual({
      chunkFileNames: '[name]-[hash].js',
      assetFileNames: '[name]-[hash].[ext]',
    });
    expect(resolveOutputNames('bundles').chunkFileNames).toContain('[hash]');
    expect(resolveOutputNames('bundles').assetFileNames).not.toContain('[hash]');
    expect(resolveOutputNames('media').chunkFileNames).not.toContain('[hash]');
    expect(resolveOutputNames('media').assetFileNames).toContain('[hash]');
  });
});

describe('isExternalSpecifier', () => {
  it('包名连子路径一起算外部（与 @angular/build 同语义）', () => {
    expect(isExternalSpecifier('@foo/bar', ['@foo/bar'])).toBe(true);
    expect(isExternalSpecifier('@foo/bar/baz', ['@foo/bar'])).toBe(true);
    expect(isExternalSpecifier('@foo/barby', ['@foo/bar'])).toBe(false);
    expect(isExternalSpecifier('rxjs', ['@foo/bar'])).toBe(false);
  });
});

describe('mergeDefine', () => {
  it('用户 define 进得来，但平台 define 优先', () => {
    const merged = mergeDefine(
      { __MY_FLAG__: 'true', wx: '"hacked"' },
      { wx: 'globalThis', __MP_WX__: 'true' },
    );
    expect(merged.__MY_FLAG__).toBe('true');
    expect(merged.__MP_WX__).toBe('true');
    expect(merged.wx).toBe('globalThis');
  });

  it('没配用户 define 时只剩平台的', () => {
    expect(mergeDefine(undefined, { a: '1' })).toEqual({ a: '1' });
  });
});

describe('resolveCssPreprocessorOptions', () => {
  it('什么都没配返回空对象，不干预 vite 默认', () => {
    expect(resolveCssPreprocessorOptions(undefined, '/w')).toEqual({});
    expect(
      resolveCssPreprocessorOptions({ includePaths: [] }, '/w'),
    ).toEqual({});
  });

  it('includePaths 相对 workspaceRoot 绝对化，scss / sass 两份都给', () => {
    const result = resolveCssPreprocessorOptions(
      { includePaths: ['src/styles', '../shared'] },
      '/w/proj',
    );
    expect(result.scss?.includePaths).toEqual([
      path.resolve('/w/proj/src/styles'),
      path.resolve('/w/proj/../shared'),
    ]);
    expect(result.sass).toEqual(result.scss);
  });

  it('sass 子项（fatalDeprecations 等）透传', () => {
    const result = resolveCssPreprocessorOptions(
      { sass: { fatalDeprecations: ['import'] } },
      '/w',
    );
    expect(result.scss?.fatalDeprecations).toEqual(['import']);
  });
});

describe('toAbsoluteFileReplacements', () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-opts-'));
  const src = path.join(workspace, 'src/environment.ts');
  const prod = path.join(workspace, 'src/environment.prod.ts');
  fs.mkdirSync(path.dirname(src), { recursive: true });
  fs.writeFileSync(src, 'export const e = {};');
  fs.writeFileSync(prod, 'export const e = {};');

  it('空配置返回空数组', () => {
    expect(toAbsoluteFileReplacements(undefined, workspace)).toEqual([]);
  });

  it('replace/with 与老的 src/replaceWith 两种写法都归一成绝对路径', () => {
    const [first] = toAbsoluteFileReplacements(
      [
        {
          replace: 'src/environment.ts',
          with: 'src/environment.prod.ts',
        },
      ],
      workspace,
    );
    expect(first).toEqual({ replace: src, with: prod });

    const [legacy] = toAbsoluteFileReplacements(
      [
        {
          src: 'src/environment.ts',
          replaceWith: 'src/environment.prod.ts',
        },
      ],
      workspace,
    );
    expect(legacy).toEqual({ replace: src, with: prod });
  });

  it('路径写错当场报错，而不是静默不生效', () => {
    expect(() =>
      toAbsoluteFileReplacements(
        [{ replace: 'src/nope.ts', with: 'src/environment.prod.ts' }],
        workspace,
      ),
    ).toThrow(/does not exist/);
  });
});
