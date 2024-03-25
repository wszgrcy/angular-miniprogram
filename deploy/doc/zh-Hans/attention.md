---
layout: post
title: 注意事项
---
## 禁止使用

- 一切 dom 行为
- 带前缀的事件,如`bind`,`mut-bind`等,去掉冒号直接写,如事件`bind:tap`=>`bindtap`
  > 前缀在 Angular 被解析为 target(window/document/body)

## 引入变更

- 使用`angular-miniprogram/common`代替`@angular/common`,
- 使用`angular-miniprogram/common/http`代替`@angular/common/http`
- 使用`angular-miniprogram/forms`代替`@angular/forms`
- 使用`import { HttpClientModule, provideHttpClient } from 'angular-miniprogram'`代替`import { HttpClientModule, provideHttpClient } from '@angular/common/http'`

## 注意

- 小程序的原生组件需要在`NgModule`中设置 `schemas:[NO_ERRORS_SCHEMA]` ,规避检测
- 元素属性赋值操作如果无法响应变更检测,使用`detectChanges`即可
- 目前,一个文件内只能有一个组件存在

## 兼容性支持

### 模板使用

- `createEmbeddedView`方法只能在结构型指令,或非结构型指令但是为模板引用`TemplateRef`中使用
- 当使用`createEmbeddedView`进行插入时,需要在上下文中的对象传递`__templateName`属性,这个属性为小程序的实际对应模板名
- 此模板名也可以访问`TemplateRef`实例的私有变量获得`(this.templateRef as any)._declarationTContainer.localNames[0]`

```ts
@Directive({
  selector: '[appStructural1]',
})
export class Structural1Directive {
  @Input() appStructural1: TemplateRef<any>;
  @Input() appStructural1Name: string;
  constructor(private viewContainerRef: ViewContainerRef) {}
  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.appStructural1, {
      __templateName: this.appStructural1Name,
    });
  }
}

```
### 模板重命名

- 模板会在编译时编译为静态模板,所以可能存在重命名的情况,`如果`存在这种情况,可以使用多模板引用变量的方式实现
- `<ng-template #name1 #name2></ng-template>` `#name2`为可能重复的那个命名,`#name1`为编译到模板中的名字
- 第一个命名始终为模板的真实命名,但是所有的`模板引用变量`都可以引用

### 跨组件调用模板

- 在同一项目下,让其他组件接收到模板时,模板名定义需为`$$mp$$__self$$xxx`,这样就可以在同一项目下传递
  > `同一application`或`同一library`下,都叫同一项目

```html
<ng-template #$$mp$$__self__$$self1> content </ng-template>
<app-component-need-template
  [templateRef]="$$mp$$__self__$$self1"
></app-component-need-template>

```
- 当需要给 library 组件中传入模板时,需要将模板名定义为`$$mp$$TemplateScopeName$$xxx`, `TemplateScopeName`生成规则如下

```ts
import { strings } from '@angular-devkit/core';
//library 为当前libary的名字
export function libraryTemplateScopeName(library: string) {
  return strings.classify(library.replace(/[@/]/g, ''));
}
```

- 如`test-library`库为`TestLibrary`,`@my/library`库为`MyLibrary`

```html
<ng-template #$$mp$$TestLibrary$$first>
  <app-component1></app-component1>
</ng-template>

<app-outside-template
  [template]="$$mp$$TestLibrary$$first"
></app-outside-template>
```
