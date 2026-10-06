import ts from 'typescript';
import {
  MP_ENTRY_BOOTSTRAP,
  detectEntryComponentFromSource,
  isCustomTabbarOutput,
} from './entry-component';

const detect = (code: string) => detectEntryComponentFromSource(code);

describe('entry-component: 入口组件标记', () => {
  it('re-export 形态：export { X as default } from', () => {
    const found = detect(
      `export { FooComponent as default } from './foo.component';`,
    );
    expect(found?.getText()).toBe('FooComponent');
  });

  it('本地组件：export default X', () => {
    const found = detect(`const Foo = 1;\nexport default Foo;`);
    expect(found?.getText()).toBe('Foo');
  });

  it('组件直接声明在入口里也能取到', () => {
    const found = detect(`export class Inline {}\nexport default Inline;`);
    expect(found?.getText()).toBe('Inline');
  });

  it('入口里还有别的代码不影响判定', () => {
    const found = detect(
      `import { x } from './x';\n(globalThis as any).p = x;\n` +
        `export { Foo as default } from './foo';`,
    );
    expect(found?.getText()).toBe('Foo');
  });

  it('只有具名导出时取不到组件', () => {
    expect(detect(`export class Foo {}`)).toBeUndefined();
    expect(detect(`export { Foo } from './foo';`)).toBeUndefined();
  });

  it('每种入口类型对应一个注册函数', () => {
    expect(MP_ENTRY_BOOTSTRAP).toEqual({
      page: 'bootstrapPage',
      component: 'componentRegistry',
      tabbar: 'bootstrapCustomTabbar',
    });
  });

  it('产物落在平台的 tabBar 目录才算 tabBar', () => {
    expect(isCustomTabbarOutput('custom-tab-bar/index', 'custom-tab-bar')).toBe(
      true,
    );
    expect(isCustomTabbarOutput('custom-tab-bar', 'custom-tab-bar')).toBe(true);
    // 支付宝的目录名不是这个
    expect(
      isCustomTabbarOutput('custom-tab-bar/index', 'customize-tab-bar'),
    ).toBe(false);
    expect(
      isCustomTabbarOutput('customize-tab-bar/index', 'customize-tab-bar'),
    ).toBe(true);
    expect(
      isCustomTabbarOutput('pages/custom-tab-bar/index', 'custom-tab-bar'),
    ).toBe(false);
    expect(isCustomTabbarOutput('components/x/x', 'custom-tab-bar')).toBe(
      false,
    );
    // 平台没有自定义 tabBar 时一律判否
    expect(isCustomTabbarOutput('custom-tab-bar/index', undefined)).toBe(false);
  });
});

/** 文本版与 AST 版同源，这里确认 SourceFile 形态也能解析 */
describe('entry-component: SourceFile 入口', () => {
  it('解析出的表达式可用于 symbol 查询', () => {
    const code = `export { Foo as default } from './foo';`;
    ts.createSourceFile('a.entry.ts', code, ts.ScriptTarget.Latest, true);
    expect(detectEntryComponentFromSource(code)).toBeTruthy();
  });
});
