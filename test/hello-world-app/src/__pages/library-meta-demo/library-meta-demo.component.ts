import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  InputOutputDirective,
  LibComp1Component,
  TestLibraryComponent,
  TestLibraryDirective,
} from 'test-library';
import { SecondaryEntryComponent } from 'test-library/src/secondary';

/**
 * 库元数据（sidecar）演示页 —— **零 NgModule**。
 *
 * 全部直接 import 库里的 standalone 指令 / 组件，不经过任何 NgModule。
 * 这一页整页都是「library 调用」，专门用来肉眼验证库元数据有没有正确驱动
 * wxml 生成。覆盖矩阵：
 *
 * | # | 维度                       | 元数据来源                  | 编译后应看到                                        |
 * | - | -------------------------- | --------------------------- | --------------------------------------------------- |
 * | 1 | 库指令 host 事件           | sidecar `listeners`         | `bind:tap` `bind:touchstart`                        |
 * | 2 | 库指令 host 属性           | sidecar `properties`        | `value="{{nodeList[N].property.value}}"`             |
 * | 3 | 库组件 host 属性           | sidecar `properties`        | `property1="{{nodeList[N].property.property1}}"`     |
 * | 4 | 库组件 host 事件           | sidecar `listeners`         | `bind:tap`                                          |
 * | 5 | 库组件 **input 传值**     | 本页编译产物（Angular 自带） | 组件模板里渲染出真实值（见下方说明）                |
 * | 6 | 库指令 **input 传值**     | 本页编译产物（Angular 自带） | 指令收到 `[input1]` / `[input2]`                    |
 * | 7 | 库指令 **output 回抛**    | 本页编译产物（Angular 自带） | `(output1)` / `(output2)` 回调拿到值                |
 * | 8 | 组件 + 指令叠加            | sidecar 合并                | 同一元素上两组 host 绑定都在                        |
 * | 9 | 组件产物路径               | sidecar `outputPath`        | `usingComponents` 指到 `/library/test-library/...`  |
 *
 * ## 关于 5/6/7（input / output）
 *
 * input / output **不需要库侧元数据**：它们是 Angular 自己的绑定，在本页
 * （调用方）的 AOT 产物里就已完成，不经过库也不经过 sidecar。而且它们
 * **不以 wxml 字面量形式出现**——input 通过 vnode（`nodeList[N].property.input1`）
 * 在运行时传给组件，wxml 里只有 host 事件（`bind:*`）和 host 属性
 * （`{{...property.X}}`）。
 *
 * 对应测试：`src/builder/library-meta-sidecar.spec.ts`
 */
@Component({
  imports: [
    CommonModule,
    TestLibraryDirective,
    TestLibraryComponent,
    LibComp1Component,
    InputOutputDirective,
    SecondaryEntryComponent,
  ],
  selector: 'app-library-meta-demo',
  templateUrl: './library-meta-demo.component.html',
  styleUrls: ['./library-meta-demo.component.css'],
})
export class LibraryMetaDemoComponent {
  /** 传给库组件 / 库指令的 input 值 */
  readonly libInputValue = '来自-app的input1';
  readonly libInputCount = 42;

  /** 接收库指令 signal output 回抛的值 */
  libOutput1 = '';
  libOutput2 = 0;

  onLibOutput1(value: string) {
    this.libOutput1 = value;
  }

  onLibOutput2(value: number) {
    this.libOutput2 = value;
  }
}
