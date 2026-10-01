/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseTemplate } from '@angular/compiler';
import { withDeclarations } from './test-declare-util';
import { getWxsPlan, rewriteWxsTemplates } from './wxs-rewrite';
import { isWxsCarrier } from './wxs-expr';

/** 自动补 `<wxs module src>` 声明，断言集中在改写本身；声明机制见 wxs-declare.spec.ts */

function parse(html: string): any {
  const r: any = parseTemplate(withDeclarations(html), 'p.html');
  if (r.errors?.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  return r.nodes;
}

function findInput(nodes: any, name: string): any {
  let found: any;
  const walk = (ns: any[]) =>
    (ns || []).forEach((n: any) => {
      (n.inputs || []).forEach((i: any) => {
        if (i.name === name && !found) {
          found = i;
        }
      });
      walk(n.children || []);
    });
  walk(nodes);
  return found;
}

function findCarrierInput(nodes: any): any {
  let found: any;
  const walk = (ns: any[]) =>
    (ns || []).forEach((n: any) => {
      (n.inputs || []).forEach((i: any) => {
        if (!found && isWxsCarrier(i.name)) {
          found = i;
        }
      });
      walk(n.children || []);
    });
  walk(nodes);
  return found;
}

function findBoundText(nodes: any): any {
  let found: any;
  const walk = (ns: any[]) =>
    (ns || []).forEach((n: any) => {
      if (!found && n.value?.ast) {
        found = n;
      }
      walk(n.children || []);
    });
  walk(nodes);
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

describe('wxs-rewrite: 属性绑定改写', () => {
  it('表达式被换成 LiteralArray(枝叶)', async () => {
    const nodes = parse(`<div [foo]="util.add(a) + b"></div>`);
    await rewriteWxsTemplates(nodes);

    const input = findInput(nodes, 'foo');
    expect(input.value.ast.constructor.name).toBe('LiteralArray');
    expect(input.value.ast.expressions.length).toBe(2);
  });

  it('计划可按载体反查，wxml 串保留脊柱', async () => {
    const nodes = parse(`<div [foo]="util.add(a) + b"></div>`);
    await rewriteWxsTemplates(nodes);

    const plan = getWxsPlan(findInput(nodes, 'foo').value);
    expect(plan?.wxml).toBe('( util.add(@@0@@) + @@1@@ )');
    expect(plan?.freeVars.length).toBe(2);
    expect(plan?.modules).toEqual(['util']);
  });

  it('原表达式已从树上摘掉，Angular 只会编译数组', async () => {
    const nodes = parse(`<div [foo]="util.add(a)"></div>`);
    await rewriteWxsTemplates(nodes);
    const ast = findInput(nodes, 'foo').value.ast;
    expect(ast.constructor.name).toBe('LiteralArray');
    // 数组的元素才是原来的 a，树里不再有 Call / wxs 属性链
    expect(JSON.stringify(ast).includes('"Call"')).toBe(false);
  });

  it('零枝叶也换成空数组，避免 Angular 去求值 wxs', async () => {
    const nodes = parse(`<div [foo]="test.msg"></div>`);
    await rewriteWxsTemplates(nodes);
    const ast = findInput(nodes, 'foo').value.ast;
    expect(ast.constructor.name).toBe('LiteralArray');
    expect(ast.expressions.length).toBe(0);
    expect(getWxsPlan(findInput(nodes, 'foo').value)?.wxml).toBe('test.msg');
  });

  it('不含 wxs 的绑定完全不碰', async () => {
    const nodes = parse(`<div [foo]="a + 1"></div>`);
    const before = findInput(nodes, 'foo').value.ast;
    const result = await rewriteWxsTemplates(nodes);
    expect(findInput(nodes, 'foo').value.ast).toBe(before);
    expect(result.modules).toEqual([]);
  });

  it('多个绑定各自独立改写', async () => {
    const nodes = parse(
      `<div [a]="m.f(x)" [b]="plain" [c]="m.g(y) + 1"></div>`,
    );
    await rewriteWxsTemplates(nodes);
    expect(findInput(nodes, 'a').value.ast.constructor.name).toBe(
      'LiteralArray',
    );
    expect(findInput(nodes, 'b').value.ast.constructor.name).not.toBe(
      'LiteralArray',
    );
    expect(findInput(nodes, 'c').value.ast.constructor.name).toBe(
      'LiteralArray',
    );
    expect(getWxsPlan(findInput(nodes, 'c').value)?.wxml).toBe(
      '( m.g(@@0@@) + 1 )',
    );
  });
});

describe('wxs-rewrite: 插值改写', () => {
  it('插值换成枝叶数组，wxml 含完整文本与 {{}} 块', async () => {
    const nodes = parse(`<div>pre{{ m.f(a) }}post</div>`);
    await rewriteWxsTemplates(nodes);

    const text = findBoundText(nodes);
    expect(text.value.ast.constructor.name).toBe('LiteralArray');
    expect(getWxsPlan(text.value)?.wxml).toBe('pre{{m.f(@@0@@)}}post');
  });

  it('多表达式插值摊平成一条数组', async () => {
    const nodes = parse(`<div>{{ m.f(a) }}-{{ b }}</div>`);
    await rewriteWxsTemplates(nodes);
    const plan = getWxsPlan(findBoundText(nodes).value);
    expect(plan?.freeVars.length).toBe(2);
    expect(plan?.wxml).toBe('{{m.f(@@0@@)}}-{{@@1@@}}');
  });

  it('纯文本插值不受影响', async () => {
    const nodes = parse(`<div>hello</div>`);
    await rewriteWxsTemplates(nodes);
    const text = findBoundText(nodes);
    expect(text).toBeUndefined();
  });
});

describe('wxs-rewrite: 递归覆盖', () => {
  it('深层嵌套子节点里的 wxs 也被改写', async () => {
    const nodes = parse(
      `<div><section><span [x]="m.f(a)"></span></section></div>`,
    );
    await rewriteWxsTemplates(nodes);
    expect(findInput(nodes, 'x').value.ast.constructor.name).toBe(
      'LiteralArray',
    );
  });

  it('ng-template 内容里的 wxs 被改写', async () => {
    const nodes = parse(
      `<ng-template><span [x]="m.f(a)"></span></ng-template>`,
    );
    await rewriteWxsTemplates(nodes);
    expect(findInput(nodes, 'x').value.ast.constructor.name).toBe(
      'LiteralArray',
    );
  });
});

describe('wxs-rewrite: 模块收集', () => {
  it('跨多个绑定去重收集模块名', async () => {
    const nodes = parse(
      `<div [a]="util.f(x)" [b]="util.g(y)" [c]="other.h(z)"></div>`,
    );
    const result = await rewriteWxsTemplates(nodes);
    expect(result.modules.sort()).toEqual(['other', 'util']);
  });
});

describe('wxs-rewrite: class / style', () => {
  it('整体 [class] 改写成承载属性（不走 setProperty，原名留不住）', async () => {
    const nodes = parse(`<div [class]="u.cls('a', b)"></div>`);
    await rewriteWxsTemplates(nodes);
    // [class] 走 ɵɵclassMap、不经 setProperty，带不动数组，所以整条改名成
    // 合成普通属性；原名在 AST 里已经不存在
    expect(findInput(nodes, 'class')).toBeUndefined();
    const input = findCarrierInput(nodes);
    expect(isWxsCarrier(input.name)).toBe(true);
    expect(input.value.ast.constructor.name).toBe('LiteralArray');
    expect(getWxsPlan(input.value)?.wxml).toBe("u.cls('a', @@0@@)");
  });

  it('整体 [style] 同样改写成承载属性', async () => {
    const nodes = parse(`<div [style]="u.fs(x)"></div>`);
    await rewriteWxsTemplates(nodes);
    expect(findInput(nodes, 'style')).toBeUndefined();
    const input = findCarrierInput(nodes);
    expect(isWxsCarrier(input.name)).toBe(true);
    expect(input.value.ast.constructor.name).toBe('LiteralArray');
    expect(getWxsPlan(input.value)?.wxml).toBe('u.fs(@@0@@)');
  });

  it('逐目标 [class.x]（type=2）明确拒绝而非静默失效', async () => {
    const nodes = parse(`<div [class.x]="m.f(a)"></div>`);
    const msg = await rewriteWxsTemplates(nodes).then(
      () => '',
      (e: any) => String(e?.message ?? e),
    );
    expect(msg).toContain('不支持逐目标绑定');
    expect(msg).toContain('class.x');
  });

  it('逐目标 [style.color]（type=3）明确拒绝', async () => {
    const nodes = parse(`<div [style.color]="m.f(a)"></div>`);
    const msg = await rewriteWxsTemplates(nodes).then(
      () => '',
      (e: any) => String(e?.message ?? e),
    );
    expect(msg).toContain('不支持逐目标绑定');
    expect(msg).toContain('style.color');
  });

  it('拒绝信息指向可用的整体写法', async () => {
    const nodes = parse(`<div [class.x]="m.f(a)"></div>`);
    const msg = await rewriteWxsTemplates(nodes).then(
      () => '',
      (e: any) => String(e?.message ?? e),
    );
    expect(msg).toContain('整体绑定');
  });
});

describe('wxs-rewrite: 拆分错误向上传播', () => {
  it('不可下推的表达式在改写阶段就炸', async () => {
    const nodes = parse(`<div [x]="helper(m.f(a))"></div>`);
    const msg = await rewriteWxsTemplates(nodes).then(
      () => '',
      (e: any) => String(e?.message ?? e),
    );
    expect(msg).toContain('无法下推');
  });
});
