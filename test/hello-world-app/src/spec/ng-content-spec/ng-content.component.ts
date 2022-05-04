import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { BehaviorSubject } from 'rxjs';
import { NgContentComponent } from '../../spec-component/ng-content/ng-content.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-ng-content-spec',
  template: `<app-ng-content #instance
    ><div class="container"></div
  ></app-ng-content>`,
})
export class NgContentSpecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (this: NgContentSpecComponent) {
      this.componentFinderService
        .get(this.instance)
        .subscribe(
          async (
            item: WechatMiniprogram.Page.Instance<
              WechatMiniprogram.IAnyObject,
              WechatMiniprogram.IAnyObject
            >
          ) => {
            let query = item.createSelectorQuery();
            expect(await nodeExist(query, '.wrapper-1 .container')).toBe(true);
            this.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: NgContentComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
