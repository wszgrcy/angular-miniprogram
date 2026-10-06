import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Injector } from 'static-injector';
import { BuildPlatform, PlatformType } from '../platform/platform';
import { getBuildPlatformInjectConfig } from '../platform/platform-inject-config';
import type { CopiedAsset } from './copy-assets';
import {
  MP_CONFIG_SPECS,
  checkReferencedFiles,
  groupSubPackages,
  resolveMpConfigs,
} from './mp-config';

function platformOf(type: PlatformType): BuildPlatform {
  const injector = Injector.create({
    providers: [...getBuildPlatformInjectConfig(type)],
  });
  const platform = injector.get(BuildPlatform);
  platform.fileExtname.config = platform.fileExtname.config || '.json';
  return platform;
}

const WX = platformOf(PlatformType.wx);
const ZFB = platformOf(PlatformType.zfb);

let dir = '';
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-config-'));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

/** 在临时工作区写一个文件，返回相对 workspaceRoot 的路径 */
function write(rel: string, content: string): string {
  const abs = path.join(dir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  return rel;
}

function writeJson(rel: string, value: unknown): string {
  return write(rel, JSON.stringify(value, null, 2));
}

/** assets 展开结果：outputRelPath 就是产物里的名字 */
function asset(rel: string, outputRelPath = path.basename(rel)): CopiedAsset {
  return { outputRelPath, sourcePath: path.join(dir, rel) };
}

const builtPages = ['pages/index/index', 'pages/about/about'];

function resolve(overrides: Partial<Parameters<typeof resolveMpConfigs>[0]>) {
  return resolveMpConfigs({
    workspaceRoot: dir,
    platform: WX,
    platformType: PlatformType.wx,
    assets: [],
    builtPagePaths: builtPages,
    builtTabbarPaths: [],
    ...overrides,
  });
}

describe('mp-config: app.json 合并', () => {
  it('静态那份写过的不动，appJson 里没写过的补进去，pages 追加', () => {
    writeJson('src/app.json', {
      pages: ['pages/native/native'],
      window: { navigationBarTitleText: '静态' },
    });
    writeJson('src/app.config.json', {
      pages: ['pages/index/index', 'pages/about/about'],
      window: { navigationBarTitleText: '结构化' },
      lazyCodeLoading: 'requiredComponents',
    });
    const { app } = resolve({
      assets: [asset('src/app.json')],
      appJson: 'src/app.config.json',
      builtPagePaths: [...builtPages, 'pages/native/native'],
    });
    expect(app.errors).toEqual([]);
    expect(app.config.pages).toEqual([
      'pages/native/native',
      'pages/index/index',
      'pages/about/about',
    ]);
    // window 用户写了就一个字都不动
    expect(app.config.window).toEqual({ navigationBarTitleText: '静态' });
    expect(app.config.lazyCodeLoading).toBe('requiredComponents');
  });

  it('没有任何可合并内容时逐字节原样输出用户那份', () => {
    const text =
      '{\n  "pages": [\n    "pages/index/index",\n    "pages/about/about"\n  ]\n}';
    write('src/app.json', text);
    const { app } = resolve({ assets: [asset('src/app.json')] });
    expect(app.verbatimText).toBe(text);
    expect(app.errors).toEqual([]);
  });

  it('不凭空生成字段：没写配置时输出里只有构建器必须算的 pages', () => {
    const { app } = resolve({});
    expect(app.config).toEqual({ pages: builtPages });
    expect('window' in app.config).toBe(false);
    expect('style' in app.config).toBe(false);
    expect('sitemapLocation' in app.config).toBe(false);
  });

  it('用户写的任意字段照样输出（防止做成白名单后漏字段）', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      useExtendedLib: { weui: true },
      resizable: true,
      renderer: 'skyline',
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.config.useExtendedLib).toEqual({ weui: true });
    expect(app.config.resizable).toBe(true);
    expect(app.config.renderer).toBe('skyline');
  });

  it('只有静态 app.json 时校验固定 warn，不拦构建', () => {
    writeJson('src/app.json', {
      pages: ['pages/index/index'],
      tabBar: { list: [{ pagePath: 'pages/ghost/ghost' }] },
    });
    const { app } = resolve({ assets: [asset('src/app.json')] });
    expect(app.errors).toEqual([]);
    expect(app.warnings.join('\n')).toContain('pages/ghost/ghost');
  });

  it('appJson 通道的校验默认 error', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { list: [{ pagePath: 'pages/ghost/ghost' }] },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.errors.join('\n')).toContain('pages/ghost/ghost');
  });

  it('appJsonValidate: off 绕过校验', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { list: [{ pagePath: 'pages/ghost/ghost' }] },
    });
    const { app } = resolve({
      appJson: 'src/app.config.json',
      appJsonValidate: 'off',
    });
    expect(app.errors).toEqual([]);
  });

  it('appJson 指向的文件不存在 → 报错', () => {
    const { app } = resolve({ appJson: 'src/nope.json' });
    expect(app.errors.join('\n')).toContain('src/nope.json');
  });

  it('写错文件的提醒：appid 出现在 app 配置里只警告，不静默丢', () => {
    writeJson('src/app.config.json', { pages: builtPages, appid: 'wx123' });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.config.appid).toBe('wx123');
    expect(app.warnings.join('\n')).toContain('projectConfig');
  });
});

describe('mp-config: 自定义 tabBar 开关', () => {
  const built = ['custom-tab-bar/index'];

  it('没写开关 + 本次有产出 → 补 true', () => {
    writeJson('src/app.config.json', { pages: builtPages });
    const { app } = resolve({
      builtTabbarPaths: built,
      appJson: 'src/app.config.json',
    });
    expect((app.config.tabBar as { custom: boolean }).custom).toBe(true);
  });

  it('写了 tabBar.list 但没写开关 → 只补开关，list 不动', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { list: [{ pagePath: 'pages/index/index', text: '首页' }] },
    });
    const { app } = resolve({
      builtTabbarPaths: built,
      appJson: 'src/app.config.json',
    });
    expect(app.config.tabBar).toEqual({
      list: [{ pagePath: 'pages/index/index', text: '首页' }],
      custom: true,
    });
  });

  it('显式写了 false + 有产出 → 不补不改', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { custom: false },
    });
    const { app } = resolve({
      builtTabbarPaths: built,
      appJson: 'src/app.config.json',
    });
    expect(app.config.tabBar).toEqual({ custom: false });
  });

  it('写了 true 但没产出 → 不报错也不改', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { custom: true },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.config.tabBar).toEqual({ custom: true });
    expect(app.errors).toEqual([]);
  });

  it('支付宝的开关字段跟着平台走', () => {
    writeJson('src/app.config.json', { pages: builtPages });
    const { app } = resolve({
      platform: ZFB,
      platformType: PlatformType.zfb,
      builtTabbarPaths: ['customize-tab-bar/index'],
      appJson: 'src/app.config.json',
    });
    expect((app.config.tabBar as { customize: boolean }).customize).toBe(true);
  });
});

describe('mp-config: _platform 平台段', () => {
  it('当前平台段被合并，其他平台段被忽略，_platform 本身不进输出', () => {
    writeJson('src/app.config.json', {
      window: { navigationBarTitleText: '通用' },
      pages: builtPages,
      _platform: {
        wx: { style: 'v2' },
        zfb: { lazyCodeLoading: 'requiredComponents' },
      },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.config.style).toBe('v2');
    expect(app.config.lazyCodeLoading).toBeUndefined();
    expect('_platform' in app.config).toBe(false);
  });

  it('平台段只补通用段没写的字段', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      style: '通用写法',
      _platform: { wx: { style: '平台写法' } },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.config.style).toBe('通用写法');
  });

  it('平台名拼错 → 报错', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      _platform: { weixin: { style: 'v2' } },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.errors.join('\n')).toContain('weixin');
  });

  it('静态那份的 _platform 同样生效', () => {
    writeJson('src/app.json', {
      pages: builtPages,
      _platform: { wx: { style: 'v2' }, zfb: { style: 'no' } },
    });
    const { app } = resolve({ assets: [asset('src/app.json')] });
    expect(app.config.style).toBe('v2');
    expect('_platform' in app.config).toBe(false);
  });
});

describe('mp-config: 形状校验', () => {
  it('已知字段类型错误能拦下来', () => {
    writeJson('src/app.config.json', { pages: [123] });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    const text = app.errors.join('\n');
    expect(text).toContain('app 配置');
    expect(text).toContain('pages[0]');
  });

  it('tabBar.list 缺 pagePath 能给出路径', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { list: [{}] },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.errors.join('\n')).toContain('tabBar.list[0].pagePath');
  });

  it('形状不过时不再跑语义校验（不报一堆没用的错）', () => {
    writeJson('src/app.config.json', { pages: [123], tabBar: { list: [] } });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.errors).toHaveLength(1);
  });

  it('未知字段不报错也不丢', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      someBrandNewField: { a: 1 },
    });
    const { app } = resolve({ appJson: 'src/app.config.json' });
    expect(app.errors).toEqual([]);
    expect(app.config.someBrandNewField).toEqual({ a: 1 });
  });
});

describe('mp-config: project 配置', () => {
  it('内置默认值打底，用户文件里有的按文件', () => {
    writeJson('src/project.config.json', {
      appid: 'wx-real-appid',
      setting: { es6: true },
    });
    const { project } = resolve({ assets: [asset('src/project.config.json')] });
    expect(project.config.appid).toBe('wx-real-appid');
    expect(project.config.setting).toEqual({ es6: true });
    // 默认值补进用户没写的字段
    expect(project.config.compileType).toBe('miniprogram');
    expect(project.errors).toEqual([]);
  });

  it('没有用户文件时全用默认值', () => {
    const { project } = resolve({});
    expect(project.config.compileType).toBe('miniprogram');
    expect(project.config.appid).toBe('touristappid');
  });

  it('appid 缺省值只在没人写过时补', () => {
    writeJson('src/project.config.json', { appid: 'wx-real' });
    expect(
      resolve({ assets: [asset('src/project.config.json')] }).project.config
        .appid,
    ).toBe('wx-real');
  });

  it('condition 默认不生成，deriveCondition 打开后按 pages 生成', () => {
    expect('condition' in resolve({}).project.config).toBe(false);
    const { project } = resolve({ deriveCondition: true, appJson: undefined });
    expect(project.config.condition).toEqual({
      miniprogram: {
        current: 0,
        list: [
          {
            id: 0,
            name: 'pages/index/index',
            pathName: 'pages/index/index',
            query: '',
          },
          {
            id: 1,
            name: 'pages/about/about',
            pathName: 'pages/about/about',
            query: '',
          },
        ],
      },
    });
  });

  it('用户写了 condition 就不动', () => {
    writeJson('src/project.config.json', {
      condition: { miniprogram: { current: 3 } },
    });
    const { project } = resolve({
      assets: [asset('src/project.config.json')],
      deriveCondition: true,
    });
    expect(project.config.condition).toEqual({ miniprogram: { current: 3 } });
  });

  it('projectConfig 选项与静态文件合并，静态优先', () => {
    writeJson('src/project.config.json', { appid: 'from-static' });
    writeJson('src/project.config.jsonc', {
      appid: 'from-option',
      projectname: 'p',
    });
    const { project } = resolve({
      assets: [asset('src/project.config.json')],
      projectConfig: 'src/project.config.jsonc',
    });
    expect(project.config.appid).toBe('from-static');
    expect(project.config.projectname).toBe('p');
  });

  it('app 配置里的 pages 参与 condition 生成（含静态那份）', () => {
    writeJson('src/app.json', { pages: ['pages/a/a'] });
    const { project } = resolve({
      assets: [asset('src/app.json')],
      builtPagePaths: ['pages/a/a'],
      deriveCondition: true,
    });
    expect(
      (project.config.condition as { miniprogram: { list: unknown[] } })
        .miniprogram.list,
    ).toHaveLength(1);
  });
});

describe('mp-config: 平台差异', () => {
  it('分包 key 按平台写法输出，两种写法混写也只出一份', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      subpackages: [{ root: 'a', pages: ['x'] }],
      subPackages: [{ root: 'b', pages: ['y'] }],
    });
    const wx = resolve({ appJson: 'src/app.config.json' }).app;
    expect(wx.config.subpackages).toHaveLength(2);
    expect('subPackages' in wx.config).toBe(false);

    const zfb = resolve({
      platform: ZFB,
      platformType: PlatformType.zfb,
      appJson: 'src/app.config.json',
    }).app;
    expect(zfb.config.subPackages).toHaveLength(2);
    expect('subpackages' in zfb.config).toBe(false);
  });

  it('支付宝把 darkmode 改写成 darkMode，布尔改成 YES/NO', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      darkmode: true,
      window: { allowsBounceVertical: false },
    });
    const { app } = resolve({
      platform: ZFB,
      platformType: PlatformType.zfb,
      appJson: 'src/app.config.json',
    });
    expect(app.config.darkMode).toBe(true);
    expect('darkmode' in app.config).toBe(false);
    expect(app.config.window).toEqual({ allowsBounceVertical: 'NO' });
  });

  it('支付宝把 condition 整段换成 compileModeJson', () => {
    writeJson('src/mini.project.json', {
      condition: {
        miniprogram: {
          current: 0,
          list: [{ name: '首页', pathName: 'pages/index/index', query: 'a=1' }],
        },
      },
    });
    const { project } = resolve({
      platform: ZFB,
      platformType: PlatformType.zfb,
      assets: [asset('src/mini.project.json')],
    });
    expect('condition' in project.config).toBe(false);
    expect(project.config.compileModeJson).toEqual({
      modes: [{ title: '首页', page: 'pages/index/index', pageQuery: 'a=1' }],
    });
  });

  it('project 文件名按平台走（支付宝 mini.project.json）', () => {
    expect(MP_CONFIG_SPECS.project.filename(ZFB)).toBe('mini.project.json');
    expect(MP_CONFIG_SPECS.project.filename(WX)).toBe('project.config.json');
    expect(MP_CONFIG_SPECS.app.filename(ZFB)).toBe('app.json');
  });

  it('平台不支持的字段被拦下来', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      tabBar: { custom: true },
    });
    // dd 没有自定义 tabBar
    const { app } = resolve({
      platform: platformOf(PlatformType.dd),
      platformType: PlatformType.dd,
      appJson: 'src/app.config.json',
    });
    expect(app.errors.join('\n')).toContain('没有自定义 tabBar');
  });
});

describe('mp-config: 引用文件检查', () => {
  it('sitemapLocation 指的文件不在产物里 → 报错', () => {
    const errors = checkReferencedFiles({ sitemapLocation: 'sitemap.json' }, [
      'app.json',
      'pages/index/index.js',
    ]);
    expect(errors.join('\n')).toContain('sitemap.json');
    expect(
      checkReferencedFiles({ sitemapLocation: 'sitemap.json' }, [
        'sitemap.json',
      ]),
    ).toEqual([]);
  });
});

describe('mp-config: 分包派生', () => {
  const subEntries = [
    { root: 'packageA', path: 'packageA/pages/a/a-entry' },
    { root: 'packageA', path: 'packageA/pages/b/b-entry' },
    { root: 'packageB', path: 'packageB/pages/c/c-entry', independent: true },
  ];
  const subPagePaths = subEntries.map((e) => e.path);

  it('groupSubPackages 按 root 归堆，pages 剔掉 root 前缀', () => {
    expect(groupSubPackages(subEntries)).toEqual([
      { root: 'packageA', pages: ['pages/a/a-entry', 'pages/b/b-entry'] },
      {
        root: 'packageB',
        pages: ['pages/c/c-entry'],
        independent: true,
      },
    ]);
  });

  it('pattern 扫出来的入口直接产分包声明，主包 pages 不含分包页', () => {
    writeJson('src/app.config.json', { pages: builtPages });
    const { app } = resolve({
      appJson: 'src/app.config.json',
      builtPagePaths: [...builtPages, ...subPagePaths],
      derivedSubPackages: groupSubPackages(subEntries),
    });
    expect(app.errors).toEqual([]);
    expect(app.config.subpackages).toEqual([
      { root: 'packageA', pages: ['pages/a/a-entry', 'pages/b/b-entry'] },
      { root: 'packageB', pages: ['pages/c/c-entry'], independent: true },
    ]);
    expect(app.config.pages).toEqual(builtPages);
  });

  it('用户写了同一个 root：他的页在前，扫出来的追加在后面', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      subpackages: [{ root: 'packageA', pages: ['pages/native/native'] }],
    });
    const { app } = resolve({
      appJson: 'src/app.config.json',
      builtPagePaths: [
        ...builtPages,
        'packageA/pages/native/native',
        'packageA/pages/a/a-entry',
      ],
      derivedSubPackages: groupSubPackages([subEntries[0]]),
    });
    expect(app.errors).toEqual([]);
    expect(app.config.subpackages).toEqual([
      {
        root: 'packageA',
        pages: ['pages/native/native', 'pages/a/a-entry'],
      },
    ]);
  });

  it('只写 root 的分包，pages 由构建器补上', () => {
    writeJson('src/app.config.json', {
      pages: builtPages,
      subpackages: [{ root: 'packageA', independent: true }],
    });
    const { app } = resolve({
      appJson: 'src/app.config.json',
      builtPagePaths: [...builtPages, ...subPagePaths],
      derivedSubPackages: groupSubPackages(subEntries),
    });
    expect(app.errors).toEqual([]);
    expect(app.config.subpackages).toEqual([
      {
        root: 'packageA',
        pages: ['pages/a/a-entry', 'pages/b/b-entry'],
        independent: true,
      },
      { root: 'packageB', pages: ['pages/c/c-entry'], independent: true },
    ]);
  });

  it('分包写法跟着平台走，派生的也一样只出一份', () => {
    const { app } = resolve({
      platform: ZFB,
      platformType: PlatformType.zfb,
      builtPagePaths: ['packageB/pages/c/c-entry'],
      derivedSubPackages: groupSubPackages([subEntries[2]]),
    });
    expect(app.errors).toEqual([]);
    expect(app.config.subPackages).toEqual([
      { root: 'packageB', pages: ['pages/c/c-entry'], independent: true },
    ]);
    expect('subpackages' in app.config).toBe(false);
  });
});
