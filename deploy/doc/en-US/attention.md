---
layout: post
title: Attention
---
## Forbidden

- All Dom operation

## Import Change

- Use `angular-miniprogram/common` replace `@angular/common`
- Use `angular-miniprogram/common/http` replace `@angular/common/http`
- Use `angular-miniprogram/forms` replace `@angular/forms`
- Use `import { HttpClientModule, provideHttpClient } from 'angular-miniprogram'` replace `import { HttpClientModule, provideHttpClient } from '@angular/common/http'`

## Attention

- A event with prefix,like `bind`,`mut-bind`,etc,remove `:`,such as `bind:tap`=>`bindtap`
  > Prefix in Angular resolve as `target`(window/document/body)
- Miniprogram native component need set `schemas:[NO_ERRORS_SCHEMA]` in `NgModule`
- if property operation not display on view, need to use `detectChanges`
- Now, one file only allow one `@Component`

## Compatible

### Use Template

- `createEmbeddedView` only allow in `structural directive`,or `TemplateRef`
- `createEmbeddedView`need a `__templateName` property in `context` object,this property is miniprogram name
- this name can be find in a private variable: `(this.templateRef as any)._declarationTContainer.localNames[0]`
- only first `template variable` name can be use

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
### Template Rename

- `ng-template` name can't repeat in one Component, if exist, you can use mulit `template variable`
- `<ng-template #name1 #name2></ng-template>` `#name1` is the alias name, and `#name2` is the repeat name
- The first name will write in the template file, but all `template variable` can be use in Angular

### Cross Component use Template

- In same project, a Component use other Component `TemlateRef`,template name should follow this format`$$mp$$__self$$xxx`

  > `same application`or`same library` is same project


```html
<ng-template #$$mp$$__self__$$self1> content </ng-template>
<app-component-need-template
  [templateRef]="$$mp$$__self__$$self1"
></app-component-need-template>

```
- transfer `TemplateRef` to Other library Component, template name should follow this format`$$mp$$TemplateScopeName$$xxx`, `TemplateScopeName`rule as follow:

```ts
import { strings } from '@angular-devkit/core';
//library library name
export function libraryTemplateScopeName(library: string) {
  return strings.classify(library.replace(/[@/]/g, ''));
}
```

- for example: `test-library`=>`TestLibrary`,`@my/library`=>`MyLibrary`


```html
<ng-template #$$mp$$TestLibrary$$first>
  <app-component1></app-component1>
</ng-template>

<app-outside-template
  [template]="$$mp$$TestLibrary$$first"
></app-outside-template>
```
