点击这里进入聊天室->[![Gitter](https://badges.gitter.im/angular-miniprogram/community.svg)](https://gitter.im/angular-miniprogram/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# `Angular`开发小程序

- 通过修改`Angular`实现使用`Angular`开发小程序
- 修改的思路为尽可能使用`Angular`开发环境,做适配而不是仿`Angular`语法

## 开发模板

- [https://github.com/wszgrcy/angular-miniprogram-template](https://github.com/wszgrcy/angular-miniprogram-template)

## 实现内容

### Angular 支持程度

| 功能                         | 实现程度                                                                                        | 未实现内容                                                                                                                                    | 备注                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 变更检测                     | 事件/setTimeout/setInterval/Promise                                                             |                                                                                                                                               | web 上可能产生变更的方法已经都 hook 了,如果还有小程序平台可能产生变更检测的操作,可以再添加                                                                                     |
| 组件                         | 几乎所有                                                                                        | 小程序的原生组件需要设置`schemas:[NO_ERRORS_SCHEMA]`                                                                                          |
| 组件 style                   | 几乎原生                                                                                        | styles 内联属性不可使用,                                                                                                                      | 未测试全局样式与组件样式等共同作用的影响                                                                                                                                       |
| Input                        | 等同原生                                                                                        |                                                                                                                                               |
| Output                       | 等同原生                                                                                        |
| HostBinding                  | 等同原生                                                                                        |
| HostListener                 | 等同原生                                                                                        | bind:xxx 无法使用原因为 ng 将此解构解析为`目标(window/document等):方法`,所以如果设置为`xxx`则编译时为`bind:xxx`,可以使用 bindxxx 这种方式代替 |
| ViewChild/ViewChildren       | 几乎原生                                                                                        | 查询的节点为代理节点,不可当做引用插入                                                                                                         |
| ContentChild/ContentChildren | 几乎原生                                                                                        | 查询的节点为代理节点,不可当做引用插入                                                                                                         |
| TemplateRef                  | 有限引用,自定义结构型指令下,可以在组件内随便显示                                                | 全局引用                                                                                                                                      |
| 管道                         | 等同原生                                                                                        |
| 服务                         | 等同原生                                                                                        |
| ng-content                   | 几乎原生,未全面测试                                                                             |
| 属性型指令                   | 等同原生                                                                                        |
| 结构型指令                   | 有限引用,插入时需在上下文中提供引用名(`createEmbeddedView(模板引用, {__templateName: 模板名})`) | 全局上下文中引用                                                                                                                              |
| forms                        | 类原生                                                                                          |                                                                                                                                               | 重写部分源码,实现小程序的一些双向绑定,移除不能使用的双向绑定指令,使用`angular-miniprogram/forms`与`@angular/forms`完全一致,未来也将适配                                        |
| library                      | 等同原生                                                                                        |                                                                                                                                               | 编译的组件库可以在 web 上使用,反之不行                                                                                                                                         |
| common                       | 类原生                                                                                          |                                                                                                                                               | 同 forms,`angular-miniprogram/common`代替`@angular/common`                                                                                                                     |
| http                         | 支持                                                                                            |                                                                                                                                               | 感谢`@HyperLife1119`提供,未测试,使用`angular-miniprogram`引用`WxHttpBackend,{provide: HttpBackend, useExisting: WxHttpBackend}`.可以先自行添加或等未来加入到默认的 module 集成 |
| i18n                         |                                                                                                 | 不支持                                                                                                                                        | 众所周知,国内使用 i18n 的并不多,使用 ng 内置的 i18n 功能就更少了,目前内置的 i18n 并不支持,但是可以用第三方支持                                                                 |
| 单元测试                     |                                                                                                 | 不支持                                                                                                                                        | 同理,目前来说单元测试比 i18n 重要些,但是由于平台的不开放性,所以如果支持需要自己模拟一个环境,但是这个也不影响开发                                                               |
| 动画                         |                                                                                                 | 不支持                                                                                                                                        | 这部分没有仔细研究,但是也有 css 可以稍微代替下,优先级也不高                                                                                                                    |
| 路由                         |                                                                                                 | 不支持                                                                                                                                        | 没有多级路由,实现起来比较鸡肋                                                                                                                                                  |

### 小程序支持程度

- 通过`ComponentFinderService`服务来查询当前 ng 组件实例对应的小程序足迹
- 通过`APP_TOKEN`可以获得 App 实例
- 通过`PAGE_TOKEN`可以获得组件对应的小程序页面实例
- `pageStartup`函数作为 page 的启动入口,可以传入相关选项来定义一些小程序的参数
- `componentRegistry`组件注册,可以传入相关选项来定义一些小程序的参数(library 的组件不需要这个方法.)

### 平台

| 平台名           | 注释                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| 微信             | 已实现                                                                                                    |
| 字节跳动         | 已实现                                                                                                    |
| 京东             | 传家宝                                                                                                    |
| 百度智能         | 已实现,slot 有问题,通病,尝试全解决后去掉 template 测试                                                    |
| 支付宝           | 不能使用 2 编译,不能使用 Prod,问题[参见](https://forum.alipay.com/mini-app/post/65101060),slot 可能有部分 |
| qq 小程序        | 已实现,但是事件有未知报错?但是好像也不影响                                                                |
| 钉钉小程序       | 支付宝变种                                                                                                |
| 企业微信         | 和普通的一样? 微信?                                                                                       |
| 支付宝小程序 iot | 一样? 支付宝?                                                                                             |
| 飞书             | 就是字节                                                                                                  |
