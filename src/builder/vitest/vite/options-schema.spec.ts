import { PlatformType } from '../../platform/platform';
import { parseVitestBuilderOptions } from './options-schema';

/**
 * vitest builder 的选项解析。重点不是「能不能解析」，而是两条链路的同名选项
 * 是不是同一份形状：默认值必须和 application 那边对得上，
 * 而 port / outputPath 这类「缺省值由别的逻辑决定」的字段不能被补出来。
 */

const MINIMAL = { main: 'src/test.ts', tsConfig: 'src/tsconfig.spec.json' };

describe('parseVitestBuilderOptions', () => {
  it('与 application 共用的字段拿到同一套默认值', () => {
    const options = parseVitestBuilderOptions(MINIMAL);
    expect(options.platform).toBe(PlatformType.wx);
    expect(options.pages).toEqual([]);
    expect(options.assets).toEqual([]);
    expect(options.appJsonValidate).toBe('error');
    expect(options.deriveCondition).toBe(false);
    expect(options.watch).toBe(false);
    expect(options.dedupe).toEqual([]);
  });

  it('测试链路自己的默认值：sourceMap 开、exclude 空', () => {
    const options = parseVitestBuilderOptions(MINIMAL);
    expect(options.sourceMap).toBe(true);
    expect(options.exclude).toEqual([]);
  });

  it('port / clientHost / outputPath 不补默认值，缺省交给各自的推导逻辑', () => {
    const options = parseVitestBuilderOptions(MINIMAL);
    expect(options.port).toBeUndefined();
    expect(options.clientHost).toBeUndefined();
    expect(options.outputPath).toBeUndefined();
  });

  it('main / tsConfig 缺一个都过不了，报错带字段名', () => {
    let message = '';
    try {
      parseVitestBuilderOptions({});
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('main');
    expect(message).toContain('tsConfig');
  });
});
