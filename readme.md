[![Gitter](https://badges.gitter.im/angular-miniprogram/community.svg)](https://gitter.im/angular-miniprogram/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# `Angular`开发小程序

- 通过修改`Angular`实现使用`Angular`开发小程序
- 本项目实现的目的很简单也很纯粹,就是告诉大家.框架无高低,使用的人,有高低

## 视频简介

- [https://www.bilibili.com/video/BV1wh411p7bB/](https://www.bilibili.com/video/BV1wh411p7bB/)

## 开发模板

- [https://github.com/wszgrcy/angular-miniprogram-template](https://github.com/wszgrcy/angular-miniprogram-template)

## 修改内容

- builder
  > 修改用于支持自定义构建
- component 编译时
  > 通过提前解析获得模板与样式,转换为小程序所需的
- 全局变量
  > 用来支持`ngZone`与`Angular`默认全局引用
- platform
  > 通过实现自定义的 platform,给予小程序的启动上下文支持
- renderFactory
  > 原渲染工厂支持的是 dom 渲染,但是小程序不需要
- 主出口重建
  > 主出口预先加载相关依赖,为后面的 page 做准备
- 文件系统监听修改
  > 需要在预处理结束时,清除文件缓存

## 增加内容

- 组件与页面的注册函数
  > 只有被注册,还会自动的查询依赖关系与生成
  > 组件目前改为仅注册,生成由 ng 默认逻辑自动实现
- 相关生命周期的传递
  > 小程序自带的一些生命周期
- 小程序相关 token.
  > `APP_TOKEN`可以获得 App 实例
  > `PAGE_TOKEN`可以获得组件对应的小程序页面实例

## 已实现内容

- 变更检测
- Input,Output
- 依赖注入
- ng-content
- ngIf,ngSwitch,ngFor
  > 对于其他指令及自定义指令,暂未实现
- 小程序大部分功能
- 管道
- 属性型指令
  > 属性型指令目前只支持源码开发,也就是你自己写的,不支持第三方库...比如`@angular/forms`
- 自定义表单组件
  > 从逻辑上是支持的,但是我没有测试......
  > 表单指令和自定义表单组件看起来像一个东西,实际上是两个
- library
  > 组件与指令的编写与 web 基本一致
- 组件 style
  > 由于升级到 ng13 某些内部包不能被直接使用,所以现在仅支持 styleUrls 里面的样式进行编译,不要使用内联的 styles
  > 未来有空可能会找其他方法实现,但是由于这个不是太严重,所以优先级不高

## 未实现

### 可实现的功能

- http
- ~~管道~~
- ~~非结构型指令~~
- 结构型指令的非引用传递或有限传递
- 路由的部分实现
  > 路由是否实现主要看小程序的使用场景需不需要路由这个东西
- 表单
- ~~自定义组件~~

### 不可能实现的功能

- 无限制的结构型指令
  > 除非模板运行动态按需加载

### 其他平台的支持

- 目前功能尚未完善,不对多余的平台做支持
- 目前仅支持微信小程序,但是未来重构完善后,会添加其他平台的小程序支持

## 准备做的

### component 的 template 重写(已实现)

- 之前是通过完全重写实现的值绑定与更新,但是是因为有一个技术没法实现所以才采取点方案.
- 目前已经可以通过替换调用函数实现这个,所以重新 template
- 重写后将会使`管道`,`表单`,`非结构型指令`的支持
