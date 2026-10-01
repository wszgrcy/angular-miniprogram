/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * sidecar 写侧 / 读侧的纯单元测试（不跑构建器）。
 *
 * 端到端那部分在 `library-meta-sidecar.spec.ts`，这里只钉住单元行为：
 * key 形态、包边界判定、schema 校验、缓存失效、冲突告警。
 */
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { detectComponentNames } from '../component-template-inject/change-component';
import {
  clearLibraryMetaMisses,
  formatLibraryMetaSummary,
  getLibraryMetaMisses,
  isAngularFrameworkSource,
  recordLibraryMetaMiss,
} from './library-meta-diagnostics';
import {
  clearLibraryMetaReaderCache,
  findLibraryPackageRoot,
  isMpLibraryFile,
  lookupLibraryMeta,
  readLibraryMetaForModule,
} from './library-meta-reader';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryMetaFile,
  assertLibraryTemplatePayload,
} from './library-meta-schema';
import {
  clearLibraryMetaStore,
  recordLibraryComponentMeta,
  recordLibraryDirectiveMeta,
  registerLibraryMetaEntry,
  writeLibraryMetaFile,
} from './library-meta-store';
import {
  LibraryTemplateValues,
  createLibraryTemplateRenderer,
  renderLibraryTemplate,
} from './mp-template';

describe('library-meta-store（写侧）', () => {
  let tmp: string;

  beforeEach(() => {
    clearLibraryMetaStore();
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-meta-store-'));
  });

  afterEach(() => {
    fs.removeSync(tmp);
    clearLibraryMetaStore();
  });

  it('空暂存区不产出文件', () => {
    expect(writeLibraryMetaFile(tmp)).toBeUndefined();
    expect(fs.existsSync(path.join(tmp, LIBRARY_META_FILE_NAME))).toBeFalse();
  });

  it('key 是「扁平化 d.ts 相对库根的 posix 路径」', () => {
    registerLibraryMetaEntry(
      'demo/forms',
      path.join(tmp, 'types', 'demo-forms.d.ts'),
      tmp,
    );
    recordLibraryDirectiveMeta('demo/forms', 'DefaultValueAccessor', {
      listeners: ['bindinput', 'bindblur'],
      properties: ['value'],
    });
    const written = writeLibraryMetaFile(tmp);
    expect(written).toBeTruthy();
    const file = fs.readJsonSync(path.join(tmp, LIBRARY_META_FILE_NAME));
    expect(Object.keys(file.entries)).toEqual(['types/demo-forms.d.ts']);
    expect(file.entries['types/demo-forms.d.ts'].moduleId).toBe('demo/forms');
    expect(file.schemaVersion).toBe(LIBRARY_META_SCHEMA_VERSION);
  });

  it('未登记 typings 的 entry 被跳过（不会产出查不到的条目）', () => {
    recordLibraryDirectiveMeta('demo/orphan', 'Foo', {
      listeners: ['bindtap'],
      properties: [],
    });
    expect(writeLibraryMetaFile(tmp)).toBeUndefined();
  });

  it('重复落盘内容一致（幂等，watch 反复触发不累加）', () => {
    registerLibraryMetaEntry('demo/a', path.join(tmp, 'types', 'a.d.ts'), tmp);
    recordLibraryDirectiveMeta('demo/a', 'A', {
      listeners: ['bindtap'],
      properties: [],
    });
    writeLibraryMetaFile(tmp);
    const first = fs.readFileSync(
      path.join(tmp, LIBRARY_META_FILE_NAME),
      'utf8',
    );
    writeLibraryMetaFile(tmp);
    const second = fs.readFileSync(
      path.join(tmp, LIBRARY_META_FILE_NAME),
      'utf8',
    );
    expect(second).toBe(first);
  });

  it('同名冲突时后者生效并告警', () => {
    const warnings: string[] = [];
    const spy = spyOn(console, 'warn').and.callFake((...args: any[]) => {
      warnings.push(args.join(' '));
    });
    registerLibraryMetaEntry('demo/a', path.join(tmp, 'types', 'a.d.ts'), tmp);
    recordLibraryDirectiveMeta('demo/a', 'Dup', {
      listeners: ['bindtap'],
      properties: [],
    });
    recordLibraryDirectiveMeta('demo/a', 'Dup', {
      listeners: ['bindchange'],
      properties: [],
    });
    writeLibraryMetaFile(tmp);
    expect(spy).toHaveBeenCalled();
    const file = fs.readJsonSync(path.join(tmp, LIBRARY_META_FILE_NAME));
    expect(file.entries['types/a.d.ts'].directives.Dup.listeners).toEqual([
      'bindchange',
    ]);
  });

  it('组件记录带 outputPath', () => {
    registerLibraryMetaEntry('demo/a', path.join(tmp, 'types', 'a.d.ts'), tmp);
    recordLibraryComponentMeta('demo/a', 'MyComp', {
      listeners: [],
      properties: ['title'],
      outputPath: '/demo/a/my-comp/my-comp',
    });
    writeLibraryMetaFile(tmp);
    const file = fs.readJsonSync(path.join(tmp, LIBRARY_META_FILE_NAME));
    expect(file.entries['types/a.d.ts'].components['MyComp'].outputPath).toBe(
      '/demo/a/my-comp/my-comp',
    );
  });
});

describe('library-meta-reader（读侧）', () => {
  let tmp: string;
  let dtsPath: string;

  // 递增量：保证**每次写 mtime 严格变大**，不依赖两次写之间真的隔了一毫秒
  // （`Date.now()` 只到 ms，相邻两次调用常常是 0ms，那样 mtime 相同、缓存不失效）
  let mtimeTick = 0;
  const writeSidecar = (file: unknown) => {
    fs.writeFileSync(
      path.join(tmp, LIBRARY_META_FILE_NAME),
      JSON.stringify(file),
      'utf8',
    );
    // 显式推进 mtime，绕开文件系统时间粒度导致缓存不失效的假阴性
    const now = Date.now() / 1000 + 10 + mtimeTick++;
    fs.utimesSync(path.join(tmp, LIBRARY_META_FILE_NAME), now, now);
  };

  beforeEach(() => {
    clearLibraryMetaReaderCache();
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-meta-read-'));
    fs.outputJsonSync(path.join(tmp, 'package.json'), { name: 'demo' });
    dtsPath = path.join(tmp, 'types', 'demo-forms.d.ts');
    fs.outputFileSync(dtsPath, 'export declare class X {}\n');
  });

  afterEach(() => {
    fs.removeSync(tmp);
    clearLibraryMetaReaderCache();
  });

  const validFile = () => ({
    schemaVersion: LIBRARY_META_SCHEMA_VERSION,
    generator: 'angular-miniprogram',
    entries: {
      'types/demo-forms.d.ts': {
        moduleId: 'demo/forms',
        typings: 'types/demo-forms.d.ts',
        directives: {
          DefaultValueAccessor: {
            listeners: ['bindinput', 'bindblur'],
            properties: ['value', 'disabled'],
          },
        },
        components: {
          MyComp: {
            listeners: [],
            properties: ['title'],
            outputPath: '/demo/a/my-comp/my-comp',
          },
        },
      },
    },
  });

  it('命中组件记录，kind = component', () => {
    writeSidecar(validFile());
    const r = lookupLibraryMeta(dtsPath, 'MyComp');
    expect(r.kind).toBe('component');
    expect((r.record as any).outputPath).toBe('/demo/a/my-comp/my-comp');
    expect(r.entryMatchedButClassMissing).toBeUndefined();
  });

  it('命中指令记录，kind = directive', () => {
    writeSidecar(validFile());
    const r = lookupLibraryMeta(dtsPath, 'DefaultValueAccessor');
    expect(r.kind).toBe('directive');
    expect(r.record!.listeners).toEqual(['bindinput', 'bindblur']);
  });

  it('entry 命中但类不存在 → entryMatchedButClassMissing', () => {
    writeSidecar(validFile());
    const r = lookupLibraryMeta(dtsPath, 'NoSuchDirective');
    expect(r.entry).toBeTruthy();
    expect(r.entryMatchedButClassMissing).toBeTrue();
    expect(r.record).toBeUndefined();
  });

  it('没有 sidecar 时只返回包根，不返回 entry', () => {
    const r = lookupLibraryMeta(dtsPath, 'MyComp');
    expect(r.pkgRoot).toBe(tmp);
    expect(r.entry).toBeUndefined();
    expect(r.record).toBeUndefined();
  });

  it('schema 版本不匹配时整包忽略', () => {
    const bad = validFile() as any;
    bad.schemaVersion = 999;
    writeSidecar(bad);
    const r = lookupLibraryMeta(dtsPath, 'MyComp');
    expect(r.record).toBeUndefined();
  });

  it('非法结构不炸，按未命中处理', () => {
    writeSidecar({ nope: 1 });
    expect(lookupLibraryMeta(dtsPath, 'MyComp').record).toBeUndefined();
  });

  it('包边界：嵌套 package.json 时认最近的包，不误吃上层 sidecar', () => {
    // 上层 tmp 有 sidecar，但内层 node_modules/other 是另一个包
    writeSidecar(validFile());
    const inner = path.join(
      tmp,
      'node_modules',
      'other',
      'types',
      'other.d.ts',
    );
    fs.outputJsonSync(path.join(tmp, 'node_modules', 'other', 'package.json'), {
      name: 'other',
    });
    fs.outputFileSync(inner, 'export declare class MyComp {}\n');
    expect(findLibraryPackageRoot(inner)).toBe(
      path.join(tmp, 'node_modules', 'other'),
    );
    expect(lookupLibraryMeta(inner, 'MyComp').record).toBeUndefined();
  });

  it('大小写不一致仍能命中（Windows 兜底）', () => {
    const file = validFile() as any;
    file.entries = {
      'Types/Demo-Forms.D.TS': file.entries['types/demo-forms.d.ts'],
    };
    writeSidecar(file);
    expect(lookupLibraryMeta(dtsPath, 'MyComp').kind).toBe('component');
  });

  it('mtime 变化后缓存失效，读到新内容', () => {
    writeSidecar(validFile());
    expect(lookupLibraryMeta(dtsPath, 'MyComp').kind).toBe('component');

    const changed = validFile() as any;
    delete changed.entries['types/demo-forms.d.ts'].components.MyComp;
    writeSidecar(changed);
    expect(lookupLibraryMeta(dtsPath, 'MyComp').record).toBeUndefined();
  });

  it('非库文件（找不到包根）不报错', () => {
    // 另开一整个没有 package.json 的目录树，让向上找包根真的找不到
    const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-meta-bare-'));
    try {
      const orphan = path.join(bare, 'src', 'x.ts');
      fs.outputFileSync(orphan, 'export class X {}\n');
      expect(findLibraryPackageRoot(orphan)).toBeUndefined();
      expect(() => lookupLibraryMeta(orphan, 'MyComp')).not.toThrow();
      expect(lookupLibraryMeta(orphan, 'MyComp').record).toBeUndefined();
    } finally {
      fs.removeSync(bare);
    }
  });
});

describe('注入与包边界加固（schemaVersion 2）', () => {
  /**
   * 旧库（v1，载荷在 JS 里）必须**显式炸**。
   *
   * 这条是本次重构最重要的安全网：静默出空 wxml = 页面白屏零报错，
   * 这个仓库已经栽过好几次。宁可构建失败。
   */
  describe('assertLibraryTemplatePayload（旧库显式报错）', () => {
    const base = {
      moduleId: 'test-library',
      typings: 'types/test-library.d.ts',
    };

    it('有非空 content（${} 插值模板串）→ 放行', () => {
      expect(() =>
        assertLibraryTemplatePayload({
          ...base,
          components: {
            MyComp: {
              listeners: [],
              properties: [],
              outputPath: '/x',
              content: '<view>hi</view>',
            } as any,
          },
        }),
      ).not.toThrow();
    });

    it('有组件但全缺 content（旧库形态）→ 抛错并点名库与版本', () => {
      let err = '';
      try {
        assertLibraryTemplatePayload({
          ...base,
          components: {
            MyComp: { listeners: [], properties: [], outputPath: '/x' } as any,
          },
        });
      } catch (e) {
        err = String((e as Error).message);
      }
      expect(err).toContain('test-library');
      expect(err).toContain(`schemaVersion v${LIBRARY_META_SCHEMA_VERSION}`);
      expect(err).toContain('重新构建');
    });

    it('空组件表（纯指令 entry）→ 放行，不该误伤', () => {
      expect(() =>
        assertLibraryTemplatePayload({ ...base, components: {} }),
      ).not.toThrow();
      expect(() =>
        assertLibraryTemplatePayload({ ...base } as any),
      ).not.toThrow();
    });

    it('content 是空串也算没载荷（不能蒙混过关）', () => {
      expect(() =>
        assertLibraryTemplatePayload({
          ...base,
          components: {
            MyComp: {
              listeners: [],
              properties: [],
              outputPath: '/x',
              content: '',
            } as any,
          },
        }),
      ).toThrow();
    });
  });

  /**
   * 包边界：只有带 sidecar 的包才归本工具链管。
   *
   * 这是「不给第三方库注 propertyChange」的唯一闸门。`@angular/common` 的
   * fesm 里同样有 `ɵɵdefineComponent`（NgIf / NgFor），一旦误判，等于给每个
   * `*ngIf` 加一次 setData，而且没人会发现。
   */
  describe('isMpLibraryFile（第三方库不被误处理）', () => {
    let tmp: string;

    beforeEach(() => {
      clearLibraryMetaReaderCache();
      tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-meta-boundary-'));
    });

    afterEach(() => {
      fs.removeSync(tmp);
      clearLibraryMetaReaderCache();
    });

    const mkPkg = (name: string, withSidecar: boolean) => {
      const root = path.join(tmp, 'node_modules', name);
      fs.outputJsonSync(path.join(root, 'package.json'), { name });
      const fesm = path.join(root, 'fesm2022', `${name}.mjs`);
      fs.outputFileSync(
        fesm,
        'export class FooComponent { static ɵcmp = ɵɵdefineComponent({}); }\n',
      );
      if (withSidecar) {
        fs.outputJsonSync(path.join(root, LIBRARY_META_FILE_NAME), {
          schemaVersion: LIBRARY_META_SCHEMA_VERSION,
          generator: 'angular-miniprogram',
          entries: {},
        });
      }
      return fesm;
    };

    it('带合法 sidecar 的包 → true', () => {
      expect(isMpLibraryFile(mkPkg('mp-lib', true))).toBe(true);
    });

    it('没有 sidecar 的包 → false（@angular/common 这类就走这里）', () => {
      expect(isMpLibraryFile(mkPkg('plain-lib', false))).toBe(false);
    });

    it('sidecar 存在但 schema 不合法 → false，不能当自己人', () => {
      const fesm = mkPkg('broken-lib', false);
      fs.outputJsonSync(
        path.join(path.dirname(path.dirname(fesm)), LIBRARY_META_FILE_NAME),
        {
          generator: 'someone-else',
        },
      );
      expect(isMpLibraryFile(fesm)).toBe(false);
    });

    it('包根本来就没有 package.json（找不到包根）→ false', () => {
      const orphan = path.join(tmp, 'loose.mjs');
      fs.outputFileSync(orphan, 'ɵɵdefineComponent({})');
      expect(isMpLibraryFile(orphan)).toBe(false);
    });
  });
});

describe('键的选择：组件名，不是文件路径', () => {
  let tmp: string;
  let declaredFesm: string;
  let strayFile: string;

  /** 无组件的文件（worker / schematics / 工具 JS） */
  const strayCode = `export const y = 2;\nfunction helper(){ return 1; }\n`;
  /** 带一个组件的 AOT 产物形状 */
  const componentCode = `class MyComp {\n  static ɵcmp = ɵɵdefineComponent({ type: MyComp, decls: 1, vars: 0 });\n}\n`;

  beforeEach(() => {
    clearLibraryMetaReaderCache();
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-meta-keymismatch-'));
    const root = path.join(tmp, 'node_modules', 'mp-lib');
    fs.outputJsonSync(path.join(root, 'package.json'), { name: 'mp-lib' });
    declaredFesm = path.join(root, 'fesm2022', 'mp-lib.mjs');
    fs.outputFileSync(declaredFesm, componentCode);
    // 同一个包里一个**不是任何 entry fesm** 的文件（worker / schematics / 测试 bundle）
    strayFile = path.join(root, 'fesm2022', 'worker.mjs');
    fs.outputFileSync(strayFile, 'export const y = 2;');
    fs.outputJsonSync(path.join(root, LIBRARY_META_FILE_NAME), {
      schemaVersion: LIBRARY_META_SCHEMA_VERSION,
      generator: 'angular-miniprogram',
      entries: {
        'types/mp-lib.d.ts': {
          moduleId: 'mp-lib',
          typings: 'types/mp-lib.d.ts',
          fesm: 'fesm2022/mp-lib.mjs',
          directives: {},
          components: {
            MyComp: {
              listeners: [],
              properties: [],
              outputPath: '/mp-lib/my-comp',
              content: '<view/>',
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    fs.removeSync(tmp);
    clearLibraryMetaReaderCache();
  });

  it('注入闸门是包级的：非 entry 文件也判 true', () => {
    // component-transform.plugin 用这个决定「要不要注 propertyChange」
    expect(isMpLibraryFile(declaredFesm)).toBe(true);
    expect(isMpLibraryFile(strayFile)).toBe(true);
  });

  it('emit 侧是文件级的：同一个非 entry 文件匹配不到 entry', () => {
    const meta = readLibraryMetaForModule(strayFile);
    expect(meta).toBeDefined();
    expect(meta!.entry).toBeUndefined();
    expect(meta!.entries.length).toBe(1);
  });

  /**
   * 修好之后，决定「要不要处理这个文件」的没有是文件路径，而是
   * **这个文件里到底有没有组件**。
   *
   * `isMpLibraryFile` 退回到它该干的事：只做生态判定（这个包归不归本
   * 工具链管）。它不再决定 emit 范围 —— 以前就是在这里越界，才导致
   * 碰一个无关文件就整包 emit。
   */
  it('无组件的文件 detectComponentNames 返回空 → 不处理', () => {
    expect(detectComponentNames(strayCode)).toEqual([]);
    // 包根确实有 sidecar，但这跟「该不该 emit 组件」是两件事
    expect(isMpLibraryFile(strayFile)).toBe(true);
  });

  it('有组件的文件能检出组件名，且能在清单里查到（覆盖检查的依据）', () => {
    const names = detectComponentNames(componentCode);
    expect(names).toEqual(['MyComp']);
    const meta = readLibraryMetaForModule(declaredFesm);
    const covered = names.every((n) =>
      Object.prototype.hasOwnProperty.call(
        meta!.entries.find((e) => e.components?.[n])?.components ?? {},
        n,
      ),
    );
    expect(covered)
      .withContext('检出的组件必须能在清单里查到，查不到就该报错')
      .toBeTrue();
  });

  it('检出组件不在清单里 → covered 为 false（就是主构建该报错的情形）', () => {
    const names = detectComponentNames(componentCode);
    const emptyMeta: LibraryMetaFile = {
      schemaVersion: LIBRARY_META_SCHEMA_VERSION,
      generator: 'angular-miniprogram',
      entries: {
        'types/x.d.ts': {
          moduleId: 'x',
          typings: 'types/x.d.ts',
          directives: {},
          components: {},
        },
      },
    };
    const missing = names.filter((n) =>
      !emptyMeta.entries
        ? true
        : !Object.values(emptyMeta.entries).some((e) => e.components?.[n]),
    );
    expect(missing).toEqual(['MyComp']);
  });
});
/**
 * 库模板渲染：`es-toolkit/compat` 的 `template`，分隔符自定义成 `${x}`。
 *
 * 这里钉住六件事：
 *   ✅ 三种插槽都能按目标平台的值正确渲染
 *   ✅ wxml 自己的 `{{}}` 插值原样透传（`${}` 与它不撞，无需转义）
 *   ✅ 同一份模板串渲染成两个平台（库里不烘平台信息）
 *   ✅ 未登记的插值大声抛错，绝不静默求值
 *   ✅ 不做 HTML 转义（否则 wxml 属性会被 `&lt;` 之类污染）
 *   ✅ lodash 默认的 `<% %>` / `<%- %>` 已关闭，不会执行 JS 也不会转义
 */
describe('mp-template（es-toolkit template + ${} 分隔符 + 白名单预检）', () => {
  const wxValues: LibraryTemplateValues = {
    directivePrefix: 'wx',
    fileExtname: {
      style: '.wxss',
      logic: '.js',
      content: '.wxml',
      contentTemplate: '.wxml',
    },
    eventListConvert: (list) => (list.length ? `bind:${list.join(',')}` : ''),
  };

  const zfbValues: LibraryTemplateValues = {
    directivePrefix: 'a',
    fileExtname: {
      style: '.acss',
      logic: '.js',
      content: '.axml',
      contentTemplate: '.axml',
    },
    eventListConvert: (list) =>
      list.map((e) => `on${e[0].toUpperCase()}${e.slice(1)}`).join(' '),
  };

  it('${directivePrefix} 按平台渲染', () => {
    expect(
      renderLibraryTemplate('<block ${directivePrefix}:if="x">', wxValues),
    ).toBe('<block wx:if="x">');
    expect(
      renderLibraryTemplate('<block ${directivePrefix}:if="x">', zfbValues),
    ).toBe('<block a:if="x">');
  });

  it('${eventListConvert([...])} 走函数调用', () => {
    expect(
      renderLibraryTemplate('<v ${eventListConvert(["tap"])} />', wxValues),
    ).toBe('<v bind:tap />');
    expect(
      renderLibraryTemplate(
        '<v ${eventListConvert(["tap", "blur"])} />',
        zfbValues,
      ),
    ).toBe('<v onTap onBlur />');
  });

  it('空事件列表渲染成空串（不残留属性）', () => {
    expect(
      renderLibraryTemplate('<v ${eventListConvert([])} />', wxValues),
    ).toBe('<v  />');
  });

  it('${fileExtname.contentTemplate} 从 context 取', () => {
    expect(
      renderLibraryTemplate(
        '<import src="/lib/self${fileExtname.contentTemplate}"/>',
        wxValues,
      ),
    ).toBe('<import src="/lib/self.wxml"/>');
    expect(
      renderLibraryTemplate(
        '<import src="/lib/self${fileExtname.contentTemplate}"/>',
        zfbValues,
      ),
    ).toBe('<import src="/lib/self.axml"/>');
  });

  it('wxml 自己的 {{}} 插值原样透传，无需转义', () => {
    expect(
      renderLibraryTemplate('<view a="{{hasLoad}}">x</view>', wxValues),
    ).toBe('<view a="{{hasLoad}}">x</view>');
  });

  it('wxml 带下标 / 复杂路径也原样透传', () => {
    expect(
      renderLibraryTemplate('<view a="{{nodeList[1].value}}"/>', wxValues),
    ).toBe('<view a="{{nodeList[1].value}}"/>');
  });

  it('真实形态：插槽 + wxml 插值混排，两个平台各渲染一次', () => {
    const src =
      '<block ${directivePrefix}:if="{{hasLoad}}">' +
      '<view class="{{nodeList[0].class}}" ${eventListConvert(["tap"])}>' +
      '{{nodeList[1].value}}</view></block>';

    expect(renderLibraryTemplate(src, wxValues)).toBe(
      '<block wx:if="{{hasLoad}}"><view class="{{nodeList[0].class}}" bind:tap>' +
        '{{nodeList[1].value}}</view></block>',
    );
    expect(renderLibraryTemplate(src, zfbValues)).toBe(
      '<block a:if="{{hasLoad}}"><view class="{{nodeList[0].class}}" onTap>' +
        '{{nodeList[1].value}}</view></block>',
    );
  });

  it('不做 HTML 转义（否则 wxml 属性会被污染）', () => {
    expect(
      renderLibraryTemplate('${directivePrefix}', {
        ...wxValues,
        directivePrefix: 'a<b>&"c',
      }),
    ).toBe('a<b>&"c');
  });

  it('lodash 默认 <% %> 已关闭：不会执行 JS', () => {
    expect(renderLibraryTemplate('a <% var z = 6 * 7; %> b', wxValues)).toBe(
      'a <% var z = 6 * 7; %> b',
    );
  });

  /**
   * 上面那条「不做 HTML 转义」就是这条不变式的守门人。
   *
   * lodash 把 escape / interpolate / evaluate 并成一个交替式，靠捕获组
   * 序号区分三者。把 `NEVER` 从 `/()(?!)/g` 「简化」成 `/(?!)/g`（0 组），
   * 组号会整体左移，`interpolate` 的捕获落到 `escape` 位，上面那条
   * 立刻变红。改之前先读懂 `mp-template.ts` 里 `NEVER` 的注释。
   */
  it('NEVER 必须恰好 1 个捕获组（少了会被当成 escape 路径）', () => {
    const never = /()(?!)/g;
    const broken = /(?!)/g;
    expect(never.source).toBe('()(?!)');
    // 捕获组判据：`(` 后面不跟 `?`（跟了就是 (?: / (?= / (?! 等非捕获）
    const groups = (src: string) => (src.match(/\((?!\?)/g) || []).length;
    expect(groups(never.source)).toBe(1);
    expect(groups(broken.source)).toBe(0);
    // 两者都永不匹配
    expect('anything'.match(never)).toBeNull();
    expect('anything'.match(broken)).toBeNull();
  });

  it('lodash 默认 <%- %> / <%= %> 已关闭：保持字面', () => {
    expect(renderLibraryTemplate('a <%- v %> <%= v %> b', wxValues)).toBe(
      'a <%- v %> <%= v %> b',
    );
  });

  it('未登记插值抛错（未知名字）', () => {
    expect(() =>
      renderLibraryTemplate('<v ${bogus} />', wxValues),
    ).toThrowError(/未登记的插值/);
  });

  it('全局逃逸 ${Math.random()} 被白名单挡掉（否则会静默出数）', () => {
    expect(() =>
      renderLibraryTemplate('<v ${Math.random()} />', wxValues),
    ).toThrowError(/未登记的插值/);
  });

  it('用户文本里的字面 ${100} 不会被静默求值', () => {
    expect(() =>
      renderLibraryTemplate('<view>价格${100}</view>', wxValues),
    ).toThrowError(/未登记的插值/);
  });

  it('多个未知名一次性全报出来', () => {
    let msg = '';
    try {
      renderLibraryTemplate('${aaa} ${bbb} ${directivePrefix}', wxValues);
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(msg).toContain('aaa');
    expect(msg).toContain('bbb');
  });

  it('静态段里的危险字符不影响', () => {
    expect(renderLibraryTemplate('a`b', wxValues)).toBe('a`b');
    expect(renderLibraryTemplate('a\\b\\nb', wxValues)).toBe('a\\b\\nb');
    expect(renderLibraryTemplate(`a'b"c`, wxValues)).toBe(`a'b"c`);
    expect(renderLibraryTemplate('a\r\nb', wxValues)).toBe('a\r\nb');
  });

  it('渲染器复用编译缓存：同一模板多次渲染结果一致', () => {
    const render = createLibraryTemplateRenderer(wxValues);
    expect(render('<v ${directivePrefix} />')).toBe('<v wx />');
    expect(render('<v ${directivePrefix} />')).toBe('<v wx />');
    expect(render('<w ${directivePrefix} />')).toBe('<w wx />');
  });

  it('非字符串输入抛 TypeError', () => {
    expect(() =>
      renderLibraryTemplate(undefined as any, wxValues),
    ).toThrowError(TypeError);
  });
});

describe('library-meta-diagnostics（缺失诊断）', () => {
  beforeEach(() => clearLibraryMetaMisses());
  afterEach(() => clearLibraryMetaMisses());

  it('@angular/* 不登记，汇总为空', () => {
    recordLibraryMetaMiss({
      className: 'NgIf',
      sourceFile: 'C:/w/node_modules/@angular/common/fesm2022/common.mjs',
      reason: 'no-sidecar',
    });
    recordLibraryMetaMiss({
      className: 'DatePipe',
      sourceFile: 'C:/w/node_modules/@angular/common/fesm2022/common.mjs',
      reason: 'sidecar-missing-class',
    });
    expect(getLibraryMetaMisses().length).toBe(0);
    expect(formatLibraryMetaSummary()).toBe('');
  });

  it('第三方库缺失照常上报', () => {
    recordLibraryMetaMiss({
      className: 'ExtButton',
      sourceFile: '/w/node_modules/other-lib/index.d.ts',
      reason: 'no-sidecar',
    });
    const summary = formatLibraryMetaSummary();
    expect(summary).toContain('ExtButton');
    expect(summary).toContain('没有元数据文件的包');
  });

  it('sidecar-missing-class 排在 no-sidecar 前面', () => {
    recordLibraryMetaMiss({
      className: 'A',
      sourceFile: '/w/node_modules/other-lib/a.d.ts',
      reason: 'no-sidecar',
    });
    recordLibraryMetaMiss({
      className: 'B',
      sourceFile: '/w/node_modules/other-lib/b.d.ts',
      reason: 'sidecar-missing-class',
    });
    const summary = formatLibraryMetaSummary();
    expect(summary.indexOf('B')).toBeLessThan(summary.indexOf('A'));
  });

  it('按路径段判定，不被同名目录误判', () => {
    expect(isAngularFrameworkSource('/a/my-angular-common/x.ts')).toBeFalse();
    expect(isAngularFrameworkSource('/a/angular/x.ts')).toBeFalse();
    expect(
      isAngularFrameworkSource('C:\\w\\node_modules\\@angular\\core\\x.mjs'),
    ).toBeTrue();
    expect(
      isAngularFrameworkSource(
        '/w/node_modules/.pnpm/@angular+common@1.0.0/node_modules/@angular/common/y.mjs',
      ),
    ).toBeTrue();
  });

  it('去重：同一类重复登记只记一次', () => {
    const miss = {
      className: 'ExtButton',
      sourceFile: '/w/node_modules/other-lib/index.d.ts',
      reason: 'no-sidecar' as const,
    };
    recordLibraryMetaMiss(miss);
    recordLibraryMetaMiss(miss);
    expect(getLibraryMetaMisses().length).toBe(1);
  });
});
