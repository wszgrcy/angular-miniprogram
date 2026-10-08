import { PlatformType } from '../platform/platform';
import { parseApplicationOptions } from './options-schema';

/**
 * 选项解析。schema.json 是从这份形状转出来的，所以这里钉的是「builder 入口拿到的
 * 到底是什么」：默认值补齐、未知键放行、必填缺失的报错能不能定位到字段。
 */

const MINIMAL = { outputPath: 'dist/app', tsConfig: 'src/tsconfig.app.json' };

describe('parseApplicationOptions', () => {
  it('默认值在入口补齐，builder 内部不用再判空', () => {
    const options = parseApplicationOptions(MINIMAL);
    expect(options.platform).toBe(PlatformType.wx);
    expect(options.format).toBe('cjs');
    expect(options.tagNameClass).toBe('mapped');
    expect(options.appJsonValidate).toBe('error');
    expect(options.deleteOutputPath).toBe(true);
    expect(options.deriveCondition).toBe(false);
    expect(options.optimization).toBe(false);
    expect(options.sourceMap).toBe(false);
    expect(options.watch).toBe(false);
    expect(options.outputHashing).toBe('none');
    expect(options.pages).toEqual([]);
    expect(options.assets).toEqual([]);
    expect(options.styles).toEqual([]);
    expect(options.externalDependencies).toEqual([]);
  });

  it('子对象的默认值一起补（output 缺了会让 path.join 直接抛）', () => {
    const options = parseApplicationOptions({
      ...MINIMAL,
      assets: [{ glob: '**/*.json', input: 'src' }],
      styles: [{ input: 'src/styles.scss' }],
    });
    expect(options.assets?.[0]).toMatchObject({
      output: '',
      followSymlinks: false,
    });
    expect(options.styles?.[0]).toMatchObject({ inject: true });
  });

  /**
   * devkit 会把它那份 schema 的键连默认值一起塞过来，本包没声明的键（以及测试
   * harness 那份老 schema 里的化石字段）不能当成用户配错了。
   */
  it('未知键原样放行，不当成错误', () => {
    const options = parseApplicationOptions({
      ...MINIMAL,
      aot: true,
      vendorChunk: false,
      index: undefined,
    });
    expect(options).toMatchObject({ aot: true, vendorChunk: false });
  });

  it('polyfills 串 / 数组两种写法都收', () => {
    expect(
      parseApplicationOptions({
        ...MINIMAL,
        polyfills: '@angular/localize/init',
      }).polyfills,
    ).toBe('@angular/localize/init');
    expect(
      parseApplicationOptions({ ...MINIMAL, polyfills: ['zone.js'] }).polyfills,
    ).toEqual(['zone.js']);
  });

  it('必填缺失：报错带字段路径，并且一次列全', () => {
    let message = '';
    try {
      parseApplicationOptions({ main: 'src/main.ts' });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('outputPath');
    expect(message).toContain('tsConfig');
  });

  it('形状错误定位到具体那一项', () => {
    expect(() =>
      parseApplicationOptions({ ...MINIMAL, styles: ['src/styles.wxss'] }),
    ).toThrow(/styles\[0]/);
    expect(() =>
      parseApplicationOptions({
        ...MINIMAL,
        subpackages: [{ glob: '**/*.entry.ts', input: 'src/pages' }],
      }),
    ).toThrow(/subpackages\[0]\.output/);
  });

  it('library 是构建器内部伪平台，用户配不进来', () => {
    expect(() =>
      parseApplicationOptions({ ...MINIMAL, platform: PlatformType.library }),
    ).toThrow(/platform/);
  });

  it('optimization 对象写法按子项补默认，与上游口径一致', () => {
    expect(
      parseApplicationOptions({ ...MINIMAL, optimization: {} }).optimization,
    ).toEqual({ scripts: true, styles: true });
  });
});
