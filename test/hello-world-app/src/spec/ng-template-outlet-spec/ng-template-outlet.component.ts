import { Component, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { BehaviorSubject } from 'rxjs';
import { NgTemplateOutletComponent } from '../../spec-component/ng-template-outlet/ng-template-outlet.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-ng-template-outlet-spec',
  template: `<app-ng-template-outlet #instance></app-ng-template-outlet>`,
})
export class NgTemplateOutletSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (this: NgTemplateOutletSPecComponent) {
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

            expect(await nodeExist(query, '.template-content-1')).toBe(true);
            expect(await nodeExist(query, '.template-content-2')).toBe(false);
            this.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: NgTemplateOutletComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
