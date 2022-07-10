import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { NgForComponent } from '../../spec-component/ng-for/ng-for.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-ng-for-spec',
  template: `<app-ng-for #instance [list]="list"></app-ng-for>`,
})
export class NgForSPecComponent {
  list = ['item1', 'item2', 'item3'];
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<NgForSPecComponent>
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
            let query = item.createSelectorQuery();
            for (let i = 0; i < this.__ngComponentInstance.list.length; i++) {
              expect(await nodeExist(query, `.ng-for-${i}`)).toBe(true);
            }

            this.__ngComponentInstance.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: NgForComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
