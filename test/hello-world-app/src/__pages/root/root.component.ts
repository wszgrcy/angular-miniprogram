import { Component, Inject, OnInit } from '@angular/core';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
})
export class RootComponent implements OnInit {
  constructor(@Inject(MINIPROGRAM_GLOBAL_TOKEN) private global: any) {}

  ngOnInit() {}
  baseTag() {
    this.global.navigateTo({ url: '/pages/base-tap/base-tap-entry' });
  }
  baseComponent() {
    this.global.navigateTo({
      url: '/pages/base-component/base-component-entry',
    });
  }
  baseDirective() {
    this.global.navigateTo({
      url: '/pages/base-directive/base-directive-entry',
    });
  }
  ngContent() {
    this.global.navigateTo({ url: '/pages/ng-content/ng-content-entry' });
  }
  defaultStructuralDirective() {
    this.global.navigateTo({
      url: '/pages/default-structural-directive/default-structural-directive-entry',
    });
  }
  customStructuralDirective() {
    this.global.navigateTo({
      url: '/pages/custom-structural-directive/custom-structural-directive-entry',
    });
  }
  complexStructure() {
    this.global.navigateTo({
      url: '/pages/complex-structure/complex-structure-entry',
    });
  }
  complexPropertyEvent() {
    this.global.navigateTo({
      url: '/pages/complex-property-event/complex-property-event-entry',
    });
  }
  baseForms() {
    this.global.navigateTo({
      url: '/pages/base-forms/base-forms-entry',
    });
  }
  componentUseTemplate() {
    this.global.navigateTo({
      url: '/pages/component-use-template/component-use-template-entry',
    });
  }
  baseHttp() {
    this.global.navigateTo({
      url: '/pages/base-http/base-http-entry',
    });
  }
  selfComponent() {
    this.global.navigateTo({
      url: '/pages/self-component/self-component-entry',
    });
  }
  lifeTime() {
    this.global.navigateTo({
      url: '/pages/life-time-page/life-time-page-entry',
    });
  }
  lifeTimeUseComponent() {
    this.global.navigateTo({
      url: '/pages/life-time-page-use-component/life-time-page-use-component-entry',
    });
  }
}
