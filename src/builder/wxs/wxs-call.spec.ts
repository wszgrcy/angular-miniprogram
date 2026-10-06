/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { containsWxsRoot, matchWxsCall, matchWxsHandler } from './wxs-call';

/**
 * 测试用声明集合：识别靠声明，裸名必须先声明才算 wxs 模块。
 * 真实管线里这个集合来自模板的 `<wxs module=...>` 声明。
 */
const DECLARED = new Set([
  'mod',
  'util',
  'm',
  'obj',
  'format',
  'u',
  'test',
  'f',
  'fn',
  'k',
  'evt',
  'other',
]);

/** 从模板片段里取出第 n 个「输入绑定 / 输出绑定 / 插值」的表达式 AST */
function firstAst(html: string, kind: 'input' | 'output' | 'text'): any {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  let found: any = undefined;
  const walk = (ns: any[]) =>
    (ns || []).forEach((n: any) => {
      if (kind === 'input' && n.inputs?.length && found === undefined) {
        found = n.inputs[0].value.ast;
      }
      if (kind === 'output' && n.outputs?.length && found === undefined) {
        found = n.outputs[0].handler.ast;
      }
      if (kind === 'text' && n.value?.ast && found === undefined) {
        found = n.value.ast;
      }
      walk(n.children || []);
    });
  walk(r.nodes);
  return found;
}

describe('wxs-call: 属性绑定精确匹配', () => {
  it('mod.fn(a, b)', () => {
    const ast = firstAst(`<div [foo]="mod.fn(a, 'x')"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toEqual({
      module: 'mod',
      fn: 'fn',
      arity: 2,
    });
  });

  it('零参数', () => {
    const ast = firstAst(`<div [foo]="mod.fn()"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toEqual({
      module: 'mod',
      fn: 'fn',
      arity: 0,
    });
  });

  it('this.mod.fn 也认', () => {
    const ast = firstAst(`<div [foo]="this.mod.fn(a)"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toEqual({
      module: 'mod',
      fn: 'fn',
      arity: 1,
    });
  });

  it('普通调用不认', () => {
    const ast = firstAst(`<div [foo]="go(a)"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toBeNull();
  });

  it('只有两层 mod 不认（缺函数名）', () => {
    const ast = firstAst(`<div [foo]="mod()"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toBeNull();
  });

  it('未声明的名字不认（走逻辑层，不是 wxs）', () => {
    // 新架构下识别集合就是定义：没声明过的名字永远是普通 Angular 属性访问。
    // 这里 `ghostFn` 不在 DECLARED 里，即使形状完全一致也不能认。
    const ast = firstAst(`<div [foo]="ghost.fn()"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toBeNull();
  });

  it('挂在别的对象下不算（必须直接挂模板隐式接收者）', () => {
    const ast = firstAst(`<div [foo]="vm.mod.fn()"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toBeNull();
  });

  it('引用（无调用）不认', () => {
    const ast = firstAst(`<div [foo]="mod.fn"></div>`, 'input');
    expect(matchWxsCall(ast, DECLARED)).toBeNull();
  });
});

describe('wxs-call: 事件 handler 匹配', () => {
  it('mod.fn 引用形态', () => {
    const ast = firstAst(`<div (tap)="mod.fn"></div>`, 'output');
    expect(matchWxsHandler(ast, DECLARED)).toEqual({ module: 'mod', fn: 'fn' });
  });

  it('带调用不算 handler（与 uni-app 约定一致）', () => {
    const ast = firstAst(`<div (tap)="mod.fn($event)"></div>`, 'output');
    expect(matchWxsHandler(ast, DECLARED)).toBeNull();
  });

  it('普通 handler 不认', () => {
    const ast = firstAst(`<div (tap)="go()"></div>`, 'output');
    expect(matchWxsHandler(ast, DECLARED)).toBeNull();
  });
});

describe('wxs-call: containsWxsRoot', () => {
  it('嵌套在二元表达式里也能发现', () => {
    const ast = firstAst(`<div [foo]="f(a) + 1"></div>`, 'input');
    expect(containsWxsRoot(ast, DECLARED)).toBe(true);
  });

  it('字符串拼接里也能发现', () => {
    const ast = firstAst(`<div>{{ "x" + f(a) }}</div>`, 'text');
    expect(containsWxsRoot(ast, DECLARED)).toBe(true);
  });

  it('不含 wxs 返回 false', () => {
    const ast = firstAst(`<div [foo]="a + 1"></div>`, 'input');
    expect(containsWxsRoot(ast, DECLARED)).toBe(false);
  });
});

describe('wxs-call: containsWxsRoot 容器覆盖', () => {
  /**
   * CHILD_KEYS 漏一个字段 = 漏一类节点。
   *
   * 漏检的后果是「写了 wxs 但被当成普通表达式」，静默产出错误代码，
   * 比报错糟糕得多。这里把各类容器逐个锁住。
   */
  const detects = (html: string) => {
    const ast = firstAst(html, 'input');
    return containsWxsRoot(ast, DECLARED);
  };

  it('LiteralMap 的 values 里能检出（曾漏检的回归点）', () => {
    expect(detects(`<div [foo]="{a: m.f(x)}"></div>`)).toBe(true);
  });

  it('LiteralMap 多个 value 里任一都能检出', () => {
    expect(detects(`<div [foo]="{a: 1, b: 2, c: m.f(x)}"></div>`)).toBe(true);
  });

  it('LiteralArray 里能检出', () => {
    expect(detects(`<div [foo]="[1, m.f(x)]"></div>`)).toBe(true);
  });

  it('嵌套容器里能检出', () => {
    expect(detects(`<div [foo]="{a: {b: [m.f(x)]}}"></div>`)).toBe(true);
  });

  it('三元 / 逻辑 / 比较里能检出', () => {
    expect(detects(`<div [foo]="x ? m.f(1) : 2"></div>`)).toBe(true);
    expect(detects(`<div [foo]="x && m.f(1)"></div>`)).toBe(true);
    expect(detects(`<div [foo]="!m.f(1)"></div>`)).toBe(true);
  });

  it('不含 wxs 的同类容器不误报', () => {
    expect(detects(`<div [foo]="{a: 1, b: [2, 3]}"></div>`)).toBe(false);
    expect(detects(`<div [foo]="x && y"></div>`)).toBe(false);
  });
});
