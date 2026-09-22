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
