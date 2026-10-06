---
title: 'WXS 渲染层脚本'
---

WXS 是跑在**渲染层**的脚本语言。用它可以把一部分计算留在渲染层，逻辑层不参与：
数据变了直接由渲染层算完渲染，**一次 `setData` 都不发**。

单向的：

- 逻辑层 → 渲染层：编译期把绑定下推，运行时零通信
- 渲染层 → 逻辑层：只有 `ownerInstance.callMethod(name, args)`，异步

## 声明

写在模板里，`src` 相对**组件源文件**解析：

```html
<wxs module="fmt" src="./format.wxs"></wxs>

<div class="page">{{ fmt.money(price()) }}</div>
```

组件上标 `NO_ERRORS_SCHEMA` 是为了 IDE 不报红——`<wxs>` 和 `fmt.xxx` 都不是 Angular
的实体，它们由构建器在模板上摘除 / 改写成渲染层调用。小程序构建本身不查模板类型，
不标也能构建过。

```ts
@Component({
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './wxs.component.html',
})
export class WxsComponent {}
```

共享脚本写相对路径即可（`../../common/format.wxs`）。产物里每个模块只落一份，
集中到 `common/` 目录，所有 wxml 用应用根绝对路径引用。

**模板内联写法不支持**（`<wxs module="x">…js…</wxs>` 里直接塞代码）。
Angular 的模板解析器会把裸 JS 的 `{` 当成 ICU / 插值起始符，
`module.exports={a:a}` 直接解析失败。用 `src` 指文件。

## 模块文件

对外成员必须写在 `module.exports` 里，模板才能 `fmt.xxx` 取到：

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

WXS 是一门被裁剪过的 ES5 方言。下面这些**构建期直接报错**，不会静默产出错误代码：

| 不支持 | 原因 |
| --- | --- |
| `async` / `await` | 渲染层没有 |
| `class` | 同上 |
| `try` / `catch` | 同上 |
| `import` | wxs 没有模块系统，用 `module.exports` |
| 模板字符串插值 `` `a${b}` `` | 同上 |

## 什么会被下推

模板里凡是命中 wxs 调用的绑定表达式，都会被改写成渲染层调用，逻辑层不再参与这段计算：

```html
<div [class]="fmt.cls('wxs-box', on())"></div>
<p>{{ fmt.money(price()) + ' 元' }}</p>
<p>{{ on() ? fmt.money(price()) : '—' }}</p>
```

结果可以照常参与运算、三元、字符串拼接。

两条限制：

- **`[class.foo]` / `[style.color]` 这种逐目标绑定不能用 wxs**，构建期报错。
  逐目标需要每个目标各开一条物化通道，跟「整值下推」模型对不上。改用整体绑定
  `[class]="fmt.cls(...)"`
- wxml 表达式里没有对象展开（`{...x}`）和部分运算符，命中会报错

## 渲染层回调逻辑层

只有 `callMethod` 一条路，异步。把 wxs 函数当事件处理用，写**静态属性**（
不带冒号、不带括号），第二个参数就是组件实例：

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

被 `callMethod` 提到的方法名在**构建期**被静态收集，自动注册到小程序实例的
`methods` 上做转发（小程序要求 `callMethod(name)` 的 `name` 提前存在，调用时再
注册已经晚了）。Angular 侧那个方法照常写就行。

首屏的 wxs 事件可能比 Angular 组件与小程序实例的链接先到，这类回调会暂存后补发
（上限 20 条，溢出会告警）。

## 平台差异

作者只写微信一种写法（`<wxs module src>`），构建期按平台转译标签名与扩展名：

| 平台 | 标签 | 属性 | 扩展名 |
| --- | --- | --- | --- |
| 微信 | `<wxs>` | `module` / `src` | `.wxs` |
| QQ | `<qs>` | `module` / `src` | `.qs` |
| 支付宝 / 钉钉 | `<import-sjs>` | `name` / `from` | `.sjs` |
| 百度 | `<import-sjs>` | `module` / `src` | `.sjs` |
| 字节 / 快手 / 小红书 / 飞书 | `<sjs>` | `module` / `src` | `.sjs` |
| 京东 | `<jds>` | `module` / `src` | `.jds` |

## 什么时候值得用

适合：格式化（金额、日期、千分位）、class 名拼接、列表项的展示派生值——
这些每次数据变化都要重算，留在渲染层省掉一整轮 `setData`。

不适合：任何需要访问 Angular 状态、服务、HTTP 的逻辑。渲染层拿不到那些东西。
