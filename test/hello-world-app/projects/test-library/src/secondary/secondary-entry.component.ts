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
 */
@Component({
  selector: 'lib-secondary-entry',
  templateUrl: './secondary-entry.component.html',
  styleUrls: ['./secondary-entry.component.css'],
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
