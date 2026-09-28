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
import {
  clearLibraryMetaReaderCache,
  findLibraryPackageRoot,
  lookupLibraryMeta,
} from './library-meta-reader';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
} from './library-meta-schema';
import {
  clearLibraryMetaStore,
  recordLibraryComponentMeta,
  recordLibraryDirectiveMeta,
  registerLibraryMetaEntry,
  writeLibraryMetaFile,
} from './library-meta-store';

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

  const writeSidecar = (file: unknown) => {
    fs.writeFileSync(
      path.join(tmp, LIBRARY_META_FILE_NAME),
      JSON.stringify(file),
      'utf8',
    );
    // 显式推进 mtime，绕开文件系统时间粒度导致缓存不失效的假阴性
    const now = Date.now() / 1000 + 10;
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
