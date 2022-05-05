import { Component, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { BehaviorSubject } from 'rxjs';
import { NgIfComponent } from '../../spec-component/ng-if/ng-if.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-ng-if-spec',
  template: `<app-ng-if #instance></app-ng-if>`,
})
export class NgIfSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (this: NgIfSPecComponent) {
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

            expect(await nodeExist(query, '.true-1')).toBe(true);
            expect(await nodeExist(query, '.false-1')).toBe(false);
            this.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: NgIfComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
