<h1 align="center">angular-miniprogram - Develop MiniProgram using Angular </h1>

<p align="center"> Use Angular Ecosystem as possible, 
reduce cross-platform costs</p>

<p align="center">
  <a href="https://gitter.im/angular-miniprogram/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge">
    <img src="https://badges.gitter.im/angular-miniprogram/community.svg" alt="gitter" />
  </a>&nbsp;
    <a href="https://www.npmjs.com/package/angular-miniprogram">
    <img src="https://img.shields.io/npm/v/angular-miniprogram.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="angular-miniprogram on npm" />
  </a>&nbsp;
    <a href="https://wszgrcy.github.io/angular-miniprogram/coverage/index.html">
    <img src="https://wszgrcy.github.io/angular-miniprogram/badge.svg" alt="coverage" />
  </a>

</p>

English | [简体中文](readme.md)

<hr>

## document

- [Quickstart](https://github.com/wszgrcy/angular-miniprogram/blob/master/quick-start-en.md)
- [Attention](https://github.com/wszgrcy/angular-miniprogram/blob/master/attention-en.md)
- [MiniProgramFeature](https://github.com/wszgrcy/angular-miniprogram/blob/master/miniprogram-feature-en.md)
- [API](https://wszgrcy.github.io/angular-miniprogram)

## Development Environment

### Prerequisites

- `Node.js` greater than 14
- `@angular/cli` 13
- `yarn`

### hello-world

- use this Template [https://github.com/wszgrcy/angular-miniprogram-template](https://github.com/wszgrcy/angular-miniprogram-template) or download
- use `yarn` install dependencies

### Quickstart

- [Quickstart](https://github.com/wszgrcy/angular-miniprogram/blob/master/quick-start.md)

## Ecosystem

- support all `Pipe` and `Service`
- compatible support `Directive`(a little different from web)
- one file only allow one `Component`

## Support Platform

| Platform Name | Run | Alias                   | comment                                                                                                                   |
| ------------- | --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Wechat        | ✅  | Work Wechat             |                                                                                                                           |
| bytedance     | ✅  |                         |                                                                                                                           |
| jd            | ❌  |                         | no account                                                                                                                |
| baidu         | ✅  |                         |                                                                                                                           |
| Alipay        | ✅  | DingTalk,Alipay IoT,etc | can't compile in Prod, [see](https://forum.alipay.com/mini-app/post/65101060);can't use v2, while `slot` has some problem |
| qq            | ✅  |                         | unknown error?but can work                                                                                                |
| feishu        | ❌  |                         | like`bytedance`,but compile fail                                                                                          |
