import { Component } from '@angular/core';

/**
 * 内建控制流（`@if` / `@for` / `@switch`）的样例页面。
 *
 * 覆盖点：
 * - `@if` / `@else if` / `@else`
 * - `@if (x as y)` 别名
 * - 条件表达式里带管道（会额外占用宿主视图的声明槽位）
 * - `@for` + `@empty`，以及 `$index` 等上下文变量
 * - `@switch` / `@case` / `@default`
 * - 控制流嵌套
 */
@Component({
  standalone: false,
  selector: 'app-control-flow',
  templateUrl: './control-flow.component.html',
})
export class ControlFlowComponent {
  show = true;
  other = false;
  list = ['a', 'b', 'c'];
  emptyList: string[] = [];
  mode = 'a';
  nested = true;

  /** 用于管道条件，避免真的引入 async 带来的时序问题 */
  flag$ = { pipe: true };
}
