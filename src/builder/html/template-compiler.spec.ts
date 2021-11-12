import { Injector } from 'static-injector';
import * as vm from 'vm';
import { BuildPlatform } from '../platform/platform';
import { WxPlatformInfo } from '../platform/wx-platform-info';
import { WxTransform } from '../template-transform-strategy/wx.transform';
import {
  COMPONENT_FILE_NAME_TOKEN,
  COMPONENT_TEMPLATE_CONTENT_TOKEN,
  DIRECTIVE_MATCHER,
} from '../token/component.token';
import { TemplateCompiler } from './template-compiler';

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
        { provide: DIRECTIVE_MATCHER, useValue: undefined },
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

    result = defaultTransform(
      `<div *ngIf="a;else elseBlock"></div><ng-template #elseBlock></ng-template>`
    );
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).toContain(`is="elseBlock"`);
    expect(result.template).toContain('name="elseBlock"');

    result = defaultTransform(
      `<div *ngIf="a;then thenBlock else elseBlock"></div><ng-template #elseBlock></ng-template><ng-template #thenBlock></ng-template>`
    );
    expect(result.content).toContain(`wx:if="{{varList[0]}}"`);
    expect(result.content).toContain(`is="thenBlock"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).toContain(`is="elseBlock"`);
    expect(result.template).toContain('name="elseBlock"');
    expect(result.template).toContain('name="thenBlock"');
  });
  it('ng-template->template', () => {
    const result = defaultTransform(
      `<ng-template #templateRef>content1</ng-template>`
    );
    expect(result.template).toContain('name="templateRef"');
  });
  it('interpolation(插值)', () => {
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

    result = defaultTransform(`{{a[b]}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
  });
  it('插值常量绑定', () => {
    let result = defaultTransform(`{{'测试'}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
    result = defaultTransform(`{{a['prob1']}}`);
    expect(result.content).toContain(`{{varList[0]}}`);
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
    result = defaultTransform(`{{(123456|pipe1:1:2:title)|pipe2}}`);

    result = defaultTransform(
      `{{(123456|pipe1:1:2:title)|pipe2}}<div>{{(123456|pipe1:1:2:title)|pipe2}}</div>`
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
  });
});
