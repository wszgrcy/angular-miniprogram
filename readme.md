<h1 align="center">angular-miniprogram - 使用 Angular 开发小程序 </h1>

<p align="center">尽可能使用Angular已有生态,降低跨平台时所需成本</p>

<p align="center">
  <a href="https://gitter.im/angular-miniprogram/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge">
    <img src="https://badges.gitter.im/angular-miniprogram/community.svg" alt="gitter" />
  </a>&nbsp;
    <a href="https://www.npmjs.com/package/angular-miniprogram">
    <img src="https://img.shields.io/npm/v/angular-miniprogram.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="angular-miniprogram on npm" />
  </a>&nbsp;
    <a href="https://wszgrcy.github.io/angular-miniprogram/coverage">
    <img src="https://wszgrcy.github.io/angular-miniprogram/badge.svg" alt="coverage" />
  </a>

</p>
<hr>

## 文档

- [快速启动](https://github.com/wszgrcy/angular-miniprogram/blob/master/quick-start.md)
- [注意事项](https://github.com/wszgrcy/angular-miniprogram/blob/master/attention.md)
- [小程序特性](https://github.com/wszgrcy/angular-miniprogram/blob/master/miniprogram-feature.md)

## 开发环境

### 前提条件

- Node.js 版本大于 14
- @angular/cli 版本为 13
- yarn

### hello-world

- 使用[https://github.com/wszgrcy/angular-miniprogram-template](https://github.com/wszgrcy/angular-miniprogram-template)模板或将此项目下载
- 使用 yarn 安装依赖

### 快速启动

- [快速启动](https://github.com/wszgrcy/angular-miniprogram/blob/master/quick-start.md)

## 生态

- 支持`Angualr`的全部服务及管道
- 兼容性支持指令(与 Angular 不同)
- 组件目前在一个文件中只能存在一个

## 支持平台

| 平台名           | 注释                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 微信             | 已实现                                                                                                            |
| 字节跳动         | 已实现                                                                                                            |
| 京东             | 未回应                                                                                                            |
| 百度智能         | 已实现                                                                                                            |
| 支付宝           | 不能使用 Prod,问题[参见](https://forum.alipay.com/mini-app/post/65101060);不能使用基础库 2.0 编译,slot 有部分问题 |
| qq 小程序        | 已实现(非微信变种),但是事件有未知报错?但是好像也不影响                                                            |
| 钉钉小程序       | 支付宝变种                                                                                                        |
| 企业微信         | 微信变种                                                                                                          |
| 支付宝小程序 iot | 支付宝变种                                                                                                        |
| 飞书             | 字节                                                                                                              |
