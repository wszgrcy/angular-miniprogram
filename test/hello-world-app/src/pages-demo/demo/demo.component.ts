import { Component } from '@angular/core';

/** 由 tools/mp.vite.ts 的 define 注入，构建产物里应该被替换成字面量 */
declare const __MP_HOOK_TAG__: string;

@Component({
  standalone: true,
  selector: 'app-demo',
  template: '<view class="hook-tag">{{ tag }}</view>',
  styles: ['.hook-tag { color: #07c000; }'],
})
export class DemoPage {
  tag = __MP_HOOK_TAG__;
}
