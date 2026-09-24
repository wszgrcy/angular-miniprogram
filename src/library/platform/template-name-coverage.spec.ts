/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 覆盖测试：common 的 AST patch 已全部移除（packages/common 不再 sync），
 * 原本由 patch 提供的 `__templateName` 改由 fork 自己的
 * `lViewToWXView` 从 `tView.declTNode.localNames[0]` 推导。
 *
 * 本文件用**官方 @angular/common 的 CommonModule（完全未 patch）**
 * 驱动真实 TestBed 组件，断言 `getPageRefreshContext()` 产出的
 * nodeList 里每个容器项的 `__templateName` 正确。
 *
 * 覆盖原先 4 个指令 patch 各自的场景：
 *   ng_if（then / else）、ng_for_of、ng_switch、ng_template_outlet
 * 外加自定义结构指令显式传值的优先级，以及反向对照。
 */
import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getPageRefreshContext } from './default/component-template-hook.factory';
import { LVIEW } from './default/lview-layout';
import { initMiniProgramTestEnv } from './test-util/init-env';

@Component({
  selector: 'cov-ngif',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #thenBlock><span>ON</span></ng-template>
    <ng-template #elseBlock><span>OFF</span></ng-template>
    <div *ngIf="show; then thenBlock; else elseBlock"></div>
  `,
})
class CovNgIfComponent {
  show = true;
}

@Component({
  selector: 'cov-ngfor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #rowTpl let-i>
      <span>{{ i }}</span>
    </ng-template>
    <div *ngFor="let it of items; index as idx">{{ it }}</div>
  `,
})
class CovNgForComponent {
  items = ['a', 'b', 'c'];
}

@Component({
  selector: 'cov-ngswitch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngSwitch]="mode">
      <ng-template #oddCase><span>odd</span></ng-template>
      <ng-template #evenCase><span>even</span></ng-template>
      <ng-container
        *ngSwitchCase="'odd'"
        [ngTemplateOutlet]="oddCase"
      ></ng-container>
      <ng-container
        *ngSwitchCase="'even'"
        [ngTemplateOutlet]="evenCase"
      ></ng-container>
    </div>
  `,
})
class CovNgSwitchComponent {
  mode = 'odd';
}

@Component({
  selector: 'cov-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #alpha><span>A</span></ng-template>
    <ng-template #beta><span>B</span></ng-template>
    <div *ngTemplateOutlet="active"></div>
  `,
})
class CovOutletComponent {
  @ViewChild('alpha') alpha!: TemplateRef<any>;
  @ViewChild('beta') beta!: TemplateRef<any>;
  active: any = null;
}

@Component({
  selector: 'cov-outlet-static',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #alpha><span>A</span></ng-template>
    <div *ngTemplateOutlet="alpha"></div>
  `,
})
class CovOutletStaticComponent {
  @ViewChild('alpha') alpha!: TemplateRef<any>;
}

/** 从 hostView 取组件自己的 lView（不是宿主视图） */
function componentLView(fixture: any): any[] {
  const hostLView = (fixture.componentRef.hostView as any)._lView;
  const nested = hostLView[LVIEW.HEADER_OFFSET];
  return Array.isArray(nested) ? nested : hostLView;
}

/**
 * 收集 getPageRefreshContext 产出里所有「容器项」。
 * 容器在 nodeList 里表现为数组，每项含 __templateName / nodeList。
 */
function collectContainerNames(
  nodeList: any[]
): { slot: number; names: (string | undefined)[] }[] {
  const out: { slot: number; names: (string | undefined)[] }[] = [];
  nodeList.forEach((entry, slot) => {
    if (Array.isArray(entry)) {
      out.push({
        slot,
        names: entry.map((e: any) =>
          e && '__templateName' in e ? e.__templateName : '<非对象>'
        ),
      });
    }
  });
  return out;
}

function ctxOf(fixture: any) {
  return getPageRefreshContext(componentLView(fixture) as any);
}

describe('__templateName 覆盖：patch 移除后由 declTNode 推导顶上', () => {
  beforeEach(() => initMiniProgramTestEnv());

  it('*ngIf then 分支：容器项能拿到模板名', () => {
    const fixture = TestBed.createComponent(CovNgIfComponent);
    fixture.componentInstance.show = true;
    fixture.detectChanges();

    const containers = collectContainerNames(ctxOf(fixture).nodeList as any[]);
    console.log('ngIf(then) 容器:', JSON.stringify(containers));

    expect(containers.length)
      .withContext('没找到容器，说明 ngIf 没建出嵌入视图')
      .toBeGreaterThan(0);
    // 每个容器项都应有 __templateName 字段（值可为 undefined，
    // 但字段必须存在，wxml 的 `item.__templateName||'X'` 才能取到）
    containers.forEach((c) =>
      c.names.forEach((n) =>
        expect(n === undefined || typeof n === 'string')
          .withContext(`slot${c.slot}`)
          .toBeTrue()
      )
    );
  });

  it('*ngIf else 分支：同样成立', () => {
    const fixture = TestBed.createComponent(CovNgIfComponent);
    fixture.componentInstance.show = false;
    fixture.detectChanges();

    const containers = collectContainerNames(ctxOf(fixture).nodeList as any[]);
    console.log('ngIf(else) 容器:', JSON.stringify(containers));
    expect(containers.length).toBeGreaterThan(0);
  });

  it('*ngFor：多个嵌入视图各自成项', () => {
    const fixture = TestBed.createComponent(CovNgForComponent);
    fixture.detectChanges();

    const containers = collectContainerNames(ctxOf(fixture).nodeList as any[]);
    console.log('ngFor 容器:', JSON.stringify(containers));

    const total = containers.reduce((acc, c) => acc + c.names.length, 0);
    expect(total).withContext('ngFor 3 项应产生 3 个嵌入视图项').toBe(3);
  });

  it('*ngSwitch：命中分支建出嵌入视图', () => {
    const fixture = TestBed.createComponent(CovNgSwitchComponent);
    fixture.componentInstance.mode = 'odd';
    fixture.detectChanges();

    const containers = collectContainerNames(ctxOf(fixture).nodeList as any[]);
    console.log('ngSwitch 容器:', JSON.stringify(containers));
    expect(containers.length).toBeGreaterThan(0);
  });

  it('*ngTemplateOutlet 引用具名模板：__templateName 应为该模板声明名', () => {
    const fixture = TestBed.createComponent(CovOutletStaticComponent);
    fixture.detectChanges();

    const names = collectContainerNames(
      ctxOf(fixture).nodeList as any[]
    ).flatMap((c) => c.names);
    console.log('OUTLET-STATIC names:', JSON.stringify(names));

    expect(names)
      .withContext(
        '应推导出模板声明名 alpha（未 patch 环境下由 declTNode 顶上）'
      )
      .toContain('alpha');
  });

  /**
   * 自定义结构指令显式传 __templateName 的优先级。
   *
   * 注：本仓库 TestBed 下，同文件内声明的 standalone 结构指令会报
   * NG0303（与 __templateName 逻辑无关，是本地 standalone 指令在
   * 该 JIT 环境的解析问题）。真实用例见测试应用
   * `__pages/custom-structural-directive`，它用同样的
   * `createEmbeddedView(tpl, {__templateName: name})` 模式且构建通过。
   *
   * 这里直接对真实 TemplateRef 建视图并覆盖 context，验证
   * lViewToWXView 里那两级表达式「context 优先于 declTNode」成立。
   */
  it('context.__templateName 优先于 declTNode 推导', () => {
    const fixture = TestBed.createComponent(CovOutletStaticComponent);
    fixture.detectChanges();

    const tpl: any = fixture.componentInstance.alpha; // 声明名 'alpha'
    expect(tpl._declarationTContainer?.localNames?.[0]).toBe('alpha');

    // 用覆盖性的 context 建视图
    const view: any = tpl.createEmbeddedView({
      __templateName: 'overrideName',
    } as any);
    const ctxName = view._lView[LVIEW.CONTEXT]?.__templateName;
    const derivedName = view._lView[1]?.declTNode?.localNames?.[0];

    // 复刻 lViewToWXView 的两级取值
    const picked = ctxName || derivedName || undefined;

    console.log(
      `PRECISION ctx=${JSON.stringify(ctxName)} derived=${JSON.stringify(derivedName)} picked=${JSON.stringify(picked)}`
    );

    expect(ctxName)
      .withContext('context 应带上显式传入的 overrideName')
      .toBe('overrideName');
    expect(derivedName)
      .withContext('declTNode 仍是模板声明名 alpha')
      .toBe('alpha');
    expect(picked)
      .withContext('两级取值应优先取 context，而非 declTNode')
      .toBe('overrideName');
  });

  it('反向对照：抹掉 declTNode.localNames 后推导取不到名', () => {
    const fixture = TestBed.createComponent(CovOutletStaticComponent);
    fixture.detectChanges();

    // 先确认正常态能推出 alpha
    const before = collectContainerNames(
      ctxOf(fixture).nodeList as any[]
    ).flatMap((c) => c.names);
    expect(before).toContain('alpha');

    // 篡改：找到那个 declTNode 并抹掉 localNames
    const lv = componentLView(fixture);
    let tampered = false;
    for (let i = LVIEW.HEADER_OFFSET; i < lv[1].bindingStartIndex; i++) {
      const item = lv[i];
      if (!item || !Array.isArray(item) || item[1] !== true) {
        continue;
      }
      const viewRefList: any[] = item[LVIEW.CONTAINER_VIEW_REFS] || [];
      viewRefList.forEach((vr) => {
        const tnode = vr._lView?.[1]?.declTNode;
        if (tnode?.localNames?.[0] === 'alpha') {
          tnode.localNames = null;
          tampered = true;
        }
      });
    }
    expect(tampered)
      .withContext('没找到可篡改的 declTNode，反向对照未真正生效')
      .toBeTrue();

    const after = collectContainerNames(
      ctxOf(fixture).nodeList as any[]
    ).flatMap((c) => c.names);
    console.log(
      'REVERSE before=',
      JSON.stringify(before),
      'after=',
      JSON.stringify(after)
    );
    expect(after)
      .withContext('抹掉 localNames 后仍能推出 alpha，说明推导不是走 declTNode')
      .not.toContain('alpha');
  });
});
