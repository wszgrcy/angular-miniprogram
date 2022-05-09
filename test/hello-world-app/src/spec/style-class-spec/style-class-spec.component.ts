import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { StyleClassComponent } from '../../spec-component/style-class/style-class.component';
import { fields, nodeExist } from '../util';

@Component({
  selector: 'app-style-class-spec',
  template: `<app-style-class #instance></app-style-class>`,
})
export class StyleClassSpecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<StyleClassSpecComponent>
    ) {
      this.__ngComponentInstance.componentFinderService
        .get(this.__ngComponentInstance.instance)
        .subscribe(
          async (
            item: WechatMiniprogram.Page.Instance<
              WechatMiniprogram.IAnyObject,
              WechatMiniprogram.IAnyObject
            >
          ) => {
            let query = item.createSelectorQuery();

            expect(await nodeExist(query, '.class-1')).toBe(true, 'class-1');
            expect(await nodeExist(query, '.class-2')).toBe(true, 'class-2');
            let result = await fields(query, '.class-2', {
              computedStyle: ['backgroundColor'],
            });
            expect(result).toEqual({ backgroundColor: 'rgb(255, 0, 0)' });
            this.__ngComponentInstance.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: StyleClassComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
}
