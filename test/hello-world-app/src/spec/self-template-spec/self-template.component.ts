import { Component, ViewChild } from '@angular/core';
import { ComponentFinderService } from 'angular-miniprogram';
import { BehaviorSubject } from 'rxjs';
import { SelfTemplateComponent } from '../../spec-component/self-template/self-template.component';
import { nodeExist } from '../util';

@Component({
  selector: 'app-self-template-spec',
  template: ` <ng-template #$$mp$$__self__$$self1
      ><div class="content-1">content-1</div></ng-template
    >
    <app-self-template
      #instance
      [template1]="$$mp$$__self__$$self1"
    ></app-self-template>`,
})
export class SelfTemplateSPecComponent {
  testFinish$$ = new BehaviorSubject(undefined);
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onReady: function (this: SelfTemplateSPecComponent) {
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

            expect(await nodeExist(query, '.container-1 .content-1')).toBe(
              true
            );
            this.testFinish$$.complete();
          }
        );
    },
  };
  @ViewChild('instance', { static: true }) instance: SelfTemplateComponent;
  constructor(private componentFinderService: ComponentFinderService) {}
  ngOnInit(): void {}
}
