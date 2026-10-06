import { Component, HostBinding, HostListener, Input } from '@angular/core';

/**
 * 二级出口里的组件。
 *
 * 故意把 host 事件 / host 属性 / input 都摆上，让二级出口走的是和一级出口
 * **完全相同**的元数据链路，而不是只测「能编译过」：
 *
 *   - `@HostListener('tap')` → sidecar `listeners: ['tap']` → wxml `bind:tap`
 *   - `@HostBinding('class')` → sidecar `properties: ['class']`
 *   - `@Input() label` → 组件模板里渲染出真实值
 *   - `.css` → sidecar `style` → 产物 `.wxss`
 *   - 内联 `styles` → 同样进 sidecar `style`（与 styleUrls 拼接，不是二选一）
 */
@Component({
  selector: 'lib-secondary-entry',
  templateUrl: './secondary-entry.component.html',
  styleUrls: ['./secondary-entry.component.css'],
  styles: ['.lib-secondary-entry__inline { color: #12b420; }'],
})
export class SecondaryEntryComponent {
  @Input() label = 'secondary-default';

  @HostBinding('class') hostClass = 'lib-secondary-entry__body';

  hitCount = 0;

  @HostListener('tap')
  onTap() {
    this.hitCount++;
  }
}
