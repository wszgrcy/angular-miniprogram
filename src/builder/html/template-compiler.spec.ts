import { TemplateCompiler } from './template-compiler';
import { WxTransform } from '../template-transform-strategy/wx.transform';
describe('template-compiler', () => {
  function defaultTransform(content: string) {
    let instance = new TemplateCompiler('', content, new WxTransform());
    return instance.transform();
  }
  // todo 标签
  it('一些标签->view', () => {
    ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
      let result = defaultTransform(`<${tag}></${tag}>`);
      expect(result.content).toContain(`<view`);
      expect(result.content).toContain(`</view>`);
      expect(result.content).toContain(`origin-tag-${tag}`);
      expect(result.context).toEqual([]);
    });
  });
  it('单闭合标签', () => {
    let result = defaultTransform(`<input>`);
    expect(result.content).toContain(`input`);
    expect(result.content).not.toContain(`</input>`);
    expect(result.context).toEqual([]);
  });
  it('ngIf->wx:if', () => {
    let result = defaultTransform(`<div *ngIf="a"></div>`);
    expect(result.content).toContain(`wx:if="{{a}}"`);
    expect(result.content).not.toContain(`wx:else`);
    expect(result.context).toEqual(['a']);
    result = defaultTransform(
      `<div *ngIf="a;else elseBlock"></div><ng-template #elseBlock></ng-template>`
    );
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain(`wx:if="{{a}}"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).toContain(`elseBlock`);
    expect(result.template).toContain('name="elseBlock"');
    result = defaultTransform(
      `<div *ngIf="a;then thenBlock else elseBlock"></div><ng-template #elseBlock></ng-template><ng-template #thenBlock></ng-template>`
    );
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain(`wx:if="{{a}}"`);
    expect(result.content).toContain(`is="thenBlock"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).toContain(`is="elseBlock"`);
    expect(result.template).toContain('name="elseBlock"');
    expect(result.template).toContain('name="thenBlock"');
  });
  it('ng-template->template', () => {
    let result = defaultTransform(
      `<ng-template #templateRef>content1</ng-template>`
    );
    expect(result.template).toContain('name="templateRef"');
    expect(result.context).toEqual([]);
  });
  it('interpolation(插值)', () => {
    let result = defaultTransform(`{{a}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain('{{a}}');
    result = defaultTransform(`{{a.b}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain('{{a.b}}');
    result = defaultTransform(`{{a[0]}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain('{{a[0]}}');
    result = defaultTransform(`{{a['aa']}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain(`{{a['aa']}}`);
    result = defaultTransform(`{{[a,'a']}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain(`{{[a,'a']}}`);
    result = defaultTransform(`{{a?true:false}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain(`{{a?true:false}}`);
    result = defaultTransform(`{{a+b}}+{{c}}+d`);
    expect(result.context).toEqual(['a', 'b', 'c']);
    expect(result.content).toContain(`{{a+b}}+{{c}}+d`);
    result = defaultTransform(`{{a[b]}}`);
    expect(result.context).toEqual(['a', 'b']);
    expect(result.content).toContain(`{{a[b]}}`);
  });
  it('插值常量绑定', () => {
    let result = defaultTransform(`{{'测试'}}`);
    expect(result.context).toEqual([]);
    expect(result.content).toContain(`{{'测试'}}`);

    result = defaultTransform(`{{a['prob1']}}`);
    expect(result.context).toEqual(['a']);
    expect(result.content).toContain(`{{a['prob1']}}`);
  });
  it('ng-content', () => {
    let result = defaultTransform(`<ng-content></ng-content>`);
    expect(result.context).toEqual([]);
    expect(result.content).toContain('<slot></slot>');
    result = defaultTransform(`<ng-content name="abc"></ng-content>`);
    expect(result.context).toEqual([]);
    expect(result.content).toContain('<slot name="abc"></slot>');
  });
  it('ng-template数据绑定', () => {
    let result = defaultTransform(`<div *ngIf="true">{{a}}</div>`);
    expect(result.context).toEqual(['a']);
    result = defaultTransform(
      `<div *ngIf="true">{{a}}<span>{{b}}</span></div>`
    );
    expect(result.context).toEqual(['a', 'b']);
    result = defaultTransform(
      `<div *ngIf="true">{{a}}<div *ngIf="true">{{b}}</div></div>`
    );
    expect(result.context).toEqual(['a', 'b']);
  });
  it('ngFor=>wx:for', () => {
    let result = defaultTransform(`<div *ngFor="let item of list">
    {{item}}
</div>`);
    expect(result.context).toEqual(['list']);

    expect(result.content).toContain(`wx:for="{{list}}"`);
    expect(result.content).toContain(`wx:for-item="item"`);
    result = defaultTransform(`<div *ngFor="let item of list;let i=index">
    {{item}}
</div>`);
    expect(result.content).toContain(`wx:for-index="i"`);
  });
  it('ngSwitch=>wx:if', () => {
    let result = defaultTransform(`<span [ngSwitch]="title">
    <p *ngSwitchCase="abc">1</p>
    <p *ngSwitchCase="false"></p>
    <p *ngSwitchDefault>2</p>
  </span>`);
    expect(result.context).toEqual(['title', 'abc']);
    expect(result.content).toContain(`wx:if="{{title===abc}}"`);
    expect(result.content).toContain(`wx:elif="{{title===false}}"`);
    expect(result.content).toContain(`wx:else`);
    expect(result.content).not.toContain(`ngSwitch`);
  });
  it('event', () => {
    let result = defaultTransform(`<div (bind:tap)="test($event);"></div>`);
    expect(result.content).toContain('bind:tap');
    expect(result.content).toContain('test');
    expect(result.content).not.toContain('$event');
  });
  it('内容', () => {
    let result = defaultTransform(`测试`);
    expect(result.content).toContain('测试');
    expect(result.context).toEqual([]);
  });
});
