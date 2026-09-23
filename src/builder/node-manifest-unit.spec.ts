import {
  extractManifestsFromSource,
  extractViewTreesFromSource,
} from '../../test/util/node-manifest';

/**
 * 提取器的最小单测。
 *
 * 目的：在改 walk 之前先把「提取器对各种 codegen 形态的行为」钉死。
 * 上一轮直接改 walk 再跑 100+ spec 的大测试，在噪音里定位不动，
 * 所以这次先要一个能秒级反馈的小闭环。
 */
describe('node-manifest 提取器：codegen 形态', () => {
  const wrap = (body: string) =>
    [
      'const c = ɵɵdefineComponent({',
      '  type: FooComponent,',
      '  template: function Foo_Template(rf, ctx) {',
      '    if (rf & 1) {',
      body,
      '    }',
      '  }',
      '});',
    ].join('\n');

  it('基线：普通独立调用', () => {
    const src = wrap(
      ['ɵɵelementStart(0, "div");', 'ɵɵtext(1, "hi");', 'ɵɵelementEnd();'].join(
        '\n'
      )
    );
    const ms = extractManifestsFromSource(src, 't.js');
    expect(ms.length).toBe(1);
    expect([...ms[0].indices].sort((a, b) => a - b)).toEqual([0, 1]);
  });

  it('链式调用：ɵɵelementStart(a)(b) 应识别出两个节点下标', () => {
    // 真实 codegen：ɵɵelementStart 返回 typeof ɵɵelementStart，
    // 所以连续调用会被写成链
    const src = wrap(
      [
        'ɵɵelementStart(0, "div");',
        'ɵɵelementStart(1, "span")(2, "p", 0);',
        'ɵɵtext(3, "hi");',
        'ɵɵelementEnd();',
      ].join('\n')
    );

    const ms = extractManifestsFromSource(src, 't.js');
    expect(ms.length).toBe(1);
    expect([...ms[0].indices].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it('elementEnd()() 这种链式闭合不应贡献节点下标', () => {
    const src = wrap(
      [
        'ɵɵelementStart(0, "div");',
        'ɵɵtext(1, "hi");',
        'ɵɵelementEnd()();',
      ].join('\n')
    );
    const ms = extractManifestsFromSource(src, 't.js');
    expect([...ms[0].indices].sort((a, b) => a - b)).toEqual([0, 1]);
  });

  it('dom 系列链式：domElementStart(a)(b)', () => {
    const src = wrap(
      [
        'ɵɵdomElementStart(0, "view");',
        'ɵɵdomElementStart(1, "view")(2, "text", 0);',
        'ɵɵdomElementEnd();',
      ].join('\n')
    );
    const ms = extractManifestsFromSource(src, 't.js');
    expect([...ms[0].indices].sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('视图树：链式 template 引用应解析出子视图', () => {
    const src = [
      'function Foo_A_Template(rf, ctx) {',
      '  if (rf & 1) { ɵɵelementStart(0, "b"); ɵɵelementEnd(); }',
      '}',
      'const c = ɵɵdefineComponent({',
      '  type: FooComponent,',
      '  template: function Foo_Template(rf, ctx) {',
      '    if (rf & 1) {',
      '      ɵɵelementStart(0, "div");',
      '      ɵɵtemplate(1, Foo_A_Template, 1, 0, "ng-template");',
      '      ɵɵelementEnd();',
      '    }',
      '  }',
      '});',
    ].join('\n');
    const trees = extractViewTreesFromSource(src, 't.js');
    expect(trees.length).toBe(1);
    expect(trees[0].views.length).toBe(2);
  });

  it('repeaterCreate 的锚点槽必须被记入（@for 主模板与 @empty）', () => {
    // 真实形态：Angular 把主/空模板都作为参数传入，不为锚点单独发指令
    const src = [
      'function App_For_11_Template(rf, ctx) {',
      '  if (rf & 1) { ɵɵelementStart(0, "li"); ɵɵelementEnd(); }',
      '}',
      'function App_ForEmpty_12_Template(rf, ctx) {',
      '  if (rf & 1) { ɵɵelementStart(0, "p"); ɵɵelementEnd(); }',
      '}',
      'const c = ɵɵdefineComponent({',
      '  type: FooComponent,',
      '  template: function Foo_Template(rf, ctx) {',
      '    if (rf & 1) {',
      '      ɵɵelementStart(0, "ul");',
      '      ɵɵrepeaterCreate(',
      '        1,',
      '        App_For_11_Template,',
      '        2,',
      '        3,',
      '        "li",',
      '        0,',
      '        ɵɵrepeaterTrackByIdentity,',
      '        false,',
      '        App_ForEmpty_12_Template,',
      '        2,',
      '        0,',
      '        "p",',
      '        1',
      '      );',
      '      ɵɵelementEnd();',
      '    }',
      '  }',
      '});',
    ].join('\n');

    const trees = extractViewTreesFromSource(src, 't.js');
    expect(trees.length).toBe(1);
    const all = new Set<number>();
    for (const v of trees[0].views) {
      for (const i of v.indices) {
        all.add(i);
      }
    }
    // 1 = RepeaterMetadata，11/12 = 主/空模板锚点
    expect([...all].sort((a, b) => a - b)).toEqual([0, 1, 11, 12]);
  });
});
