---
title: 'ng-template 与 TemplateRef'
---

浏览器环境中 `<ng-template>` 表示一段尚未实例化的视图，通过 DOM 锚点定位。
小程序的渲染层是静态生成的，因此每个模板在 wxml 中都会对应一个具名的
`<template name="…">`。**模板名因此成为对外契约**，跨组件传递模板时需要按约定命名。

## 模板名的生成规则

| 写法                                       | 编译后的模板名                                                    |
| ------------------------------------------ | ----------------------------------------------------------------- |
| `<ng-template #alpha>…</ng-template>`      | `alpha`                                                           |
| `<ng-template>…</ng-template>`（无引用名） | `ngDefault_<下标>`                                                |
| `@if` / `@for` / `@switch` 的隐式模板      | 自动生成的名称，如 `ifBlock_16` / `forBlock_32` / `switchBlock_…` |
| 结构指令 `*ngIf` / `*ngFor`                | 同上，由内置指令生成                                              |

模板名在同一份 wxml 中必须唯一。两个 `<ng-template>` 使用同一引用名会产生冲突。

## 引用名冲突的处理

同一个 `<ng-template>` 可以声明多个引用名：

```html
<ng-template #realName #maybeDuplicated> 内容 </ng-template>
```

**第一个引用名即编译进产物的真实模板名**，其余引用名仍可作为模板引用变量在模板中
使用。因此当存在重名可能时，应将确定的名称写在第一位。

## 同组件内用 `createEmbeddedView`

自定义结构指令无需显式传递 `__templateName`，运行时会根据模板声明名自动推导：

```ts
@Directive({ selector: '[myStructural]' })
export class MyStructuralDirective {
  private readonly vcr = inject(ViewContainerRef);
  @Input() myStructural!: TemplateRef<unknown>;

  ngOnInit() {
    this.vcr.createEmbeddedView(this.myStructural);
  }
}
```

```html
<ng-template #myTpl><view>内容</view></ng-template> <view *myStructural></view>
```

需要覆盖默认名称时，在 context 中显式传入 `__templateName` 仍然有效，且优先级更高：

```ts
this.vcr.createEmbeddedView(this.tpl, { __templateName: 'otherTpl' });
```

## 跨组件传模板

`TemplateRef` 被传入**其他组件**的模板中渲染时，仅靠声明名不再足够——
渲染它的那份 wxml 中不存在该 `<template>`。此时模板名需要带上作用域前缀。

### 同一个 application 内

```html
<ng-template #$$mp$$__self__$$self1>
  <app-component1 [input1]="'外部模板'"></app-component1>
</ng-template>

<app-outside-template [template]="$$mp$$__self__$$self1"></app-outside-template>
```

### 传给组件库里的组件

前缀中的作用域名由库名推导：

```ts
import { strings } from '@angular-devkit/core';

function libraryTemplateScopeName(library: string) {
  return strings.classify(library.replace(/[@/]/g, ''));
}
```

| 库名           | 作用域名      |
| -------------- | ------------- |
| `test-library` | `TestLibrary` |
| `@my/library`  | `MyLibrary`   |

```html
<ng-template #$$mp$$TestLibrary$$first>
  <app-component1></app-component1>
</ng-template>

<app-outside-template
  [template]="$$mp$$TestLibrary$$first"
></app-outside-template>
```

组件库一侧照常书写 `[template]` + `ngTemplateOutlet`，无需为该前缀做任何处理：

```ts
@Component({
  template: ` <div *ngIf="template">
    <ng-container *ngTemplateOutlet="template"></ng-container>
  </div>`,
})
export class OutsideTemplateComponent {
  @Input() template?: TemplateRef<unknown>;
}
```

`$` 是 `ng-template` 引用名中的合法字符，Angular 会将其作为引用名的一部分处理。

## `ngTemplateOutlet` 与 `ng-container`

`ngTemplateOutlet`、`ng-container`、`ng-template` 的组合用法与浏览器环境一致，
`context` 的传递方式不变。`ng-container` 编译为 `<block>`，不产生任何元素。

```html
<ng-container
  *ngTemplateOutlet="tpl; context: { $implicit: item }"
></ng-container>
```
