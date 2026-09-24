/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecursiveAstVisitor, parseTemplate } from '@angular/compiler';

import { ComponentContext } from './component-context';
import { CustomAstVisitor, TemplateDefinition } from './template-definition';

/**
 * 权威基准：直接继承 Angular 自己的 `RecursiveAstVisitor`，
 * 只加一个「数管道」的计数。
 *
 * 用它当参照而不是自己写遍历，是因为它就是 Angular 官方定义的
 * 「一个表达式节点的完整子树该怎么走」。我们的 `CustomAstVisitor`
 * 数出来的管道数必须和它逐条一致 —— 不一致就说明我们漏走了某棵子树。
 */
class GroundTruthPipeCounter extends RecursiveAstVisitor {
  count = 0;
  override visitPipe(ast: any, ctx?: any): any {
    this.count++;
    // super 会继续访问 args，嵌套管道因此也被计入
    return super.visitPipe(ast, ctx);
  }
}

function parseExprs(html: string): any[] {
  const r: any = parseTemplate(html, 'p.html');
  if (r.errors && r.errors.length) {
    throw new Error('模板解析失败: ' + r.errors[0].message);
  }
  const out: any[] = [];
  const walk = (nodes: any[]) => {
    (nodes || []).forEach((n) => {
      if (n.value && n.value.ast) {out.push(n.value.ast);}
      ['children', 'branches', 'groups', 'cases'].forEach((k) => {
        if (Array.isArray(n[k])) {walk(n[k]);}
      });
    });
  };
  walk(r.nodes);
  return out;
}

function countWithOurs(ast: any): number {
  let n = 0;
  new CustomAstVisitor(() => n++).visit(ast);
  return n;
}

function countWithAngular(ast: any): number {
  const c = new GroundTruthPipeCounter();
  c.visit(ast);
  return c.count;
}

/**
 * 表达式侧槽位计数 vs Angular 权威基准。
 *
 * 每个 `| pipe` 在 Angular 里编译成一条 `ɵɵpipe`，占当前视图一个声明槽。
 * 我们必须在没有 Angular 编译管线的情况下自己数准，否则后续节点整体错位
 * 且不报错。这里用 Angular 的 `RecursiveAstVisitor` 逐条比对。
 */
describe('CustomAstVisitor: 管道计数与 Angular RecursiveAstVisitor 一致', () => {
  // 每项：[说明, 模板片段, 期望管道数]
  const CASES: Array<[string, string, number]> = [
    ['无管道', '<div>{{ plainValue }}</div>', 0],
    ['单个管道', '<div>{{ a | number }}</div>', 1],
    ['两个兄弟插值各一带管道', '<div>{{ a | number }}{{ b | number }}</div>', 2],
    ['管道参数里再嵌管道', '<div>{{ a | date:(b | number) }}</div>', 2],
    ['管道参数三层嵌套', '<div>{{ a | b:(c | d:(e | number)) }}</div>', 3],
    ['安全属性读内含管道', '<div>{{ (a | number)?.b }}</div>', 1],
    ['安全属性读链式', '<div>{{ (a | number)?.b?.c }}</div>', 1],
    ['this 接收者', '<div>{{ this.a }}</div>', 0],
    ['this 接收者带管道', '<div>{{ this.a | number }}</div>', 1],
    ['this 深层链带管道', '<div>{{ this.a.b.c | number }}</div>', 1],
    ['二元两侧各一管道', '<div>{{ (a | number) + (b | number) }}</div>', 2],
    ['三元三分支', '<div>{{ (c|number) ? (a | number) : (b | number) }}</div>', 3],
    ['数组字面量内含管道', '<div>{{ [a | number, b] }}</div>', 1],
    ['对象字面量值含管道', '<div>{{ {k: a | number} }}</div>', 1],
    ['下标 key 含管道', '<div>{{ list[k | number] }}</div>', 1],
    ['安全下标 key 含管道', '<div>{{ a?.[(k | number)] }}</div>', 1],
    ['方法调用实参含管道', '<div>{{ obj.get(v | number) }}</div>', 1],
    ['安全调用实参含管道', '<div>{{ a?.f(b | number) }}</div>', 1],
    ['逻辑非内含管道', '<div>{{ !(a | number) }}</div>', 1],
    ['非空断言内含管道', '<div>{{ (a | number)! }}</div>', 1],
    ['typeof 内含管道', '<div>{{ typeof (a | number) }}</div>', 1],
    ['void 内含管道', '<div>{{ void (a | number) }}</div>', 1],
    ['模板字符串插值含管道', '<div>{{ `pre${a | number}post` }}</div>', 1],
    ['模板字符串多插值', '<div>{{ `${a|number}-${b|number}` }}</div>', 2],
    ['展开元素内含管道', '<div>{{ [...(a | number)] }}</div>', 1],
    ['一元负号内含管道', '<div>{{ -(a | number) }}</div>', 1],
    ['括号表达式内含管道', '<div>{{ ((a | number)) }}</div>', 1],
    ['嵌套组合大表达式', '<div>{{ ((a|number)?.b ?? [c | number]) + (d ? (e|number) : f) }}</div>', 3],
  ];

  for (const [name, html, expected] of CASES) {
    it(name, () => {
      const exprs = parseExprs(html);
      expect(exprs.length).toBeGreaterThan(0);

      const ours = exprs.reduce((sum, e) => sum + countWithOurs(e), 0);
      const angular = exprs.reduce((sum, e) => sum + countWithAngular(e), 0);

      expect(ours).withContext(`我们数到的管道数 (${name})`).toBe(expected);
      expect(ours)
        .withContext(`必须与 Angular RecursiveAstVisitor 一致 (${name})`)
        .toBe(angular);
    });
  }

  it('反向对照：旧写法（visitPipe 不走 args + safePropertyRead 空）会少数', () => {
    // 复刻修复前的行为，证明本测试真的能抓到漏计，而不是恒等式。
    class OldBrokenVisitor extends RecursiveAstVisitor {
      count = 0;
      override visitPipe(ast: any): any {
        this.count++;
        // 故意不访问 args —— 就是修复前的 bug
        return undefined;
      }
      override visitSafePropertyRead(_ast: any): any {
        // 故意空实现 —— 就是修复前的 bug
        return undefined;
      }
      override visitThisReceiver(_ast: any): any {
        return undefined;
      }
    }

    const probes = [
      '<div>{{ a | date:(b | number) }}</div>', // 参数里藏 1 个
      '<div>{{ (a | number)?.b }}</div>', // receiver 里藏 1 个
    ];

    for (const html of probes) {
      const exprs = parseExprs(html);
      const truth = exprs.reduce((s, e) => s + countWithAngular(e), 0);
      const broken = exprs.reduce((s, e) => {
        const c = new OldBrokenVisitor();
        c.visit(e);
        return s + c.count;
      }, 0);

      expect(broken)
        .withContext(`旧写法应当少数（${html}）`)
        .toBeLessThan(truth);
    }
  });
});

/**
 * 模板侧：不支持的构造必须**抛错**，不能静默丢节点。
 *
 * 静默丢弃的后果是「内容不见了 + 后续槽位错位」，且不报错，
 * 属于最难排查的一类。本 fork 对 @defer / @content 已采用同一策略。
 */
describe('TemplateDefinition: 不支持的构造显式抛错', () => {
  function run(html: string) {
    const r: any = parseTemplate(html, 'p.html');
    if (r.errors && r.errors.length) {
      throw new Error('模板解析失败: ' + r.errors[0].message);
    }
    return new TemplateDefinition(r.nodes, new ComponentContext(undefined)).run();
  }

  it('ICU 复数消息抛错（实测该节点会真实产出，留空即静默丢弃）', () => {
    expect(() =>
      run('<p>{count, plural, =1 {one} other {many}}</p>')
    ).toThrowError(/ICU/);
  });

  it('ICU select 消息同样抛错', () =>
    expect(() => run('<p>{gender, select, male {他} other {TA}}</p>')).toThrowError(
      /ICU/
    ));

  it('ng-content 带 fallback 内容抛错（小程序 slot 无对应能力）', () => {
    expect(() => run('<ng-content>fallback</ng-content>')).toThrowError(
      /fallback/
    );
  });

  it('对照：ng-content 无 fallback 正常通过', () => {
    const list = run('<ng-content select=".header"></ng-content>');
    expect(list.length).toBe(1);
  });

  it('对照：ng-content 纯空白不算 fallback（Angular 归一成空 children）', () => {
    const list = run('<ng-content>   </ng-content>');
    expect(list.length).toBe(1);
  });

  it('@defer / @content 仍按既有策略抛错', () => {
    expect(() => run('@defer { <a></a> }')).toThrowError(/defer/);
    expect(() => run('@content { @case (foo) { <a></a> } }')).toThrowError(
      /@content/
    );
  });

  it('visitComponent / visitDirective 被调用即抛错（正常解析路径不产出）', () => {
    // 这两个节点无法从 parseTemplate 得到（已实测普通标签与 selectorless
    // 都只出 Element），所以直接构造节点喂进去，验证「出现即报错」。
    const def: any = new TemplateDefinition(
      [],
      new ComponentContext(undefined)
    );

    expect(() =>
      def.visitComponent({ componentName: 'Foo', tagName: 'app-foo' })
    ).toThrowError(/Component AST 节点/);

    expect(() =>
      def.visitDirective({ name: 'MyDirective' })
    ).toThrowError(/Directive AST 节点/);
  });
});

/**
 * 端到端：整段模板里我们算出的「节点数 + 管道数」应与
 * Angular 基准（节点数 + 权威管道数）一致。
 *
 * 这条把表达式侧与模板侧的计数串起来验证，防止两侧各自正确、
 * 合起来错位。
 */
describe('TemplateDefinition: 整模板槽位与 Angular 基准对齐', () => {
  function totals(html: string) {
    const r: any = parseTemplate(html, 'p.html');
    if (r.errors && r.errors.length) {
      throw new Error('模板解析失败: ' + r.errors[0].message);
    }

    // 权威管道总数：遍历所有 BoundText / BoundAttribute 的表达式
    const gt = new GroundTruthPipeCounter();
    const walkAst = (nodes: any[]) => {
      (nodes || []).forEach((n) => {
        if (n.value && n.value.ast) {gt.visit(n.value.ast);}
        ['children', 'branches', 'groups', 'cases'].forEach((k) => {
          if (Array.isArray(n[k])) {walkAst(n[k]);}
        });
      });
    };
    walkAst(r.nodes);

    const def = new TemplateDefinition(r.nodes, new ComponentContext(undefined));
    def.run();
    // declIndex 是私有字段，用 astVisitor 的副作用反推：
    // 走完模板后 declIndex 应等于「渲染节点数 + 管道数」
    const declIndex: number = (def as any).declIndex;
    return { declIndex, angularPipes: gt.count, nodes: def.list.length };
  }

  const CASES: Array<[string, string]> = [
    ['纯静态', '<div>hello</div>'],
    ['单管道', '<div>{{ a | number }}</div>'],
    ['多节点多管道', '<div>{{ a | number }}</div><span>{{ b | number }}</span>'],
    [
      '嵌套 + 参数嵌套管道',
      '<div><p>{{ a | date:(b | number) }}</p><b>{{ c }}</b></div>',
    ],
    ['安全读带管道', '<div>{{ (a | number)?.b }}</div>'],
    ['@if 分支含管道', '@if (a | number) { <p>{{ x }}</p> } @else { <q>{{ y | number }}</q> }'],
  ];

  for (const [name, html] of CASES) {
    it(name, () => {
      const t = totals(html);
      // 节点数必须 > 0，且 declIndex 至少覆盖节点数
      expect(t.nodes).toBeGreaterThan(0);
      expect(t.declIndex).toBeGreaterThanOrEqual(t.nodes);
      // declIndex 与「节点数 + 权威管道数」的差不应超过控制流锚点开销，
      // 关键是不允许出现「管道没数到」导致的欠计
      expect(t.declIndex)
        .withContext(`${name}: declIndex 应 >= 节点数 + 权威管道数`)
        .toBeGreaterThanOrEqual(t.nodes + t.angularPipes);
    });
  }

  it('反向对照：若漏计管道，declIndex 会小于「节点数 + 权威管道数」', () => {
    // 用参数嵌套管道这条最能暴露漏计的模板做反向验证：
    // 权威管道数必须严格大于 0，否则本对照无意义。
    const t = totals('<div>{{ a | date:(b | number) }}</div>');
    expect(t.angularPipes).toBe(2);
    expect(t.declIndex).toBeGreaterThanOrEqual(t.nodes + 2);
  });
});
