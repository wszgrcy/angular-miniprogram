---
title: '变更检测与状态'
---

小程序逻辑层没有可挂钩的 DOM 事件循环，本库也不注入 `zone.js`：运行的是 Angular 22 默认的
zoneless 变更检测。这与许多既有 Angular 代码的假设不同，是迁移中最常见的问题之一，
因此放在最前面说明。

## 自动刷新的范围

Angular 会在**模板事件**的包装中标脏视图，因此以下用法照常工作，普通字段同样会刷新：

- 模板中的事件绑定：`(tap)`、`(input)`、`(bindchange)` …
- 子组件的 `@Output`、`model()` 双向绑定
- `async` 管道、`signal` 写入
- `@if` / `@for` / `@switch` 控制流、`*ngIf` / `*ngFor`

## 不会自动刷新的情况

在 Angular 未感知的路径中修改状态，视图不会更新：

```ts
export class OrderComponent {
  status = '';

  ngOnInit() {
    // 小程序 API 的回调
    wx.getNetworkType({
      success: (res) => {
        this.status = res.networkType; // 视图不刷新
      },
    });

    setTimeout(() => {
      this.status = '延迟'; // 同样不刷新
    }, 1000);
  }
}
```

两种处理方式，任选其一：

**用 signal（推荐）**

```ts
readonly status = signal('');

ngOnInit() {
  wx.getNetworkType({ success: (res) => this.status.set(res.networkType) });
}
```

写入即标脏，模板中通过 `{{ status() }}` 取值。

**显式标脏**

```ts
private readonly cdr = inject(ChangeDetectorRef);

wx.getNetworkType({
  success: (res) => {
    this.status = res.networkType;
    this.cdr.markForCheck();
  },
});
```

`detectChanges()` 会立即同步执行一次本视图的变更检测，`markForCheck()` 只标脏、
等待下一轮调度。回调密集的场景应使用后者。

## 组件内状态建议使用 signal

模板中 `{{ count() }}` 这类写法在小程序侧没有特殊之处——它是普通的方法调用，
由 Angular 求值后转换为 `setData` 的数据。使用 signal 的收益不在于渲染，而在于
**无需记忆哪些位置需要手动标脏**。

`computed` 照常可用：

```ts
readonly list = signal<Item[]>([]);
readonly keyword = signal('');
readonly filtered = computed(() => {
  const kw = this.keyword().trim();
  return kw ? this.list().filter((it) => it.name.includes(kw)) : this.list();
});
```

## 表单

`angular-miniprogram/forms` 中的值访问器在写回时会通知控件，`[(ngModel)]` /
`formControlName` 无需额外标脏。见 [表单](../../runtime/forms/)。
