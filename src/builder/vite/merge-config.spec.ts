import {
  INTERNAL_KEYS,
  type MpConfigObject,
  findMisplacedKeys,
  mergeChanged,
  mergeConfig,
  mergeDerived,
  stripInternalKeys,
  unifySubPackageKey,
} from './merge-config';

describe('merge-config: 只补空', () => {
  it('入参不被修改（返回全新对象）', () => {
    const base = { pages: ['a'], window: { title: 'x' }, n: 1 };
    const snapshot = structuredClone(base);
    const merged = mergeConfig(base, {
      pages: ['a', 'b'],
      window: { other: 1 },
      n: 99,
      tabBar: { list: [] },
    });
    expect(base).toEqual(snapshot);
    expect(merged).not.toBe(base);
  });

  it('base 里已有的标量不动', () => {
    expect(mergeConfig({ style: 'v2' }, { style: 'v1' }).style).toBe('v2');
  });

  it('base 里已有的对象整个不动，不逐字段合并', () => {
    const base = { window: { navigationBarTitleText: '用户写的' } };
    const merged = mergeConfig(base, {
      window: {
        navigationBarTitleText: '构建器的',
        enablePullDownRefresh: true,
      },
    });
    expect(merged.window).toEqual({ navigationBarTitleText: '用户写的' });
  });

  it('base 里已有的数组不动（不在追加名单里的 key）', () => {
    const merged = mergeConfig(
      { plugins: [{ version: '1.0' }] },
      { plugins: [{ version: '2.0' }] },
    );
    expect(merged.plugins).toEqual([{ version: '1.0' }]);
  });

  it('base 里没有的 key 才补进去', () => {
    const merged = mergeConfig(
      { pages: ['a'] },
      { window: {}, lazyCodeLoading: 'x' },
    );
    expect(Object.keys(merged).sort()).toEqual([
      'lazyCodeLoading',
      'pages',
      'window',
    ]);
  });

  it('没见过的 key 原样带过去（不做白名单）', () => {
    const merged = mergeConfig(
      { pages: ['a'] },
      { useExtendedLib: { weui: true }, resizable: true, 未知字段: '原样' },
    );
    expect(merged.useExtendedLib).toEqual({ weui: true });
    expect(merged.resizable).toBe(true);
    expect(merged['未知字段']).toBe('原样');
  });

  it('undefined 的 patch 值不算补写', () => {
    const merged = mergeConfig({ pages: ['a'] }, { window: undefined });
    expect('window' in merged).toBe(false);
  });

  it('补进来的值是深拷贝，改 merged 不会回头改到 patch', () => {
    const patch = { window: { a: 1 } };
    const merged = mergeConfig({}, patch);
    (merged.window as MpConfigObject).a = 2;
    expect(patch.window.a).toBe(1);
  });
});

describe('merge-config: pages 追加', () => {
  it('用户写的在前，构建器扫出来的追加在后面，顺序不变', () => {
    const merged = mergeConfig(
      { pages: ['pages/native/native', 'pages/index/index'] },
      { pages: ['pages/index/index', 'pages/about/about'] },
    );
    expect(merged.pages).toEqual([
      'pages/native/native',
      'pages/index/index',
      'pages/about/about',
    ]);
  });

  it('pages 按 path 去重（对象形态与字符串等价）', () => {
    const merged = mergeConfig(
      { pages: ['a', { path: 'b' }] },
      { pages: [{ path: 'b' }, 'b', 'c'] },
    );
    expect(merged.pages).toEqual(['a', { path: 'b' }, 'c']);
  });

  it('base 没有 pages 时直接取 patch 的', () => {
    expect(mergeConfig({}, { pages: ['a'] }).pages).toEqual(['a']);
  });
});

describe('merge-config: usingComponents', () => {
  it('两边都有时逐子项合并，构建器算出来的路径为准', () => {
    const merged = mergeConfig(
      { usingComponents: { 'keep-me': './keep', 'stale-path': './old' } },
      { usingComponents: { 'stale-path': './new', 'new-one': './new' } },
    );
    expect(merged.usingComponents).toEqual({
      'keep-me': './keep',
      'stale-path': './new',
      'new-one': './new',
    });
  });
});

describe('merge-config: 分包两种写法', () => {
  it('两种写法只出一份：patch 的 subPackages 追加到已有的 subpackages 上', () => {
    const merged = mergeConfig(
      { subpackages: [{ root: 'a' }] },
      { subPackages: [{ root: 'b' }, { root: 'a' }] },
    );
    expect(merged.subpackages).toEqual([{ root: 'a' }, { root: 'b' }]);
    expect(merged.subPackages).toBeUndefined();
  });

  it('base 没写时按 patch 的写法收下', () => {
    expect(
      mergeConfig({}, { subPackages: [{ root: 'b' }] }).subPackages,
    ).toEqual([{ root: 'b' }]);
  });

  it('unifySubPackageKey 统一后只出一份', () => {
    const unified = unifySubPackageKey(
      { subpackages: [{ root: 'a' }], subPackages: [{ root: 'b' }] },
      'subPackages',
    );
    expect(unified.subPackages).toEqual([{ root: 'a' }, { root: 'b' }]);
    expect('subpackages' in unified).toBe(false);
  });

  it('unifySubPackageKey 按 root 去重', () => {
    const unified = unifySubPackageKey(
      { subpackages: [{ root: 'a' }], subPackages: [{ root: 'a' }] },
      'subpackages',
    );
    expect(unified.subpackages).toEqual([{ root: 'a' }]);
  });

  it('两边都没写分包时不凭空生成这个字段', () => {
    expect(
      Object.keys(unifySubPackageKey({ pages: ['a'] }, 'subpackages')),
    ).toEqual(['pages']);
  });
});

describe('merge-config: 构建器补字段', () => {
  it('mergeDerived 能往用户已写的对象里补缺失的子字段', () => {
    const merged = mergeDerived(
      { tabBar: { list: [{ pagePath: 'a' }] } },
      { tabBar: { custom: true } },
    );
    expect(merged.tabBar).toEqual({ list: [{ pagePath: 'a' }], custom: true });
  });

  it('mergeDerived 也不覆盖用户写过的子字段（显式 false 就留着 false）', () => {
    const merged = mergeDerived(
      { tabBar: { custom: false } },
      {
        tabBar: { custom: true },
      },
    );
    expect(merged.tabBar).toEqual({ custom: false });
  });

  it('mergeDerived 同样遵守 pages 追加', () => {
    const merged = mergeDerived({ pages: ['a'] }, { pages: ['a', 'b'] });
    expect(merged.pages).toEqual(['a', 'b']);
  });

  it('mergeChanged 用来判断有没有真的补进东西', () => {
    const base = { pages: ['a'], window: { x: 1 } };
    expect(mergeChanged(base, mergeConfig(base, { pages: ['a'] }))).toBe(false);
    expect(mergeChanged(base, mergeDerived(base, { window: { x: 1 } }))).toBe(
      false,
    );
    expect(mergeChanged(base, mergeConfig(base, { pages: ['b'] }))).toBe(true);
  });
});

describe('merge-config: 内部字段与写错文件提醒', () => {
  it('_platform 永远不进合并结果', () => {
    const merged = mergeConfig(
      { pages: ['a'] },
      { _platform: { wx: { style: 'v2' } } },
    );
    expect(merged._platform).toBeUndefined();
    expect(INTERNAL_KEYS).toContain('_platform');
  });

  it('$schema 只属于源文件，不进产物', () => {
    const stripped = stripInternalKeys({
      $schema: './node_modules/x/app.json',
      pages: ['a'],
    });
    expect(stripped.$schema).toBeUndefined();
    expect(stripped.pages).toEqual(['a']);
    expect(INTERNAL_KEYS).toContain('$schema');
    // 合并链路上两边都会先剥一遍
    expect(
      mergeConfig(stripped, stripInternalKeys({ $schema: './other.json' })),
    ).toEqual({ pages: ['a'] });
  });

  it('stripInternalKeys 只删内部字段', () => {
    const stripped = stripInternalKeys({ pages: ['a'], _platform: { wx: {} } });
    expect(stripped).toEqual({ pages: ['a'] });
  });

  it('findMisplacedKeys 挑出错文件的字段', () => {
    expect(
      findMisplacedKeys({ pages: [], appid: 'wx1', setting: {} }, [
        'appid',
        'setting',
      ]),
    ).toEqual(['appid', 'setting']);
  });
});

describe('merge-config: 分包按 root 追加', () => {
  it('新 root 追加在后面，已有 root 的子字段由 deep 补进去', () => {
    const base = { subpackages: [{ root: 'a', pages: ['x'] }] };
    const snapshot = structuredClone(base);
    const merged = mergeDerived(base, {
      subpackages: [
        { root: 'a', pages: ['y'], independent: true },
        { root: 'b', pages: ['z'] },
      ],
    });
    expect(merged.subpackages).toEqual([
      { root: 'a', pages: ['x', 'y'], independent: true },
      { root: 'b', pages: ['z'] },
    ]);
    expect(base).toEqual(snapshot);
  });

  it('只写了 root 的分包，pages 由构建器填上', () => {
    const merged = mergeDerived(
      { subpackages: [{ root: 'a' }] },
      { subpackages: [{ root: 'a', pages: ['x'] }] },
    );
    expect(merged.subpackages).toEqual([{ root: 'a', pages: ['x'] }]);
  });

  it('非 deep（用户两份之间）同 root 一个字不动，新 root 照样追加', () => {
    const merged = mergeConfig(
      { subpackages: [{ root: 'a', pages: ['x'] }] },
      { subpackages: [{ root: 'a', pages: ['y'] }, { root: 'b' }] },
    );
    expect(merged.subpackages).toEqual([
      { root: 'a', pages: ['x'] },
      { root: 'b' },
    ]);
  });

  it('base 用的是另一种分包写法时，追加到已经存在的那一份上', () => {
    const merged = mergeDerived(
      { subPackages: [{ root: 'a' }] },
      {
        subpackages: [
          { root: 'a', pages: ['x'] },
          { root: 'b', pages: ['y'] },
        ],
      },
    );
    expect(merged.subPackages).toEqual([
      { root: 'a', pages: ['x'] },
      { root: 'b', pages: ['y'] },
    ]);
    expect(merged.subpackages).toBeUndefined();
  });
});
