/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injector } from 'static-injector';
import { BdZnBuildPlatform } from './bd/bdzn-platform';
import { BdZnTransform } from './bd/bdzn.transform';
import { DdBuildPlatform } from './dd/dd-platform';
import { DdTransform } from './dd/dd.transform';
import { FsBuildPlatform } from './fs/fs-platform';
import { FsTransform } from './fs/fs.transform';
import { JdBuildPlatform } from './jd/jd-platform';
import { JdTransform } from './jd/jd.transform';
import { KsBuildPlatform } from './ks/ks-platform';
import { KsTransform } from './ks/ks.transform';
import { BuildPlatform } from './platform';
import { QqBuildPlatform } from './qq/qq-platform';
import { QqTransform } from './qq/qq.transform';
import { TemplateTransformBase } from './template-transform-strategy/transform.base';
import { WxBuildPlatform } from './wx/wx-platform';
import { WxTransform } from './wx/wx.transform';
import { XhsBuildPlatform } from './xhs/xhs-platform';
import { XhsTransform } from './xhs/xhs.transform';
import { ZfbBuildPlatform } from './zfb/zfb-platform';
import { ZfbTransform } from './zfb/zfb.transform';
import { ZjBuildPlatform } from './zjtd/zj-platform';
import { ZjTransform } from './zjtd/zj.transform';

/**
 * 各平台渲染层脚本方言。扩展名在两处各写一次：`BuildPlatform.fileExtname.wxs` 决定产物落盘的
 * 文件名，`WxTransformLike.wxsExtname` 决定 wxml 头部引的文件名。两者必须逐字一致，否则头部引
 * `./a.wxs` 而产物叫 `a.sjs`，小程序要到运行时才报「找不到模块」。
 */
const DIALECTS: Array<{ name: string; transform: any; extname: string }> = [
  { name: 'wx', transform: new WxTransform(), extname: '.wxs' },
  { name: 'qq', transform: new QqTransform(), extname: '.qs' },
  { name: 'zfb', transform: new ZfbTransform(), extname: '.sjs' },
  { name: 'dd', transform: new DdTransform(), extname: '.sjs' },
  { name: 'bdzn', transform: new BdZnTransform(), extname: '.sjs' },
  { name: 'zjtd', transform: new ZjTransform(), extname: '.sjs' },
  { name: 'jd', transform: new JdTransform(), extname: '.jds' },
  { name: 'ks', transform: new KsTransform(), extname: '.sjs' },
  { name: 'xhs', transform: new XhsTransform(), extname: '.sjs' },
  { name: 'fs', transform: new FsTransform(), extname: '.sjs' },
];

describe('wxs 平台方言: transform 扩展名', () => {
  DIALECTS.forEach(({ name, transform, extname }) => {
    it(`${name} 用 ${extname}`, () => {
      expect(transform.wxsExtname).toBe(extname);
    });
  });
});

describe('wxs 平台方言: 与平台 fileExtname 一致', () => {
  /**
   * `BuildPlatform` 的 transform 走基类字段注入（`templateTransform = inject(TemplateTransformBase)`），
   * 所以必须在注入上下文里构造。这里按真实生产配置（platform-inject-config）的最小等价形：
   * 把当前 transform 实例绑到 `TemplateTransformBase` 上。
   */
  const platformClasses: Record<string, any> = {
    wx: WxBuildPlatform,
    qq: QqBuildPlatform,
    zfb: ZfbBuildPlatform,
    dd: DdBuildPlatform,
    bdzn: BdZnBuildPlatform,
    zjtd: ZjBuildPlatform,
    jd: JdBuildPlatform,
    ks: KsBuildPlatform,
    xhs: XhsBuildPlatform,
    fs: FsBuildPlatform,
  };

  DIALECTS.forEach(({ name, transform }) => {
    it(`${name}: fileExtname.wxs === transform.wxsExtname`, () => {
      const injector = Injector.create({
        providers: [
          { provide: TemplateTransformBase, useValue: transform },
          { provide: BuildPlatform, useClass: platformClasses[name] },
        ],
      });
      const platform = injector.get(BuildPlatform);
      expect(platform.fileExtname.wxs).toBe(transform.wxsExtname);
    });
  });
});

describe('wxs 平台方言: 头部转译', () => {
  /**
   * 作者只写微信形态 `<wxs module="x" src="./x.wxs">`，编译期按平台转译。
   * 各家差异不只在扩展名，标签名和属性名也不同——支付宝是 name/from。
   */
  const EXPECTED_HEADER: Record<string, string> = {
    wx: '<wxs module="util" src="/common/util.wxs"/>',
    qq: '<qs module="util" src="/common/util.qs"/>',
    zfb: '<import-sjs name="util" from="/common/util.sjs"/>',
    dd: '<import-sjs name="util" from="/common/util.sjs"/>',
    bdzn: '<import-sjs module="util" src="/common/util.sjs"/>',
    zjtd: '<sjs module="util" src="/common/util.sjs"/>',
    jd: '<jds module="util" src="/common/util.jds"/>',
    ks: '<sjs module="util" src="/common/util.sjs"/>',
    xhs: '<sjs module="util" src="/common/util.sjs"/>',
    fs: '<sjs module="util" src="/common/util.sjs"/>',
  };

  DIALECTS.forEach(({ name, transform }) => {
    it(`${name} 转成自己的标签形态`, () => {
      const header = (transform as any).genWxsHeader(['util']).trim();
      expect(header).toBe(EXPECTED_HEADER[name]);
    });
  });

  it('支付宝不是 module/src，是 name/from（最易踩的差异）', () => {
    const header = (new ZfbTransform() as any).genWxsHeader(['util']).trim();
    expect(header).toContain('name="util"');
    expect(header).toContain('from="');
    expect(header).not.toContain('module=');
    expect(header).not.toContain(' src=');
  });

  it('百度虽是 import-sjs，但属性仍是 module/src', () => {
    const header = (new BdZnTransform() as any).genWxsHeader(['util']).trim();
    expect(header).toContain('<import-sjs');
    expect(header).toContain('module="util"');
    expect(header).toContain(' src="');
  });

  it('引用路径是应用根绝对路径，不是相对路径（共享模型）', () => {
    DIALECTS.forEach(({ name, transform }) => {
      const header = (transform as any).genWxsHeader(['util']).trim();
      expect(header).toContain('"/common/');
      expect(header).not.toContain('"./');
    });
  });

  it('多模块各一行', () => {
    const header = (new WxTransform() as any).genWxsHeader(['a', 'b']);
    expect(header.trim().split('\n').length).toBe(2);
  });

  it('无模块时不产出头部', () => {
    expect((new WxTransform() as any).genWxsHeader([])).toBe('');
  });

  it('不支持渲染层的平台必须报错而不是静默产出', () => {
    const t = new WxTransform();
    t.supportsWxs = false;
    let msg = '';
    try {
      (t as any).genWxsHeader(['util']);
    } catch (e: any) {
      msg = String(e?.message ?? e);
    }
    expect(msg).toContain('不支持渲染层脚本');
    expect(msg).toContain('util');
  });
});
