import { analyzeFileInjection } from '../../../test/util/template-inject-ast';
import { changeComponent } from './change-component';

const UPDATE_CALL = 'amp.propertyChange(ampNgCore.ɵɵgetCurrentView());';

/** 只保留 template 函数体，方便断言插入位置 */
function templateBody(content: string): string {
  const start = content.indexOf('template: function');
  const end = content.indexOf('\n  });', start);
  return content.slice(start, end);
}

describe('component-template-inject: changeComponent', () => {
  it('非组件（没有 ɵɵdefineComponent）时原样返回 undefined', () => {
    const src = `export class NotAComponent { foo = 1; }`;
    expect(changeComponent(src)).toBeUndefined();
  });

  it('注入两条 import', () => {
    const r = changeComponent(WITH_UPDATE_BLOCK);
    expect(r).toBeTruthy();
    expect(r!.content).toContain(`import * as amp from 'angular-miniprogram';`);
    expect(r!.content).toContain(`import * as ampNgCore from '@angular/core';`);
  });

  it('componentName 取 ɵcmp 的 type', () => {
    const r = changeComponent(WITH_UPDATE_BLOCK);
    expect(r!.componentName).toBe('Bar');
  });

  it('componentNames 列出本文件全部组件，componentName 等于第一个', () => {
    const single = changeComponent(WITH_UPDATE_BLOCK);
    expect(single!.componentNames).toEqual(['Bar']);
    expect(single!.componentName).toBe(single!.componentNames[0]);

    const multi = changeComponent(MULTI_WITH_TEMPLATE_FIELD);
    expect(multi!.componentNames).toEqual([
      'OutsideTemplateComponent',
      'PlainComponent',
    ]);
    expect(multi!.componentName).toBe('OutsideTemplateComponent');
  });

  describe('已有 if (rf & 2) 更新块', () => {
    it('把 propertyChange 插到更新块最后一条语句之后', () => {
      const r = changeComponent(WITH_UPDATE_BLOCK);
      const body = templateBody(r!.content);
      // 更新块内最后一条语句之后就是 propertyChange
      const lastPropertyIdx = body.lastIndexOf(`i0.ɵɵproperty("b", ctx.b);`);
      const updateCallIdx = body.indexOf(UPDATE_CALL);
      expect(updateCallIdx).toBeGreaterThan(lastPropertyIdx);
      // 且仍在 `if (rf & 2) {` 之后
      expect(updateCallIdx).toBeGreaterThan(body.indexOf('if (rf & 2) {'));
    });

    it('不会新增多余的 if (rf & 2) 块', () => {
      const r = changeComponent(WITH_UPDATE_BLOCK);
      const count = (r!.content.match(/rf & 2/g) || []).length;
      expect(count).toBe(1);
    });

    it('init 块（rf & 1）内部不被污染', () => {
      const r = changeComponent(WITH_UPDATE_BLOCK);
      const body = templateBody(r!.content);
      const initStart = body.indexOf('if (rf & 1) {');
      const initEnd = body.indexOf('if (rf & 2) {');
      expect(body.slice(initStart, initEnd).includes('propertyChange')).toBe(
        false
      );
    });
  });

  describe('没有 if (rf & 2) 更新块', () => {
    it('在 init 块后面补一个完整的 if (rf & 2) 块', () => {
      const r = changeComponent(WITHOUT_UPDATE_BLOCK);
      const body = templateBody(r!.content);
      expect(body).toContain(`if(rf & 2){${UPDATE_CALL}}`);
      // 补在 init 块之后
      expect(body.indexOf('if (rf & 1) {')).toBeLessThan(
        body.indexOf('if(rf & 2)')
      );
    });

    it('只补一个更新块', () => {
      const r = changeComponent(WITHOUT_UPDATE_BLOCK);
      const count = (r!.content.match(/rf & 2/g) || []).length;
      expect(count).toBe(1);
    });
  });

  describe('if (rf & 2) 是空块', () => {
    it('不能崩，退化成补一个完整更新块', () => {
      // 空块时 statements 为 []，取 statements[length - 1] 得到 undefined，
      // 老逻辑会在 insertNode 里读 getStart 直接抛
      // "Cannot read properties of undefined (reading 'getStart')"
      const r = changeComponent(EMPTY_UPDATE_BLOCK);
      expect(r).toBeTruthy();
      const body = templateBody(r!.content);
      expect(body).toContain(`if(rf & 2){${UPDATE_CALL}}`);
    });
  });

  describe('回归：多组件文件 + 类上有 template 字段', () => {
    /**
     * OutsideTemplateComponent 就是这个形状：类自己有个 `template` 字段，
     * 同时 ɵɵdefineComponent 里也有 `template: function`。
     *
     * 旧实现用 createCssSelectorForTs 的相邻兄弟组合符定位元数据对象，
     * 同文件多组件时兄弟关系错位，`PropertyAssignment[name=template]::initializer`
     * 会解析到一个 StringLiteral，initIfNode 拿不到，整个组件被 `continue`
     * 静默跳过——函数照常返回结果，但一条 propertyChange 都没插进去。
     * 线上表现是该组件的属性变更不会同步到小程序侧。
     */
    it('两个组件都必须被注入', () => {
      const r = changeComponent(MULTI_WITH_TEMPLATE_FIELD);
      expect(r).toBeTruthy();
      const report = analyzeFileInjection('multi.js', r!.content);
      const names = report.components.map((c) => c.componentName);
      expect(names).toContain('OutsideTemplateComponent');
      expect(names).toContain('PlainComponent');
      for (const c of report.components) {
        expect(c.hasInitBlock).toBe(true);
        expect(c.branch).not.toBeNull();
        expect(c.propertyChangeCount).toBe(1);
        expect(c.isLastStatement).toBe(true);
      }
      expect(report.strayCalls).toBe(0);
    });

    it('不能因为漏注入而“假装成功”返回', () => {
      const r = changeComponent(MULTI_WITH_TEMPLATE_FIELD);
      const injected = (r!.content.match(/[\w$.]*\.propertyChange\(/g) || [])
        .length;
      // 两个组件 = 2 次调用，少于 2 就是漏了
      expect(injected).toBe(2);
    });
  });

  describe('AST 层面复核单元用例的分支判定', () => {
    it('分支 A / 分支 B 能被 AST 正确区分', () => {
      const a = analyzeFileInjection(
        'a.js',
        changeComponent(WITH_UPDATE_BLOCK)!.content
      );
      const b = analyzeFileInjection(
        'b.js',
        changeComponent(WITHOUT_UPDATE_BLOCK)!.content
      );
      expect(a.components[0].branch).toBe('A');
      expect(b.components[0].branch).toBe('B');
      expect(a.components[0].updateStatementCount).toBeGreaterThan(1);
      expect(b.components[0].updateStatementCount).toBe(1);
    });

    it('空模板（无 rf & 1）不注入，但仍按契约返回结果', () => {
      // 不能返回 undefined：SetupComponentDataService 靠返回值决定组件是否产出，
      // 空模板组件也得正常产出，只是没有注入点而已
      const r = changeComponent(EMPTY_TEMPLATE);
      expect(r).toBeTruthy();
      expect(r!.componentName).toBe('EmptyTpl');
      expect(r!.content).not.toContain('propertyChange(');
      expect(r!.content).not.toContain('import * as amp');
    });
  });

  it('同文件多组件：每个组件都被改到，componentName 取第一个', () => {
    const r = changeComponent(TWO_COMPONENTS);
    expect(r!.componentName).toBe('Comp1');
    const body = templateBody(r!.content);
    // Comp1 走「有更新块」分支，Comp2 走「无更新块」分支，
    // 两个组件的 template 里都应出现 propertyChange
    const occurrences = (r!.content.match(/amp\.propertyChange/g) || []).length;
    // import 行本身不含 propertyChange，所以 2 次 = 两个组件各被插了一次
    expect(occurrences).toBe(2);
    expect(body).toContain('Comp1_Template');
  });
});

const WITH_UPDATE_BLOCK = `
export class Bar {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: Bar,
    selectors: [["bar"]],
    template: function Bar_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "view");
        i0.ɵɵproperty("a", ctx.a);
      }
      if (rf & 2) {
        i0.ɵɵproperty("a", ctx.a);
        i0.ɵɵproperty("b", ctx.b);
      }
    },
  });
}
`;

const WITHOUT_UPDATE_BLOCK = `
export class Foo {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: Foo,
    selectors: [["foo"]],
    template: function Foo_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "view");
      }
    },
  });
}
`;

const EMPTY_UPDATE_BLOCK = `
export class Baz {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: Baz,
    selectors: [["baz"]],
    template: function Baz_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "view");
      }
      if (rf & 2) {
      }
    },
  });
}
`;

const EMPTY_TEMPLATE = `
export class EmptyTpl {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: EmptyTpl,
    selectors: [["empty-tpl"]],
    template: function EmptyTpl_Template(rf, ctx) {},
  });
}
`;

const MULTI_WITH_TEMPLATE_FIELD = `
export class OutsideTemplateComponent {
  template;
  constructor() { }
  static ɵcmp = i0.ɵɵdefineComponent({
    type: OutsideTemplateComponent,
    selectors: [["app-outside-template"]],
    inputs: { template: "template" },
    decls: 3,
    vars: 1,
    template: function OutsideTemplateComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1, "下面将传入一个由外部提供的模板");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.template);
      }
    },
  });
}

export class PlainComponent {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: PlainComponent,
    selectors: [["app-plain"]],
    decls: 1,
    vars: 0,
    template: function PlainComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "view");
      }
    },
  });
}
`;

const TWO_COMPONENTS = `
export class Comp1 {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: Comp1,
    selectors: [["comp-1"]],
    template: function Comp1_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "view");
      }
      if (rf & 2) {
        i0.ɵɵproperty("a", ctx.a);
      }
    },
  });
}

export class Comp2 {
  static ɵcmp = i0.ɵɵdefineComponent({
    type: Comp2,
    selectors: [["comp-2"]],
    template: function Comp2_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "text");
      }
    },
  });
}
`;
