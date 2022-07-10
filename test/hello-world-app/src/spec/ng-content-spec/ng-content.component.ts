import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { MiniProgramComponentInstance } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';
import { NgContentComponent } from '../../spec-component/ng-content/ng-content.component';
import { nodeExist, nodeNotEmpty } from '../util';

@Component({
  selector: 'app-ng-content-spec',
  template: `<app-ng-content #instance
    ><div class="container">container</div></app-ng-content
  >`,
})
export class NgContentSpecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<NgContentSpecComponent>
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
            expect(await nodeExist(query, '.wrapper-1'))
              .withContext('wrapper')
              .toBe(true);
            // 投影进去的元素没有被正确的查询到,原因未知,但是父级元素高度却产生了变化
            expect(await nodeNotEmpty(query, '.wrapper-1'))
              .withContext('wrapper-1')
              .toBe(true);
            expect(await nodeNotEmpty(query, '.wrapper-2'))
              .withContext('wrapper-2')
              .toBe(false);
            this.__ngComponentInstance.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: NgContentComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
