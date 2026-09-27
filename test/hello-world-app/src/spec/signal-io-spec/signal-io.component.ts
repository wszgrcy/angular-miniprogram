import { Component, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { SignalIoComponent } from '../../spec-component/signal-io/signal-io.component';
import { nodeNotEmpty, nodeExist } from '../util';

/**
 * 验证 signal input / signal output：
 * - signal input 的值可以被渲染
 * - signal output 可以被父组件的模板监听收到
 */
@Component({
  standalone: false,
  selector: 'app-signal-io-spec',
  template: `<app-signal-io
    #instance
    [input1]="'hello'"
    (emitted)="onEmitted($event)"
  ></app-signal-io>`,
})
export class SignalIoSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  /** 由子组件 signal output 回传 */
  emittedValue: string | undefined;

  onEmitted(value: string) {
    this.emittedValue = value;
  }

  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<SignalIoSPecComponent>
    ) {
      this.__ngComponentInstance.componentFinderService
        .get(this.__ngComponentInstance.instance)
        .then(
          async (
            item: WechatMiniprogram.Page.Instance<
              WechatMiniprogram.IAnyObject,
              WechatMiniprogram.IAnyObject
            >
          ) => {
            const query = item.createSelectorQuery();

            // signal input 渲染出了内容
            expect(await nodeExist(query, '.signal-io-content')).toBe(true);
            expect(await nodeNotEmpty(query, '.signal-io-content')).toBe(true);
            // signal output 被父组件收到，并且携带的是 computed 之后的值
            expect(this.__ngComponentInstance.emittedValue).toBe('hello!');

            this.__ngComponentInstance.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: SignalIoComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
