import { json } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  LIBRARY_BUILD_OPTIONS,
  LIBRARY_OUTPUT,
} from '../../../test/library-fixture';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryMetaFile,
} from './library-meta-schema';

/**
 * `angular-miniprogram:library` builder 的产物契约。
 *
 * ## 这里不构建
 *
 * 构建在 `test/global-setup.ts` 里，走的正是同一个 `execute()`
 * （harness 本来也是直接调 `execute`，没经过 `createBuilder`），
 * 产物落在 `test/hello-world-app/dist/test-library`。再构建一遍就是白付 2s。
 * 那边构建失败会带着 ng-packagr 的原始错误直接终止整套测试。
 *
 * 于是这里只剩两件必须钉住的事：
 *   1. 制品的内容契约（fesm 干净 + sidecar 元数据正确）
 *   2. builder 的 options schema —— harness 时代是 `executeOnce()` 顺带校验的，
 *      现在显式验一次，而且直接读**出厂那份** `schema.json`
 *      （以前 harness 校验的是 `test/test-builder/schema.library.json` 手抄副本，
 *      迟早和出厂的对不上）
 */
const OUTPUT = LIBRARY_OUTPUT;
const SHIPPED_SCHEMA = path.resolve(__dirname, 'schema.json');

const fesmPath = path.join(OUTPUT, 'fesm2022', 'test-library.mjs');
const secondaryFesmPath = path.join(
  OUTPUT,
  'fesm2022',
  'test-library-src-secondary.mjs',
);

/** 库 JS 里一个都不该出现的 mp 内联标记，各自对应一条已废弃的旧通道 */
const MP_OFFENDERS = [
  'angular-miniprogram', // 注入的 `import * as amp ...`
  'propertyChange', // 注入的运行时 hook 调用
  '_ExtraData', // 组件模板载荷内联变量
  'Global_Template', // 全局模板内联变量
];

function readMeta(): LibraryMetaFile {
  return JSON.parse(
    fs.readFileSync(path.join(OUTPUT, LIBRARY_META_FILE_NAME), 'utf8'),
  ) as LibraryMetaFile;
}

describe('test-library 制品', () => {
  beforeAll(() => {
    // globalSetup 里构建失败会直接抛，正常到不了这里；
    // 真到了就给一句能读懂的话，而不是后面一串 ENOENT。
    expect(
      fs.existsSync(fesmPath),
      `没有 test-library 产物（${fesmPath}）；globalSetup 的库构建没跑成`,
    ).toBe(true);
  });

  // ng-packagr 19 起不再把逐文件的 ESM（esm2022）写到磁盘，
  // 只输出打包后的 fesm2022（以及 .d.ts），所以断言盯着 fesm2022。
  it('产出 fesm2022 入口', () => {
    expect(fs.existsSync(fesmPath)).toBe(true);
  });

  /**
   * **库产物必须与「普通 Angular 库」一模一样。**
   *
   * 以前这里断言的是 `toContain('$self_Global_Template')` —— 即库 JS 里
   * 必须带 mp 内联标记。现在方向反过来了：库构建只出
   * `mp-library-meta.json`，JS 产物里一个 mp 痕迹都不能有。
   */
  it('一级出口 JS 未被改写，不含任何 mp 内联标记', () => {
    const fesm = fs.readFileSync(fesmPath, 'utf8');
    expect(
      MP_OFFENDERS.filter((needle) => fesm.includes(needle)),
      '库 JS 产物不应被改写，不应出现任何 mp 内联标记',
    ).toEqual([]);
  });

  it('二级出口 JS 同样未被改写', () => {
    const fesm = fs.readFileSync(secondaryFesmPath, 'utf8');
    expect(
      MP_OFFENDERS.filter((needle) => fesm.includes(needle)),
      '二级出口的 JS 产物同样不应被改写',
    ).toEqual([]);
  });

  it('sidecar 版本与一级出口条目正确', () => {
    const meta = readMeta();
    expect(meta.schemaVersion).toBe(LIBRARY_META_SCHEMA_VERSION);
    const entry = meta.entries['types/test-library.d.ts'];
    expect(entry.fesm).toBe('fesm2022/test-library.mjs');
    expect(
      entry.selfTemplate?.template,
      '自引用模板应从 JS 搬进 sidecar',
    ).toContain('$$mp$$__self__$$libraryFirst');
  });

  it('一级出口组件的模板载荷 / usingComponents / 样式都在 sidecar 里', () => {
    const comp =
      readMeta().entries['types/test-library.d.ts'].components
        .TestLibraryComponent;
    expect(typeof comp.content, 'content 应是 ${} 插值模板串').toBe('string');
    expect(comp.content).toContain('hasLoad');
    // 平台相关部分以 ${} 插值形式存在，而不是写死的平台前缀
    expect(comp.content).toContain('${directivePrefix}');
    expect(comp.useComponents?.['app-other']).toBe(
      '/library/test-library/other-component/other-component',
    );
    expect(comp.style).toContain('lib-test-library__body');
  });

  /**
   * 二级出口（`test-library/src/secondary`）。
   *
   * 多 entry point 的库必须和一级出口走完全相同的链路，不能只测
   * 「能编译过」：每个 entry 各自有自己的 `fesm`，各自带组件，
   * 主构建要按**组件名**分别对上。
   */
  it('二级出口走同一条链路，条目按组件名对上', () => {
    const secondary = Object.values(readMeta().entries).find((e) =>
      e.moduleId.endsWith('/secondary'),
    );
    expect(secondary, 'sidecar 应多出二级出口的 entry').toBeDefined();
    expect(secondary!.fesm).toBe('fesm2022/test-library-src-secondary.mjs');
    expect(Object.keys(secondary!.components)).toEqual([
      'SecondaryEntryComponent',
    ]);
  });

  it('二级出口组件的载荷不带写死的平台前缀', () => {
    const secComp = Object.values(readMeta().entries).find((e) =>
      e.moduleId.endsWith('/secondary'),
    )!.components.SecondaryEntryComponent;

    expect(secComp.listeners).toEqual(['tap']);
    expect(secComp.properties).toEqual(['class']);
    expect(secComp.style).toContain('.lib-secondary-entry__text');
    expect(typeof secComp.content, '二级出口 content 应是 ${} 插值模板串').toBe(
      'string',
    );
    // 平台相关部分留成 ${} 插值；wxml 自己的 {{}} 是静态文本，**不需要转义**
    expect(secComp.content).toContain('${directivePrefix}');
    expect(secComp.content).toContain('${eventListConvert(["tap"])}');
    expect(secComp.content).toContain('{{hasLoad}}');
    expect(secComp.content).not.toContain('\\{{');
    // 绝不能出现写死的平台前缀
    expect(secComp.content).not.toContain('wx:');
    expect(secComp.content).not.toContain('a:');
    expect(secComp.content).toContain('secondary entry works!');
  });
});

/**
 * builder 的 options schema。
 *
 * 以前由 harness 的 `executeOnce()` 顺带校验（走 architect 的
 * CoreSchemaRegistry），改成 globalSetup 直接调 `execute()` 之后这层没了，
 * 所以在这里显式补回来 —— 并且校验出厂那份 `schema.json`，
 * 而不是测试目录里的手抄副本。
 */
describe('library builder options schema', () => {
  const registry = new json.schema.CoreSchemaRegistry();
  registry.addPostTransform(json.schema.transforms.addUndefinedDefaults);
  const schema = JSON.parse(fs.readFileSync(SHIPPED_SCHEMA, 'utf8'));

  const check = async (options: json.JsonObject) => {
    const validate = await registry.compile(schema as json.JsonObject);
    return validate(options);
  };

  it('接受夹具实际使用的那组 options', async () => {
    const { success } = await check({ ...LIBRARY_BUILD_OPTIONS });
    expect(success).toBe(true);
  });
  it('缺 project 直接拒', async () => {
    const { success } = await check({ tsConfig: 'tsconfig.lib.json' });
    expect(success).toBe(false);
  });

  it('未知字段拒掉，不让拼错的 option 静默生效', async () => {
    const { success } = await check({
      ...LIBRARY_BUILD_OPTIONS,
      tsConfigr: 'typo',
    });
    expect(success).toBe(false);
  });
});
