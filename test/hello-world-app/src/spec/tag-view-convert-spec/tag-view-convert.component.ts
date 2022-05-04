import { Component, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { BehaviorSubject } from 'rxjs';
import { TagViewConvertComponent } from '../../spec-component/tag-view-convert/tag-view-convert.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-tag-view-convert-spec',
  template: `<app-tag-view-convert #instance></app-tag-view-convert>`,
})
export class TagViewConvertSpecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (this: TagViewConvertSpecComponent) {
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
            expect(await nodeExist(query, '.tag-name-div')).toBe(true);
            expect(await nodeExist(query, '.tag-name-span')).toBe(true);

            this.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: TagViewConvertComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
