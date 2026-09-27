import {
  MpAppConfig,
  findSubPackageByPath,
  generateAppJson,
  getSubPackages,
  resolveSubPackages,
  validateAppConfig,
} from './app-config';

describe('app-config: 校验', () => {
  const builtPages = ['pages/index/index', 'pages/about/about'];

  it('合法配置通过校验', () => {
    const config: MpAppConfig = {
      pages: ['pages/index/index', 'pages/about/about'],
      window: { navigationBarTitleText: 'test' },
      tabBar: {
        list: [
          { pagePath: 'pages/index/index', text: '首页' },
          { pagePath: 'pages/about/about', text: '关于' },
        ],
      },
    };
    expect(validateAppConfig(config, builtPages)).toEqual([]);
  });

  it('空配置报错', () => {
    const errors = validateAppConfig({}, []);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('pages');
  });

  it('主包页面重复报错', () => {
    const errors = validateAppConfig(
      { pages: ['pages/a/a', 'pages/a/a'] },
      builtPages
    );
    expect(errors).toContain('pages 存在重复页面: pages/a/a');
  });

  it('分包 root 非法（绝对路径）报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: '/sub', pages: ['a'] }],
      },
      builtPages
    );
    expect(errors[0]).toContain('root 非法');
  });

  it('分包 root 含 .. 报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: '../outside', pages: ['a'] }],
      },
      builtPages
    );
    expect(errors[0]).toContain('root 非法');
  });

  it('分包页面全路径与主包冲突报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index', 'sub/a/a'],
        subpackages: [{ root: 'sub', pages: ['a/a'] }],
      },
      builtPages
    );
    // 主包直接声明了 sub/a/a，而分包 root=sub + page=a/a 展开也是 sub/a/a
    expect(
      errors.some((e) => e.includes('分包页面与主包 pages 冲突'))
    ).toBeTrue();
  });

  it('分包页面相对路径与主包页面同名但全路径不同，合法', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: 'sub', pages: ['pages/index/index'] }],
      },
      builtPages
    );
    expect(errors).toEqual([]);
  });

  it('分包页面跨分包重复报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [
          { root: 'sub', pages: ['a/a'] },
          { root: 'sub', pages: ['a/a'] },
        ],
      },
      builtPages
    );
    expect(errors.some((e) => e.includes('重复的 root'))).toBeTrue();
    expect(errors.some((e) => e.includes('跨分包重复'))).toBeTrue();
  });

  it('分包没有页面报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: 'sub', pages: [] }],
      },
      builtPages
    );
    expect(errors.some((e) => e.includes('没有页面'))).toBeTrue();
  });

  it('tabBar 指向分包页面报错（必须在主包）', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: 'sub', pages: ['a/a'] }],
        tabBar: { list: [{ pagePath: 'sub/a/a', text: 'x' }] },
      },
      builtPages
    );
    expect(
      errors.some((e) => e.includes('tabBar.pagePath "sub/a/a" 不在主包'))
    ).toBeTrue();
  });

  it('tabBar 缺 pagePath 报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        tabBar: { list: [{ text: 'x' }] },
      },
      builtPages
    );
    expect(errors.some((e) => e.includes('缺少 pagePath'))).toBeTrue();
  });

  it('preloadRule 指向不存在页面报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: 'sub', pages: ['a/a'] }],
        preloadRule: { 'pages/nowhere/nowhere': { packages: ['sub'] } },
      },
      builtPages
    );
    expect(errors.some((e) => e.includes('preloadRule 的页面'))).toBeTrue();
  });

  it('preloadRule 引用未声明分包报错', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: 'sub', pages: ['a/a'] }],
        preloadRule: {
          'pages/index/index': { packages: ['sub', 'ghost'] },
        },
      },
      builtPages
    );
    expect(errors.some((e) => e.includes('未声明的分包 "ghost"'))).toBeTrue();
  });

  it('preloadRule 合法（分包页 + 对象形态 packages）', () => {
    const errors = validateAppConfig(
      {
        pages: ['pages/index/index'],
        subpackages: [{ root: 'sub', pages: ['a/a'] }],
        preloadRule: {
          'pages/index/index': { packages: ['sub'] },
          'sub/a/a': { packages: { sub: 'all' } },
        },
      },
      builtPages
    );
    expect(errors).toEqual([]);
  });

  it('subPackages（大写 P）写法等价', () => {
    const config: MpAppConfig = {
      pages: ['pages/index/index'],
      subPackages: [{ root: 'sub', pages: ['a/a'] }],
    };
    expect(getSubPackages(config).length).toBe(1);
    expect(validateAppConfig(config, builtPages)).toEqual([]);
  });
});

describe('app-config: 分包解析', () => {
  it('resolveSubPackages 拼全页面路径并归一化 independent', () => {
    const config: MpAppConfig = {
      pages: ['pages/index/index'],
      subpackages: [
        { root: 'packageA', pages: ['pages/a/a', { path: 'pages/b/b' }] },
        { root: 'packageB/', pages: ['c/c'], independent: true },
      ],
    };
    const subs = resolveSubPackages(config);
    expect(subs.length).toBe(2);
    expect(subs[0].root).toBe('packageA');
    expect(subs[0].independent).toBe(false);
    expect(subs[0].fullPages).toEqual([
      'packageA/pages/a/a',
      'packageA/pages/b/b',
    ]);
    // 尾部斜杠被剥掉
    expect(subs[1].root).toBe('packageB');
    expect(subs[1].independent).toBe(true);
    expect(subs[1].fullPages).toEqual(['packageB/c/c']);
  });

  it('findSubPackageByPath 按 root 前缀归属', () => {
    const subs = resolveSubPackages({
      pages: ['pages/index/index'],
      subpackages: [{ root: 'packageA', pages: ['a/a'] }],
    });
    expect(findSubPackageByPath(subs, 'packageA/a/a')?.root).toBe('packageA');
    expect(findSubPackageByPath(subs, 'packageA')?.root).toBe('packageA');
    expect(findSubPackageByPath(subs, 'pages/index/index')).toBeUndefined();
    // packageAX 不应误命中 packageA
    expect(findSubPackageByPath(subs, 'packageAX/x')).toBeUndefined();
  });
});

describe('app-config: 生成', () => {
  it('输出格式化 JSON 且原样保留字段', () => {
    const config: MpAppConfig = {
      pages: ['pages/index/index'],
      window: { navigationBarTitleText: 'hi' },
      lazyCodeLoading: 'requiredComponents',
      darkmode: true,
    };
    const text = generateAppJson(config);
    expect(text.endsWith('\n')).toBeTrue();
    const parsed = JSON.parse(text) as MpAppConfig;
    expect(parsed.pages).toEqual(['pages/index/index']);
    expect(parsed.lazyCodeLoading).toBe('requiredComponents');
    // 未知字段透传
    expect(parsed.darkmode).toBeTrue();
  });
});
