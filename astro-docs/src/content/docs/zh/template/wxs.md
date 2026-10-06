---
title: 'WXS 渲染层脚本'
---

WXS 是运行在**渲染层**的脚本语言。它可以将部分计算保留在渲染层，逻辑层不参与：
数据变化时由渲染层直接计算并渲染，**不产生任何 `setData`**。

通信是单向的：

- 逻辑层 → 渲染层：编译期把绑定下推，运行时零通信
- 渲染层 → 逻辑层：仅有 `ownerInstance.callMethod(name, args)`，异步

## 声明

书写在模板中，`src` 相对**组件源文件**解析：

```html
<wxs module="fmt" src="./format.wxs"></wxs>

<div class="page">{{ fmt.money(price()) }}</div>
```

组件上声明 `NO_ERRORS_SCHEMA` 是为了避免 IDE 报错——`<wxs>` 与 `fmt.xxx` 都不是 Angular
的实体，它们由构建器在模板上摘除或改写为渲染层调用。小程序构建本身不检查模板类型，
不声明也可以通过构建。

```ts
@Component({
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './wxs.component.html',
})
export class WxsComponent {}
```

共享脚本书写相对路径即可（`../../common/format.wxs`）。产物中每个模块只输出一份，
集中到 `common/` 目录，所有 wxml 以应用根绝对路径引用。

**不支持模板内联写法**（在 `<wxs module="x">…js…</wxs>` 中直接书写代码）。
Angular 的模板解析器会把裸 JS 的 `{` 当作 ICU 或插值起始符，
`module.exports={a:a}` 会直接解析失败。应使用 `src` 指向文件。

## 模块文件

对外成员必须声明在 `module.exports` 中，模板才能通过 `fmt.xxx` 获取：

```js
// format.wxs
var CURRENCY = '¥';

function money(v) {
  if (v === null || v === undefined || v === '') {
    return '--';
  }
  var n = parseFloat(v);
  if (isNaN(n)) {
    return '--';
  }
  return CURRENCY + n.toFixed(2);
}

module.exports = {
  CURRENCY: CURRENCY,
  money: money,
};
```

### 语法限制

WXS 是一门经过裁剪的 ES5 方言。以下写法**构建期直接报错**，不会静默产出错误代码：

| 不支持                       | 原因                                      |
| ---------------------------- | ----------------------------------------- |
| `async` / `await`            | 渲染层不提供                              |
| `class`                      | 同上                                      |
| `try` / `catch`              | 同上                                      |
| `import`                     | wxs 没有模块系统，需使用 `module.exports` |
| 模板字符串插值 `` `a${b}` `` | 同上                                      |

## 下推的范围

模板中命中 wxs 调用的绑定表达式都会被改写为渲染层调用，逻辑层不再参与该部分计算：

```html
<div [class]="fmt.cls('wxs-box', on())"></div>
<p>{{ fmt.money(price()) + ' 元' }}</p>
<p>{{ on() ? fmt.money(price()) : '—' }}</p>
```

结果可以照常参与运算、三元表达式与字符串拼接。

两条限制：

- **`[class.foo]` / `[style.color]` 这类逐目标绑定不能使用 wxs**，构建期报错。
  逐目标绑定需要为每个目标各开启一条物化通道，与整值下推模型不匹配。应改用整体绑定
  `[class]="fmt.cls(...)"`
- wxml 表达式不支持对象展开（`{...x}`）和部分运算符，命中会报错

## 渲染层回调逻辑层

只能通过 `callMethod`，且为异步。将 wxs 函数作为事件处理器使用时，需书写**静态属性**（
不带冒号、不带括号），第二个参数即组件实例：

```html
<view bindtap="fmt.onTap">点我</view>
```

```js
// format.wxs
function onTap(event, ownerInstance) {
  ownerInstance.callMethod('mpTap', { id: 1 });
}
module.exports = { onTap: onTap };
```

被 `callMethod` 引用的方法名会在**构建期**静态收集，并自动注册到小程序实例的
`methods` 上做转发（小程序要求 `callMethod(name)` 的 `name` 提前存在，调用时再
注册为时已晚）。Angular 侧的方法照常书写即可。

首屏的 wxs 事件可能早于 Angular 组件与小程序实例的链接到达，这类回调会被暂存后补发
（上限 20 条，溢出会告警）。

## 平台差异

开发者只需书写微信一种写法（`<wxs module src>`），构建期按平台转译标签名与扩展名：

| 平台                        | 标签           | 属性             | 扩展名 |
| --------------------------- | -------------- | ---------------- | ------ |
| 微信                        | `<wxs>`        | `module` / `src` | `.wxs` |
| QQ                          | `<qs>`         | `module` / `src` | `.qs`  |
| 支付宝 / 钉钉               | `<import-sjs>` | `name` / `from`  | `.sjs` |
| 百度                        | `<import-sjs>` | `module` / `src` | `.sjs` |
| 字节 / 快手 / 小红书 / 飞书 | `<sjs>`        | `module` / `src` | `.sjs` |
| 京东                        | `<jds>`        | `module` / `src` | `.jds` |

## 适用场景

适用：格式化（金额、日期、千分位）、class 名拼接、列表项的展示派生值——
这些内容每次数据变化都需要重新计算，保留在渲染层可以省去一整轮 `setData`。

不适用：需要访问 Angular 状态、服务或 HTTP 的逻辑。渲染层无法访问这些内容。
