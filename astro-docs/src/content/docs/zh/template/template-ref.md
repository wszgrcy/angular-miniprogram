---
title: 'ng-template 与 TemplateRef'
---

浏览器版里 `<ng-template>` 是「一段还没实例化的视图」，靠 DOM 锚点定位。
小程序的渲染层是静态的，所以每个模板在 wxml 里都会落成一个具名的
`<template name="…">`。**模板名因此成了对外契约**，跨组件传模板时要按规矩命名。

## 模板名怎么来的

| 写法 | 编译后的模板名 |
| --- | --- |
| `<ng-template #alpha>…</ng-template>` | `alpha` |
| `<ng-template>…</ng-template>`（无引用名） | `ngDefault_<下标>` |
| `@if` / `@for` / `@switch` 的隐式模板 | `ifBlock_16` / `forBlock_32` / `switchBlock_…` 这种自动名 |
| 结构指令 `*ngIf` / `*ngFor` | 同上，走内置指令那套 |

模板名在同一份 wxml 里必须唯一。两个 `<ng-template>` 取了同一个引用名会撞车。

## 名字撞了怎么办

一个引用名可以挂多个：

```html
<ng-template #realName #maybeDuplicated> 内容 </ng-template>
```

**第一个引用名始终是编译进产物的真实模板名**，其余的都能作为模板引用变量在模板里
被引用。所以「这里可能重名」的那份，把确定的那个名字写在第一位。

## 同组件内用 `createEmbeddedView`

自定义结构指令里不需要再传 `__templateName`，运行时从模板声明名自动推导：

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
<ng-template #myTpl><view>内容</view></ng-template>
<view *myStructural></view>
```

需要覆盖默认名时，context 里显式传 `__templateName` 仍然有效，且优先级更高：

```ts
this.vcr.createEmbeddedView(this.tpl, { __templateName: 'otherTpl' });
```

## 跨组件传模板

`TemplateRef` 一旦被传到**别的组件**的模板里渲染，声明名就不再够用了——
渲染它的那份 wxml 里没有这个 `<template>`。这时模板名要带上作用域前缀。

### 同一个 application 内

```html
<ng-template #$$mp$$__self__$$self1>
  <app-component1 [input1]="'外部模板'"></app-component1>
</ng-template>

<app-outside-template [template]="$$mp$$__self__$$self1"></app-outside-template>
```

### 传给组件库里的组件

前缀里的作用域名由库名算出来：

```ts
import { strings } from '@angular-devkit/core';

function libraryTemplateScopeName(library: string) {
  return strings.classify(library.replace(/[@/]/g, ''));
}
```

| 库名 | 作用域名 |
| --- | --- |
| `test-library` | `TestLibrary` |
| `@my/library` | `MyLibrary` |

```html
<ng-template #$$mp$$TestLibrary$$first>
  <app-component1></app-component1>
</ng-template>

<app-outside-template [template]="$$mp$$TestLibrary$$first"></app-outside-template>
```

库那一侧照常写 `[template]` + `ngTemplateOutlet`，不需要为这个前缀做任何事：

```ts
@Component({
  template: `
    <div *ngIf="template">
      <ng-container *ngTemplateOutlet="template"></ng-container>
    </div>`,
})
export class OutsideTemplateComponent {
  @Input() template?: TemplateRef<unknown>;
}
```

`ng-template` 的引用名里 `$` 是合法字符，Angular 会原样当作引用名处理。

## `ngTemplateOutlet` 与 `ng-container`

`ngTemplateOutlet`、`ng-container`、`ng-template` 组合照常可用，`context` 也照常传。
`ng-container` 编译成 `<block>`，不产生任何元素。

```html
<ng-container *ngTemplateOutlet="tpl; context: { $implicit: item }"></ng-container>
```
