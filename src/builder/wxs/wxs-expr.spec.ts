/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import {
  planWxsInterpolation,
  splitWxsExpression,
  wxmlLiteral,
} from './wxs-expr';

/** 测试用声明集合：识别靠声明，裸名必须先声明才算 wxs 模块 */
const DECLARED = new Set([
  'util',
  'mod',
  'm',
  'fmt',
  'format',
  'u',
  'test',
  'f',
  'fn',
  'k',
]);

/** 取第 n 个输入绑定的表达式 AST */
function inputAst(html: string, index = 0): any {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const found: any[] = [];
  const walk = (ns: any[]) =>
    (ns || []).forEach((n: any) => {
      (n.inputs || []).forEach((i: any) => found.push(i.value.ast));
      walk(n.children || []);
    });
  walk(r.nodes);
  return found[index];
}

/** 取第一个插值节点 */
function textAst(html: string): any {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  let found: any;
  const walk = (ns: any[]) =>
    (ns || []).forEach((n: any) => {
      if (!found && n.value?.ast) {
        found = n.value.ast;
      }
      walk(n.children || []);
    });
  walk(r.nodes);
  return found;
}

const catchErr = (fn: () => unknown): string => {
  try {
    fn();
    return '';
  } catch (e: any) {
    return String(e?.message ?? e);
  }
};

describe('wxs-expr: 字面量转 wxml', () => {
  it('数字 / 布尔 / null', () => {
    expect(wxmlLiteral(1)).toBe('1');
    expect(wxmlLiteral(-2.5)).toBe('-2.5');
    expect(wxmlLiteral(true)).toBe('true');
    expect(wxmlLiteral(null)).toBe('null');
  });

  it('undefined 归一成 null（各端表现不一致）', () => {
    expect(wxmlLiteral(undefined)).toBe('null');
  });

  it('字符串加单引号并转义', () => {
    expect(wxmlLiteral('hi')).toBe("'hi'");
    expect(wxmlLiteral("it's")).toBe("'it\\'s'");
    expect(wxmlLiteral('a\\b')).toBe("'a\\\\b'");
    expect(wxmlLiteral('a\nb')).toBe("'a\\nb'");
  });
});

describe('wxs-expr: 脊柱 / 枝叶拆分', () => {
  it('纯 wxs 调用：实参成为枝叶', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="util.add(a, b)"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('util.add(@@0@@, @@1@@)');
    expect(plan.freeVars.length).toBe(2);
    expect(plan.modules).toEqual(['util']);
  });

  it('字面量实参内联，不占物化名额', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="util.add(a, 2)"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('util.add(@@0@@, 2)');
    expect(plan.freeVars.length).toBe(1);
  });

  it('wxs + 字面量：运算符留在脊柱，字面量内联', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="util.add(a) + 1"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( util.add(@@0@@) + 1 )');
    expect(plan.freeVars.length).toBe(1);
  });

  it('wxs + 动态值：两侧各自物化', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="util.add(a) + b"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( util.add(@@0@@) + @@1@@ )');
    expect(plan.freeVars.length).toBe(2);
  });

  it('两个 wxs 调用相加', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="m.f(a) + m.g(b)"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( m.f(@@0@@) + m.g(@@1@@) )');
    expect(plan.freeVars.length).toBe(2);
    expect(plan.modules).toEqual(['m']);
  });

  it('嵌套 wxs 调用留在脊柱', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="util.add(util.mul(a, b), c)"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('util.add(util.mul(@@0@@, @@1@@), @@2@@)');
    expect(plan.freeVars.length).toBe(3);
  });

  it('wxs 成员引用（常量）直接渲染，零枝叶', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="test.msg"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('test.msg');
    expect(plan.freeVars.length).toBe(0);
  });

  it('成员引用与调用混合', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="test.msg + test.len(a)"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( test.msg + test.len(@@0@@) )');
    expect(plan.freeVars.length).toBe(1);
  });
});

describe('wxs-expr: 枝叶整体物化（最大子树）', () => {
  it('不含 wxs 的子树整棵成为一个枝叶，不拆散', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="m.f(a) + (b + c)"></div>`),
      DECLARED,
    );
    // b + c 是一个枝叶，不是两个
    expect(plan.wxml).toBe('( m.f(@@0@@) + @@1@@ )');
    expect(plan.freeVars.length).toBe(2);
  });

  it('枝叶里可以带管道', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="m.f(a) + (c | date)"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( m.f(@@0@@) + @@1@@ )');
    expect(plan.freeVars.length).toBe(2);
  });

  it('枝叶里可以带可选链和方法调用', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="m.f(a?.b) + obj.list[0].name"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( m.f(@@0@@) + @@1@@ )');
    expect(plan.freeVars.length).toBe(2);
  });

  it('枝叶里可以嵌套 wxs 之外的函数调用', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [foo]="m.f(helper(a, b)) + c"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( m.f(@@0@@) + @@1@@ )');
    expect(plan.freeVars.length).toBe(2);
  });
});

describe('wxs-expr: 运算符覆盖', () => {
  it('比较 / 逻辑 / 三元', () => {
    expect(
      splitWxsExpression(inputAst(`<div [x]="m.f(a) > 0"></div>`), DECLARED)
        .wxml,
    ).toBe('( m.f(@@0@@) > 0 )');
    expect(
      splitWxsExpression(
        inputAst(`<div [x]="m.f(a) && m.g(b)"></div>`),
        DECLARED,
      ).wxml,
    ).toBe('( m.f(@@0@@) && m.g(@@1@@) )');
    expect(
      splitWxsExpression(
        inputAst(`<div [x]="m.f(a) ? 'y' : 'n'"></div>`),
        DECLARED,
      ).wxml,
    ).toBe("( m.f(@@0@@) ? 'y' : 'n' )");
    expect(
      splitWxsExpression(inputAst(`<div [x]="!m.f(a)"></div>`), DECLARED).wxml,
    ).toBe('!m.f(@@0@@)');
  });

  it('括号节点保留', () => {
    const plan = splitWxsExpression(
      inputAst(`<div [x]="(m.f(a) + 1) * 2"></div>`),
      DECLARED,
    );
    expect(plan.wxml).toBe('( ( m.f(@@0@@) + 1 ) * 2 )');
  });

  it('字面量数组 / 对象可内联 wxs 结果', () => {
    expect(
      splitWxsExpression(inputAst(`<div [x]="[m.f(a), 1]"></div>`), DECLARED)
        .wxml,
    ).toBe('[m.f(@@0@@), 1]');
    expect(
      splitWxsExpression(inputAst(`<div [x]="{k: m.f(a)}"></div>`), DECLARED)
        .wxml,
    ).toBe("{'k': m.f(@@0@@)}");
  });
});

describe('wxs-expr: 不可下推必须报错', () => {
  it('wxs 返回值不能交给管道', () => {
    const msg = catchErr(() =>
      splitWxsExpression(inputAst(`<div [x]="m.f(a) | date"></div>`), DECLARED),
    );
    expect(msg).toContain('管道');
  });

  it('非 wxs 函数不能吞掉 wxs 结果', () => {
    const msg = catchErr(() =>
      splitWxsExpression(
        inputAst(`<div [x]="helper(m.f(a))"></div>`),
        DECLARED,
      ),
    );
    expect(msg).toContain('无法下推');
  });

  it('wxml 不支持的运算符报错（?? 是 Angular 支持但 wxml 不支持）', () => {
    const msg = catchErr(() =>
      splitWxsExpression(inputAst(`<div [x]="m.f(a) ?? 1"></div>`), DECLARED),
    );
    expect(msg).toContain('不支持运算符');
    expect(msg).toContain('??');
  });

  it('对象展开报错', () => {
    const msg = catchErr(() =>
      splitWxsExpression(inputAst(`<div [x]="{...m.data}"></div>`), DECLARED),
    );
    expect(msg).toContain('对象展开');
  });

  it('报错信息带节点类型与位置', () => {
    const msg = catchErr(() =>
      splitWxsExpression(
        inputAst(`<div [x]="helper(m.f(a))"></div>`),
        DECLARED,
      ),
    );
    expect(msg).toContain('Call');
    expect(msg).toContain('字符 ');
  });
});

describe('wxs-expr: 插值计划', () => {
  const render = (s: string) => `{{${s}}}`;

  it('单表达式 + 前后缀文本', () => {
    const plan = planWxsInterpolation(
      textAst(`<div>pre{{ m.f(a) }}post</div>`),
      render,
      DECLARED,
    );
    expect(plan.wxml).toBe('pre{{m.f(@@0@@)}}post');
    expect(plan.freeVars.length).toBe(1);
  });

  it('多表达式的枝叶编号跨表达式连续递增', () => {
    const plan = planWxsInterpolation(
      textAst(`<div>{{ m.f(a) }}-{{ b }}-{{ m.g(c) }}</div>`),
      render,
      DECLARED,
    );
    expect(plan.wxml).toBe('{{m.f(@@0@@)}}-{{@@1@@}}-{{m.g(@@2@@)}}');
    expect(plan.freeVars.length).toBe(3);
  });

  it('纯 wxs 成员引用不产生枝叶', () => {
    const plan = planWxsInterpolation(
      textAst(`<div>{{ test.msg }}</div>`.replace('test', 'test')),
      render,
      DECLARED,
    );
    expect(plan.wxml).toBe('{{test.msg}}');
    expect(plan.freeVars.length).toBe(0);
  });

  it('不含 wxs 的表达式也摊进数组，保证 bind 与 wxml 一一对应', () => {
    const plan = planWxsInterpolation(
      textAst(`<div>{{ plain }}{{ m.f(a) }}</div>`),
      render,
      DECLARED,
    );
    expect(plan.wxml).toBe('{{@@0@@}}{{m.f(@@1@@)}}');
    expect(plan.freeVars.length).toBe(2);
  });

  it('纯文本尾巴保留', () => {
    const plan = planWxsInterpolation(
      textAst(`<div>{{ m.f(a) }}!</div>`),
      render,
      DECLARED,
    );
    expect(plan.wxml).toBe('{{m.f(@@0@@)}}!');
  });
});
