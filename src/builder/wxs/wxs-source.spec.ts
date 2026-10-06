import { parseWxsSource } from './wxs-source';

const parse = (code: string) => parseWxsSource(code, 'test', '/x/test.wxs');

describe('wxs 源解析: 导出成员', () => {
  it('module.exports 对象字面量', () => {
    const m = parse(`
      var a = 1
      function f() {}
      module.exports = { a: a, f: f }
    `);
    expect(m.exports.sort()).toEqual(['a', 'f']);
  });

  it('简写属性', () => {
    const m = parse(`
      var a = 1
      module.exports = { a }
    `);
    expect(m.exports).toEqual(['a']);
  });

  it('字符串键', () => {
    const m = parse(`module.exports = { "kebab-name": 1 }`);
    expect(m.exports).toEqual(['kebab-name']);
  });

  it('exports.x = ... 逐个赋值', () => {
    const m = parse(`
      exports.a = 1
      exports.b = function () {}
    `);
    expect(m.exports.sort()).toEqual(['a', 'b']);
  });

  it('计算键不收集（静态无从得知）', () => {
    const m = parse(`var k='x'; module.exports = { [k]: 1 }`);
    expect(m.exports).toEqual([]);
  });

  it('空模块合法', () => {
    expect(parse(`var a = 1`).exports).toEqual([]);
  });
});

describe('wxs 源解析: callMethod 名单', () => {
  it('提取字面量方法名', () => {
    const m = parse(`
      module.exports = {
        f: function (e, owner) {
          owner.callMethod('onTap', { id: 1 })
          owner.instance.callMethod('other')
        }
      }
    `);
    expect(m.callMethods.sort()).toEqual(['onTap', 'other']);
  });

  it('去重', () => {
    const m = parse(`
      function a(o) { o.callMethod('x') }
      function b(o) { o.callMethod('x') }
    `);
    expect(m.callMethods).toEqual(['x']);
  });

  it('动态方法名不收集', () => {
    const m = parse(`o.callMethod(name)`);
    expect(m.callMethods).toEqual([]);
  });

  it('同名非 callMethod 不误收', () => {
    const m = parse(`o.callSomething('x')`);
    expect(m.callMethods).toEqual([]);
  });
});

describe('wxs 源解析: 语法白名单', () => {
  const bad: Array<[string, string]> = [
    ['async', `async function f() {}`],
    ['await', `function f() { await g() }`],
    ['class', `class A {}`],
    ['try', `function f() { try {} catch (e) {} }`],
    ['import', `import x from 'y'`],
    ['模板字符串插值', 'var a = `x${y}`'],
  ];

  bad.forEach(([label, code]) => {
    it(`拒绝 ${label}`, () => {
      let message = '';
      try {
        parse(code);
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toContain('不支持的语法');
    });
  });

  it('合法 ES5 方言不报错', () => {
    expect(() =>
      parse(`
        var n = 0
        function add(a, b) { return a + b }
        var obj = { k: 'v', arr: [1, 2] }
        for (var i = 0; i < 3; i++) { n = n + i }
        if (n > 1) { n = 0 } else { n = 1 }
        module.exports = { add: add, obj: obj }
      `),
    ).not.toThrow();
  });
});
