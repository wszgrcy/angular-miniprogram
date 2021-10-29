import { Injector } from 'static-injector';
import * as vm from 'vm';
import { BuildPlatform } from '../platform/platform';
import { WxPlatformInfo } from '../platform/wx-platform-info';
import { WxTransform } from '../template-transform-strategy/wx.transform';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
} from '../token/component.token';
import { TemplateCompiler } from './template-compiler';
import { TemplateInterpolationService } from './template-interpolation.service';

const computeExpressionMock = `function computeExpression(a){
  return a
}`;
const getPipeMock = `function getPipe(a,b){return b}`;
function runLogic(str: string, context: Record<string, any>) {
  return vm.runInNewContext(
    `${computeExpressionMock}${getPipeMock}${str};let wx={__window:{__computeExpression:computeExpression,__getPipe:getPipe}};;ctx=wxContainerMain(ctx);`,
    {
      ctx: context,
    }
  );
}
describe('template-compiler', () => {
  function defaultTransform(content: string) {
    const injector = Injector.create({
      providers: [
        { provide: WxTransform },
        { provide: TemplateCompiler },
        { provide: WxPlatformInfo },
        {
          provide: BuildPlatform,
          useClass: WxPlatformInfo,
        },
        { provide: COMPONENT_FILE_NAME_TOKEN, useValue: '' },
        { provide: COMPONENT_TEMPLATE_CONTENT_TOKEN, useValue: content },
        { provide: TemplateInterpolationService },
      ],
    });
    const instance = injector.get(TemplateCompiler);
    return instance.transform();
  }
  // todo 标签
  it('一些标签->view', () => {
    ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
      const result = defaultTransform(`<${tag}></${tag}>`);
      expect(result.content).toContain(`<view`);
      expect(result.content).toContain(`</view>`);
      expect(result.content).toContain(`origin-tag-${tag}`);
    });
  });
  it('单闭合标签', () => {
    const result = defaultTransform(`<input>`);
    expect(result.content).toContain(`input`);
    expect(result.content).not.toContain(`</input>`);
  });
  it('ngIf->wx:if', () => {
    let result = defaultTransform(`<div *ngIf="a"></div>`);
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.content).not.toContain(`wx:else`);
    let execResult = runLogic(result.logic, { originVar: { a: 1 } });
    expect(execResult.varList[0]).toBe(1);
    result = defaultTransform(
      `<div *ngIf="a;else elseBlock"></div><ng-template #elseBlock></ng-template>`
    );
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).toContain(`is="elseBlock"`);
    expect(result.template).toContain('name="elseBlock"');
    execResult = runLogic(result.logic, { originVar: { a: 1 } });
    expect(execResult.varList[0]).toBe(1);

    result = defaultTransform(
      `<div *ngIf="a;then thenBlock else elseBlock"></div><ng-template #elseBlock></ng-template><ng-template #thenBlock></ng-template>`
    );
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.content).toContain(`is="thenBlock"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).toContain(`is="elseBlock"`);
    expect(result.template).toContain('name="elseBlock"');
    expect(result.template).toContain('name="thenBlock"');
    execResult = runLogic(result.logic, { originVar: { a: 1 } });
    expect(execResult.varList[0]).toBe(1);
  });
  it('ng-template->template', () => {
    const result = defaultTransform(
      `<ng-template #templateRef>content1</ng-template>`
    );
    expect(result.template).toContain('name="templateRef"');
  });
  it('interpolation(插值)', () => {
    let execResult;
    let result = defaultTransform(`{{a}}`);
    expect(result.content).toContain('{{varList[0]}}');
    result = defaultTransform(`{{a.b}}`);
    expect(result.content).toContain('{{varList[0]}}');
    result = defaultTransform(`{{a[0]}}`);
    expect(result.content).toContain('{{varList[0]}}');
    result = defaultTransform(`{{a['aa']}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    result = defaultTransform(`{{[a,'a']}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    result = defaultTransform(`{{a?true:false}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    result = defaultTransform(`{{a+b}}+{{c}}+d`);
    expect(result.content).toContain(
      `{{varList[0]}}{{varList[1]}}{{varList[2]}}{{varList[3]}}`
    );
    execResult = runLogic(result.logic, { originVar: { a: 1, b: 2, c: 3 } });
    expect(execResult.varList[0]).toBe(3);
    expect(execResult.varList[1]).toBe('+');
    expect(execResult.varList[2]).toBe(3);
    expect(execResult.varList[3]).toBe('+d');
    result = defaultTransform(`{{a[b]}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    execResult = runLogic(result.logic, { originVar: { a: [1], b: 0 } });
    expect(execResult.varList[0]).toBe(1);
  });
  it('插值常量绑定', () => {
    let execResult;
    let result = defaultTransform(`{{'测试'}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    execResult = runLogic(result.logic, { originVar: {} });
    expect(execResult.varList[0]).toBe('测试');
    result = defaultTransform(`{{a['prob1']}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    execResult = runLogic(result.logic, { originVar: { a: { prob1: 1 } } });
    expect(execResult.varList[0]).toBe(1);
  });
  it('ng-content', () => {
    let result = defaultTransform(`<ng-content></ng-content>`);
    expect(result.content).toContain('<slot></slot>');
    result = defaultTransform(`<ng-content name="abc"></ng-content>`);
    expect(result.content).toContain('<slot name="abc"></slot>');
  });
  it('ng-template数据绑定', () => {
    let result = defaultTransform(`<div *ngIf="true">{{a}}</div>`);
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.template).toContain(`{{varList[0]}}`);

    result = defaultTransform(
      `<div *ngIf="true">{{a}}<span>{{b}}</span></div>`
    );
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.template).toContain(`{{varList[0]}}`);
    expect(result.template).toContain(`{{varList[1]}}`);
    result = defaultTransform(
      `<div *ngIf="true">{{a}}<div *ngIf="true">{{b}}</div></div>`
    );
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.template).toContain(`{{varList[0]}}`);
    expect(result.template).toContain(`wx:if="{{varList[1]}}"`);
  });
  it('ngFor=>wx:for', () => {
    let result = defaultTransform(`<div *ngFor="let item of list">
    {{item}}
</div>`);

    expect(result.content).toContain(`wx:for="{{varList[0]}}"`);
    expect(result.content).toContain(`wx:for-item="item"`);
    expect(result.content).toContain(`data="{{...directive[0][index] }}"`);
    result = defaultTransform(`<div *ngFor="let item of list;let i=index">
    {{item}}
</div>`);
    expect(result.content).toContain(`wx:for-index="i"`);
  });
  it('ngSwitch=>wx:if', () => {
    const result = defaultTransform(`<span [ngSwitch]="title">
    <p *ngSwitchCase="abc">1</p>
    <p *ngSwitchCase="false"></p>
    <p *ngSwitchDefault>2</p>
  </span>`);
    expect(result.content).toContain(`wx:if="{{varList[0]===varList[1]}}"`);
    expect(result.content).toContain(`wx:elif="{{varList[2]===varList[3]}}"`);
    expect(result.content).toContain(`wx:else`);
  });
  it('event', () => {
    const result = defaultTransform(`<div (bind:tap)="test($event);"></div>`);
    expect(result.content).toContain('bind:tap');
    expect(result.content).toContain('test');
    expect(result.content).not.toContain('$event');
  });
  it('内容', () => {
    const result = defaultTransform(`测试`);
    expect(result.content).toContain('测试');
  });
  it('pipe', () => {
    let result = defaultTransform(`{{123456|pipe1:1:2:title}}`);
    expect(result.logic).toContain(`__getPipe('pipe1',0`);
    result = defaultTransform(`{{(123456|pipe1:1:2:title)|pipe2}}`);
    expect(result.logic).toContain(
      `getPipe('pipe2',0,wx.__window.__getPipe('pipe1',1`
    );
    result = defaultTransform(
      `{{(123456|pipe1:1:2:title)|pipe2}}<div>{{(123456|pipe1:1:2:title)|pipe2}}</div>`
    );
    expect(result.logic).toContain(
      `getPipe('pipe2',0,wx.__window.__getPipe('pipe1',1`
    );
    expect(result.logic).toContain(
      `getPipe('pipe2',2,wx.__window.__getPipe('pipe1',3`
    );
  });
  it('索引变量', () => {
    const result = defaultTransform(`<div>
    {{ a }}
    <div *ngFor="let item of [1, 2, 3]; let i = index">
      {{ item }}{{ i }}{{ a }}
    </div>
  </div>`);
    expect(result.content).toContain(
      '{{varList[0]}}{{varList[1]}}{{varList[2]}}'
    );
    expect(result.content).toContain('wx:for="{{varList[3]}}"');
    expect(result.template).toContain(
      `{{varList[0]}}{{varList[1]}}{{varList[2]}}{{varList[3]}}{{varList[4]}}`
    );
    const execResult = runLogic(result.logic, { originVar: { a: 1 } });
    expect(execResult.varList[0]).toBe(' ');
    expect(execResult.varList[1]).toBe(1);
    expect(execResult.varList[2]).toBe(' ');
    expect(execResult.varList[3]).toEqual([1, 2, 3]);
    expect(execResult.directive[0][0].varList[0]).toBe(' ');
    expect(execResult.directive[0][0].varList[1]).toBe(1);
    expect(execResult.directive[0][1].varList[1]).toBe(2);
    expect(execResult.directive[0][2].varList[1]).toBe(3);
    expect(execResult.directive[0][0].varList[2]).toBe(0);
    expect(execResult.directive[0][0].varList[3]).toBe(1);
    expect(execResult.directive[0][0].varList[4]).toBe(' ');
  });
  it('纯插值', () => {
    const result = defaultTransform(`{{'111'}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
  });
  it('变量插值', () => {
    const result = defaultTransform(`{{a[b]}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
  });
  it('复合上下文', () => {
    const result =
      defaultTransform(`<div *ngFor="let item of list1; let i = index">
     <div *ngFor="let item of list2; let j = index">{{item}}{{i}}{{j}}</div>
    </div>
  `);
    const execResult = runLogic(result.logic, {
      originVar: { list1: [1, 2, 3], list2: [3, 2, 1] },
    });

    expect(execResult.directive[0][0].directive[0][0].varList).toEqual({
      0: 3,
      1: 0,
      2: 0,
    });
    expect(execResult.directive[0][2].directive[0][2].varList).toEqual({
      0: 1,
      1: 2,
      2: 2,
    });
  });
});
