import { Component, HostBinding, OnInit, input } from '@angular/core';

@Component({
  selector: 'lib-test-library',
  // 注意：这里**不能**是空模板。
  // 之前是空模板，导致产出的
  // `library/test-library/test-library-component/test-library-component.wxml`
  // 只剩一个 `<block wx:if="{{hasLoad}}"></block>`，根本看不出“渲染了没有”。
  // 现在给一个带唯一标记的可见内容，供 demo 页肉眼和断言共同验收。
  template: `
    <p class="lib-test-library__body">
      [LIB_TEST_LIBRARY_RENDERED] input1={{ input1() }}
    </p>
  `,
  styleUrls: ['./test-library.component.scss'],
})
export class TestLibraryComponent implements OnInit {
  /** signal input，替代 @Input() */
  input1 = input<any>(undefined);
  @HostBinding('property1') property1;

  constructor() {}

  ngOnInit(): void {}
}
