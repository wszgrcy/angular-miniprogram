import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
})
export class RootComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  baseTag() {
    wx.navigateTo({ url: '/pages/base-tap/base-tap.entry' });
  }
  baseComponent() {
    wx.navigateTo({ url: '/pages/base-component/base-component.entry' });
  }
  baseDirective() {
    wx.navigateTo({ url: '/pages/base-directive/base-directive.entry' });
  }
  ngContent() {
    wx.navigateTo({ url: '/pages/ng-content/ng-content.entry' });
  }
  defaultStructuralDirective() {
    wx.navigateTo({
      url: '/pages/default-structural-directive/default-structural-directive.entry',
    });
  }
  customStructuralDirective() {
    wx.navigateTo({
      url: '/pages/custom-structural-directive/custom-structural-directive.entry',
    });
  }
  complexStructure() {
    wx.navigateTo({ url: '/pages/complex-structure/complex-structure.entry' });
  }
  complexPropertyEvent() {
    wx.navigateTo({
      url: '/pages/complex-property-event/complex-property-event.entry',
    });
  }
  baseForms() {
    wx.navigateTo({
      url: '/pages/base-forms/base-forms.entry',
    });
  }
}
