---
title: '变更检测与状态'
---

小程序逻辑层没有 DOM 事件循环可以挂钩，本库也不注入 `zone.js`：跑的是 Angular 22 默认的
zoneless 变更检测。这跟很多既有 Angular 代码的假设不一样，是迁移时最容易踩的一条，
所以放在最前面。

## 什么时候会自动刷新

Angular 在**模板事件**的包装里标脏视图，所以下面这些照常工作，普通字段也一样刷新：

- 模板里的事件绑定：`(tap)`、`(input)`、`(bindchange)` …
- 子组件的 `@Output`、`model()` 双向绑定
- `async` 管道、`signal` 写入
- `@if` / `@for` / `@switch` 控制流、`*ngIf` / `*ngFor`

## 什么时候不会

Angular 不知情的那一侧改状态，视图不会动：

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

两条出路，任选：

**用 signal（推荐）**

```ts
readonly status = signal('');

ngOnInit() {
  wx.getNetworkType({ success: (res) => this.status.set(res.networkType) });
}
```

写入即标脏，模板里 `{{ status() }}` 取值。

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

`detectChanges()` 会立刻同步跑一次本视图，`markForCheck()` 只是标脏、等下一轮调度。
回调密集的场景用后者。

## 组件内状态一律用 signal

模板里 `{{ count() }}` 这种写法在小程序侧没有任何特殊之处——它就是一个普通的方法调用，
由 Angular 求值后物化成 `setData` 的数据。用 signal 的收益不在渲染，而在**不用记哪些
地方需要手动标脏**。

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

`angular-miniprogram/forms` 里的值访问器在写回时会通知控件，`[(ngModel)]` /
`formControlName` 不需要额外标脏。见 [表单](../../runtime/forms/)。
