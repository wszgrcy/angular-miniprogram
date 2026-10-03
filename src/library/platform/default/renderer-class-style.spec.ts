/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, Directive } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { initMiniProgramTestEnv } from '../test-util/init-env';
import { AgentNode } from './agent-node';
import { LVIEW } from './lview-layout';
import { MiniProgramRenderer } from './mini-program.renderer';

/**
 * Renderer2 的 class / style 到底写进 AgentNode 的哪个口袋——**运行时实测**。
 *
 * ## 为什么要有这个文件
 *
 * `AgentNode` 一度把 class 存成两个来源（`classList` 与 `attribute.class`），
 * `classString()` 再拼起来。到底是「两个都真在用」还是「其中一个早就没人写」，
 * 光读 Angular 源码猜不出来：同一个 `[class]` 写法在不同版本里分别走
 * `setAttribute` / `addClass` / `classMap`，静态 class 又会被编译器拆进
 * styling 管道。所以这里真的建组件、真的跑变更检测，把 renderer 收到的
 * 每一次写入录下来。
 *
 * ## 实测结论（@angular/core 22.1.7）
 *
 * | 模板写法 | renderer 收到的调用 |
 * | --- | --- |
 * | `class="a b"`（无插值） | `setAttribute('class', 'a b')` |
 * | 指令 `host: { class: 'x' }` | `setAttribute('class', 'x')` |
 * | `[attr.class]="v"` | `setAttribute('class', v)` / `removeAttribute('class')` |
 * | `class="a {{x}}"`（有插值） | `addClass` / `removeClass` |
 * | `[class]="str"` | `addClass` / `removeClass` |
 * | `[class.x]="bool"` | `addClass` / `removeClass` |
 * | `style="a:b"`（静态） | `setAttribute('style', 'a: b;')`（Angular 会规范化） |
 * | `[style]` / `[style.x]` | `setStyle` / `removeStyle`（逐条） |
 *
 * 两个来源**都真的在用**，所以必须都留。模型就一句话：动态那半（`classList` /
 * `style`）逐个增删，属性那半（`attribute.class` / `attribute.style`）每次整体
 * 重设一个串，两边只在 `classString()` / `styleString()` 拼一次，存什么就显示
 * 什么。style 是属性在前、动态在后——CSS 里同一个声明块后写的赢，而 Angular
 * 正是先写静态 style 属性、后写动态绑定。
 *
 * 已知取舍：静态与动态声明了同一个名字时（`class="shared" [class.shared]="off"`），
 * 动态摘不掉静态那半，两边都声明时串里还会出现两次。DOM 里两者是同一份集合，
 * 既摘得掉也不会重复；要复刻就得额外记一份「谁被明确摘过」的状态，而那种模板
 * 本身自相矛盾。下面 `已知取舍` 用例把这个行为钉住。
 *
 * ## 测试环境的一个坑（写用例前必读）
 *
 * `fixture.detectChanges()` 刷的是**宿主视图**，组件视图只有在标脏之后才会
 * 被 `detectChangesInChildComponents` 带起来。直接改字段再 `detectChanges()`
 * 什么都不会发生（连文本插值都不更新），宿主上的 `markForCheck()` 也带不动
 * 组件视图。真实应用里事件监听会替我们标脏，测试里要拿**组件自己的**
 * `ChangeDetectorRef` 标，见 {@link markForCheck}。
 */

@Directive({
  selector: '[hostCls]',
  standalone: true,
  host: { class: 'from-host' },
})
class HostClsDirective {}

@Component({
  selector: 'probe-cmp',
  standalone: true,
  imports: [HostClsDirective],
  template: `
    <div id="static" class="a b">{{ on ? 'T' : 'F' }}</div>
    <div id="classBind" [class]="cls"></div>
    <div id="classProp" [class.c1]="on" [class.c2]="off"></div>
    <div id="interp" class="x {{ interp }}"></div>
    <div id="attrClass" [attr.class]="attrCls"></div>
    <div id="host" hostCls></div>
    <div id="staticStyle" style="color:red;padding:2px"></div>
    <div id="styleBind" [style]="'color:blue'"></div>
    <div id="styleProp" [style.color]="'green'" [style.font-size.px]="12"></div>
    <div id="styleImportant" [style.color]="'red !important'"></div>
    <div id="clashClass" class="shared" [class.shared]="off"></div>
    <div
      id="clashStyle"
      style="color:red"
      [style.color]="off ? null : 'blue'"
    ></div>
    <div id="camelStyle" [style]="camelObj"></div>
  `,
})
class ProbeComponent {
  on = true;
  off = false;
  cls = 'dyn1 dyn2';
  interp = 'i2';
  attrCls: string | null = 'attr-c';
  camelObj: Record<string, string> = { 'font-weight': 'bold', zIndex: '7' };
}

const WRITES = [
  'setAttribute',
  'removeAttribute',
  'addClass',
  'removeClass',
  'setStyle',
  'removeStyle',
] as const;

/** 一次 renderer 写入：方法名 + 目标节点 id + 参数 */
type Call = { fn: (typeof WRITES)[number]; id: string; args: unknown[] };

const raw: { fn: any; node: AgentNode; args: unknown[] }[] = [];

/** 整个文件只装一次：重复装会把同一个调用录好几遍 */
function instrument() {
  const proto = MiniProgramRenderer.prototype as any;
  for (const fn of WRITES) {
    const origin = proto[fn];
    proto[fn] = function (this: any, el: AgentNode, ...rest: unknown[]) {
      raw.push({ fn, node: el, args: rest });
      return origin.apply(this, [el, ...rest]);
    };
    proto[`__orig_${fn}`] = origin;
  }
}

function deinstrument() {
  const proto = MiniProgramRenderer.prototype as any;
  for (const fn of WRITES) {
    proto[fn] = proto[`__orig_${fn}`];
  }
}

/**
 * 标脏**组件自己的**视图。
 *
 * `fixture.detectChanges()` 只保证刷宿主视图；不标脏的话组件视图整个跳过，
 * 改了字段也像没生效。`componentRef.changeDetectorRef` 是宿主视图的 CDR，
 * 标它带不动组件视图，必须从组件 injector 里取。
 */
function markForCheck(fixture: any) {
  fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
}

function componentLView(fixture: any): any[] {
  const hostLView = fixture.componentRef.hostView._lView;
  const nested = hostLView[LVIEW.HEADER_OFFSET];
  return Array.isArray(nested) ? nested : hostLView;
}

/** 本模板里的元素节点，按 `id` 归拢（文本节点没有 id，忽略） */
function nodesById(lView: any[]): Map<string, AgentNode> {
  const map = new Map<string, AgentNode>();
  for (let i = LVIEW.HEADER_OFFSET; i < lView[1].bindingStartIndex; i++) {
    const node = lView[i];
    if (node instanceof AgentNode && node.attribute.id) {
      map.set(node.attribute.id, node);
    }
  }
  return map;
}

/**
 * 建组件 + 首轮变更检测；`calls()` 是本轮 renderer 收到的全部写入。
 */
function create() {
  raw.length = 0;
  const fixture = TestBed.createComponent(ProbeComponent);
  fixture.detectChanges();
  return {
    fixture,
    nodes: nodesById(componentLView(fixture)),
    calls: (): Call[] =>
      raw.map((c) => ({
        fn: c.fn,
        id: c.node.attribute.id || c.node.name || c.node.type,
        args: c.args,
      })),
  };
}

/** 调用参数都是字符串 / 数字，没传的（undefined / null）不进断言 */
function isPlain(a: unknown): a is string | number {
  return typeof a === 'string' || typeof a === 'number';
}

/**
 * 某个节点上的 class / style 写入，形如 `['addClass:dyn1', ...]`。
 *
 * `setAttribute` 只留 class / style 那两条（`id` 之类的噪音不进断言）；
 * 没传的 `namespace` / `flags` 参数一律抹掉。
 */
function writesOf(calls: Call[], id: string) {
  return calls
    .filter(
      (c) =>
        c.id === id &&
        !(
          (c.fn === 'setAttribute' || c.fn === 'removeAttribute') &&
          c.args[0] !== 'class' &&
          c.args[0] !== 'style'
        ),
    )
    .map((c) => `${c.fn}:${c.args.filter(isPlain).join(',')}`);
}

describe('Renderer2 的 class / style 写入（运行时实测）', () => {
  beforeAll(instrument);
  afterAll(deinstrument);

  beforeEach(() => {
    initMiniProgramTestEnv();
  });

  describe('写入来源', () => {
    it('静态 class / 指令 host class / [attr.class] 走 setAttribute', () => {
      const { nodes, calls } = create();
      const all = calls();
      expect(writesOf(all, 'static')).toEqual(['setAttribute:class,a b']);
      expect(writesOf(all, 'host')).toEqual(['setAttribute:class,from-host']);
      expect(writesOf(all, 'attrClass')).toEqual(['setAttribute:class,attr-c']);
      // attribute 里也留了一份原值
      expect(nodes.get('static')!.attribute.class).toBe('a b');
    });

    it('[class] / [class.x] / class 插值 走 addClass / removeClass', () => {
      const { calls } = create();
      const all = calls();
      expect(writesOf(all, 'classBind')).toEqual([
        'addClass:dyn1',
        'addClass:dyn2',
      ]);
      expect(writesOf(all, 'classProp')).toEqual([
        'addClass:c1',
        'removeClass:c2',
      ]);
      // `class="x {{interp}}"`：静态那半也进了 styling 管道，不走 setAttribute
      expect(writesOf(all, 'interp')).toEqual(['addClass:i2', 'addClass:x']);
    });

    it('每个节点都带 tag-name-* 标记，且它不属于任何属性', () => {
      const { nodes } = create();
      expect(nodes.get('static')!.classList.has('tag-name-div')).toBe(true);
    });
  });

  describe('两个来源合并成一份 class', () => {
    it('静态 class 与动态 class 同时存在 → 聚合串里都有且不重复', () => {
      const { nodes } = create();
      expect(nodes.get('static')!.classString()).toBe('tag-name-div a b');
      expect(nodes.get('interp')!.classString()).toBe('tag-name-div i2 x');
      expect(nodes.get('host')!.classString()).toBe('tag-name-div from-host');
    });

    it('已知取舍：静态与动态声明同名 class，各留各的', () => {
      const { nodes, fixture } = create();
      // off=false → removeClass('shared')，但 shared 是属性声明的，不归动态管
      expect(nodes.get('clashClass')!.classString()).toBe(
        'tag-name-div shared',
      );
      fixture.componentInstance.off = true;
      markForCheck(fixture);
      fixture.detectChanges();
      // 动态也加了 shared → 串里出现两次，class 匹配不受影响
      expect(nodes.get('clashClass')!.classString()).toBe(
        'tag-name-div shared shared',
      );
    });

    it('[attr.class] 置空只撤属性那部分，tag-name 标记保留', () => {
      const { nodes, fixture } = create();
      fixture.componentInstance.attrCls = null;
      markForCheck(fixture);
      fixture.detectChanges();
      expect(nodes.get('attrClass')!.classString()).toBe('tag-name-div');
    });

    it('class 属性每次整体重设，动态那半不受影响', () => {
      const node = new AgentNode('element');
      node.classList.add('dyn');
      node.attribute.class = 'a b';
      expect(node.classString()).toBe('dyn a b');
      node.attribute.class = 'c';
      expect(node.classString()).toBe('dyn c');
      delete node.attribute.class;
      expect(node.classString()).toBe('dyn');
    });
  });

  describe('style', () => {
    it('静态 style 走 setAttribute，原样显示（Angular 已规范化过）', () => {
      const { nodes } = create();
      // Angular 递来的是 'color: red; padding: 2px;'，只剔掉尾分号避免拼出 `;;`
      expect(nodes.get('staticStyle')!.styleString()).toBe(
        'color: red; padding: 2px',
      );
    });

    it('[style] / [style.x] 逐条走 setStyle', () => {
      const { nodes, calls } = create();
      const all = calls();
      expect(writesOf(all, 'styleBind')).toEqual(['setStyle:color,blue']);
      expect(writesOf(all, 'styleProp')).toEqual([
        'setStyle:color,green',
        // 2 === RendererStyleFlags2.DashCase，`[style.x.px]` 带过来的
        'setStyle:font-size,12px,2',
      ]);
      expect(nodes.get('styleProp')!.styleString()).toBe(
        'color:green;font-size:12px',
      );
    });

    it('动态 style 排在静态之后，按 CSS 规则覆盖它', () => {
      const { nodes } = create();
      expect(nodes.get('clashStyle')!.styleString()).toBe(
        'color: red;color:blue',
      );
    });

    it('已知取舍：动态 removeStyle 摘不掉静态声明的属性', () => {
      const { nodes, fixture } = create();
      fixture.componentInstance.off = true;
      markForCheck(fixture);
      fixture.detectChanges();
      // removeStyle('color') 只清动态那半，静态的 color: red 还在
      expect(nodes.get('clashStyle')!.styleString()).toBe('color: red');
    });

    it('[style] 映射里的 camelCase 键转成 CSS 写法', () => {
      const { nodes } = create();
      expect(nodes.get('camelStyle')!.styleString()).toBe(
        'font-weight:bold;z-index:7',
      );
    });

    it('CSS 自定义属性（-- 开头）不参与改写', () => {
      const node = new AgentNode('element');
      const renderer = new MiniProgramRenderer();
      renderer.setStyle(node, '--myColor', '2px');
      renderer.setStyle(node, 'zIndex', '7');
      expect(node.styleString()).toBe('--myColor:2px;z-index:7');
    });

    it('!important 由 flags 带回来，要拼回值里', () => {
      const { nodes, calls } = create();
      // Angular 把 `!important` 从值里切掉，改用 flags=1 传
      expect(writesOf(calls(), 'styleImportant')).toEqual([
        'setStyle:color,red ,1',
      ]);
      expect(nodes.get('styleImportant')!.styleString()).toBe(
        'color:red !important',
      );
    });

    it('style 属性每次整体重设，动态那半不受影响', () => {
      const node = new AgentNode('element');
      node.style['margin'] = '1px';
      node.attribute.style = 'color:red;padding:2px';
      expect(node.styleString()).toBe('color:red;padding:2px;margin:1px');
      node.attribute.style = 'color:blue';
      expect(node.styleString()).toBe('color:blue;margin:1px');
      delete node.attribute.style;
      expect(node.styleString()).toBe('margin:1px');
    });
  });

  describe('更新期', () => {
    it('class 变更只发聚合串，且旧 token 被摘掉', () => {
      const { nodes, fixture } = create();
      const inst = fixture.componentInstance;
      inst.cls = 'dyn3';
      inst.interp = 'i3';
      raw.length = 0;
      markForCheck(fixture);
      fixture.detectChanges();
      expect(nodes.get('classBind')!.classString()).toBe('tag-name-div dyn3');
      // Set 的顺序跟着写入顺序走（i2 被摘掉、i3 追加在 x 之后），
      // class 顺序不参与匹配，按集合比。
      expect(nodes.get('interp')!.classString().split(' ').sort()).toEqual([
        'i3',
        'tag-name-div',
        'x',
      ]);
    });
  });
});
