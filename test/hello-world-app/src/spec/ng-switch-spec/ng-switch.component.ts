import { Component, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { BehaviorSubject } from 'rxjs';
import { NgSwitchComponent } from '../../spec-component/ng-switch/ng-switch.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-ng-switch-spec',
  template: `<app-ng-switch #instance></app-ng-switch>`,
})
export class NgSwitchSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (this: NgSwitchSPecComponent) {
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

            expect(await nodeExist(query, '.switch-case1')).toBe(true);
            expect(await nodeExist(query, '.switch-case2')).toBe(false);
            expect(await nodeExist(query, '.switch-default')).toBe(false);
            this.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: NgSwitchComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
