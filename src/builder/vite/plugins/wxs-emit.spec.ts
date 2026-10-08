import { emitWxs } from './mini-program-assets.plugin';

/**
 * wxs 落盘 + watch 登记。wxs 不是 ES module，没有任何 import 指向它，Vite 的模块图看不见。
 * 不显式 addWatchFile 的话，watch 模式下改 .wxs 不会触发重建。
 */
describe('wxs 落盘: emitWxs', () => {
  const run = (resolved: {
    wxsSources?: Map<string, string>;
    wxsSourceFiles?: string[];
  }) => {
    const emitted: Array<[string, string]> = [];
    const watched: string[] = [];
    emitWxs(
      resolved,
      (f, s) => emitted.push([f, s]),
      (p) => watched.push(p),
    );
    return { emitted, watched };
  };

  it('每个 wxs 源都落盘一次', () => {
    const { emitted } = run({
      wxsSources: new Map([
        ['pages/a/util.wxs', 'module.exports = {}'],
        ['pages/a/fmt.wxs', 'module.exports = {}'],
      ]),
    });
    expect(emitted.length).toBe(2);
    expect(emitted.map(([f]) => f)).toEqual([
      'pages/a/util.wxs',
      'pages/a/fmt.wxs',
    ]);
  });

  it('源内容原样写出，不做转译', () => {
    const src = 'var a = 1;\nmodule.exports.a = a;';
    const { emitted } = run({
      wxsSources: new Map([['pages/a/u.wxs', src]]),
    });
    expect(emitted[0][1]).toBe(src);
  });

  it('每个源文件都登记为 watch 依赖', () => {
    const { watched } = run({
      wxsSources: new Map([['pages/a/u.wxs', 'x']]),
      wxsSourceFiles: ['/abs/pages/a/u.wxs'],
    });
    expect(watched).toEqual(['/abs/pages/a/u.wxs']);
  });

  it('多源时落盘与 watch 一一对应', () => {
    const { emitted, watched } = run({
      wxsSources: new Map([
        ['p/a.wxs', '1'],
        ['p/b.wxs', '2'],
        ['p/c.wxs', '3'],
      ]),
      wxsSourceFiles: ['/x/a.wxs', '/x/b.wxs', '/x/c.wxs'],
    });
    expect(emitted.length).toBe(3);
    expect(watched.length).toBe(3);
  });

  it('没有 wxs 时两个通道都不触发', () => {
    const { emitted, watched } = run({});
    expect(emitted.length).toBe(0);
    expect(watched.length).toBe(0);
  });

  it('有产物但漏了 watch 列表 -> 不崩（但这是该修的漏配）', () => {
    const { emitted, watched } = run({
      wxsSources: new Map([['p/a.wxs', '1']]),
    });
    expect(emitted.length).toBe(1);
    expect(watched.length).toBe(0);
  });
});
