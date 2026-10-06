---
title: '表单'
---

`@angular/forms` 不能直接用。它的值访问器监听 DOM 的 `input` / `change` 事件，
而小程序组件发的是 `bindinput` / `bindchange`，值也不在 `event.target.value` 而在
`event.detail.value`。

`angular-miniprogram/forms` 是同一套 forms 的小程序版，API 名字完全一致，
**只需要换导入路径**：

```ts
// ✗ import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from 'angular-miniprogram/forms';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `…`,
})
export class FormComponent {}
```

`FormBuilder` `FormControl` `FormGroup` `FormArray` `Validators` 以及全部指令都从
同一路径导出。

## 哪些组件有值访问器

| 组件 | 控件值 | 触发事件 |
| --- | --- | --- |
| `input` `textarea` | `string` | `bindinput`（`bindblur` 触发 `markAsTouched`） |
| `input[type=number]` | `number \| null` | `bindinput` |
| `switch` | `boolean` | `bindchange` |
| `slider` | `number` | `bindchange` |
| `radio-group` | 选中项的 `value` | `bindchange` |
| `checkbox-group` | `string[]`（勾选项的 value 列表） | `bindchange` |
| `picker` | 随 `mode`：`selector` 是下标、`time` 是 `hh:mm`、`date` 是 `YYYY-MM-DD`、`multiSelector` 是数组 | `bindchange` |
| `picker-view` | `number[]` | `bindchange` |

`checkbox` / `radio` 自己不发事件，必须包在 `checkbox-group` / `radio-group` 里。

## 模板驱动

```html
<input type="text" [(ngModel)]="value" (ngModelChange)="onEdit($event)" />

<checkbox-group [(ngModel)]="checked">
  <checkbox value="1" />
  <checkbox value="2" />
</checkbox-group>

<picker mode="selector" [range]="fruits" [(ngModel)]="fruitIndex">
  <view>已选：{{ fruits[fruitIndex] }}</view>
</picker>

<switch [(ngModel)]="enabled" />
```

```ts
value = '默认值';
checked = ['1'];
enabled = false;
fruits = ['苹果', '香蕉'];
fruitIndex = 0;
```

## 响应式

```ts
readonly form = new FormGroup({
  title: new FormControl('', [Validators.required]),
  count: new FormControl(1),
  notify: new FormControl(false),
  tags: new FormControl<string[]>([]),
});
```

```html
<input formControlName="title" />
<switch formControlName="notify" />
<checkbox-group formControlName="tags">
  <checkbox value="a" /><checkbox value="b" />
</checkbox-group>
```

## 自定义组件当控件

自定义组件里做双向绑定，加 `ngDefaultControl`，然后按小程序的事件名接：

```html
<app-rating ngDefaultControl [(ngModel)]="score" (bindchange)="score = $event.detail.value"></app-rating>
```

值写回走 `@Input`，`writeValue` 由访问器调 `setProperty('value', …)`，
所以自定义组件要有一个 `value` 输入。

## 校验

`Validators` 全套可用（`required` `min` `max` `minLength` `maxLength` `pattern` `email`
`requiredTrue` `email` 以及自定义 `ValidatorFn` / `AsyncValidatorFn`）。

状态类名（`ng-valid` / `ng-invalid` / `ng-dirty` / `ng-touched`）会加到元素 class 上。
小程序的样式隔离可能让它们不生效，用 `[class.xxx]="ctrl.invalid"` 显式绑更稳。
