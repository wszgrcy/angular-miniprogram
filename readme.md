点击这里进入聊天室->[![Gitter](https://badges.gitter.im/angular-miniprogram/community.svg)](https://gitter.im/angular-miniprogram/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# `Angular`开发小程序(正式发布)

- 通过修改`Angular`实现使用`Angular`开发小程序
- 修改的思路为尽可能使用`Angular`开发环境,做适配而不是仿`Angular`语法

## 开发模板

- [https://github.com/wszgrcy/angular-miniprogram-template](https://github.com/wszgrcy/angular-miniprogram-template)

## 支持程度

- 由于绝大部分内容已经做到原生级别的支持,这里只列出极少部分与 Angular web 平台有区别的地方
- 如果没有提及限制,则默认可用

### Angular 限制

- 一切 dom 行为皆禁止
- 小程序的原生组件需要设置 schemas:[NO_ERRORS_SCHEMA],规避检测
- 带前缀的事件,如`bind`,`mut-bind`等,去掉冒号直接写,如事件`bind:tap`=>`bindtap`
  > `:`在 ng 中为分割命名空间(`(window/document等)`)使用
- 元素属性赋值操作可能无法响应变更检测,使用`detectChanges`即可
- 使用`angular-miniprogram/common`代替`@angular/common`,
- 使用`angular-miniprogram/forms`代替`@angular/forms`
- 使用`import { HttpClientModule } from 'angular-miniprogram';`代替`import { HttpClientModule } from '@angular/common/http'`

#### 模板

#### 模板使用

- `createEmbeddedView`方法只能在结构型指令,或非结构型指令但是为模板引用`TemplateRef`实例中使用
- 当使用`createEmbeddedView`进行插入时,需要在上下文中的对象传递`__templateName`属性,这个属性为小程序的实际对应模板名
- 此模板名可以访问`TemplateRef`实例的私有变量获得`(this.templateRef as any)._declarationTContainer.localNames[0]`

##### 模板重命名

- 模板会在编译时编译为静态模板,所以可能存在重命名的情况,`如果`存在这种情况,可以使用多模板引用变量的方式实现
- `<ng-template #name1 #name2></ng-template>` `#name2`为可能重复的那个命名,`#name1`为编译到模板中的名字
- 第一个命名始终为模板的真实命名,但是所有的`模板引用变量`都可以引用

##### 跨组件调用模板

- 在同一项目下,让其他组件接收到模板时,模板名定义需为`$$mp$$__self$$xxx`,这样就可以在同一项目下传递
  > `同一app`或`同一library`下,都叫同一项目
- 当 library 的组件需要一个模板的时候,需要将模板名定义为`$$mp$$当前library名字转换$$xxx`
  > `当前library名字转换`为大驼峰+去掉@/后的名字,如`test-library`库为`TestLibrary`,`@my/library`库为`MyLibrary`
- 设计原因是为了防止全局引用一个模板,造成模板文件臃肿.不过即使这样也建议减少模板传递.因为 self 与 library 的模板传递会强行在当前域内的所有组件中引用(即使这个组件并没有使用)

### 小程序支持程度

- 通过`ComponentFinderService`服务来查询当前 ng 组件实例对应的小程序组件
- 通过`APP_TOKEN`可以获得 App 实例
- 通过`PAGE_TOKEN`可以获得组件对应的小程序页面实例
- `pageStartup`函数作为 page 的启动入口
- `componentRegistry`组件注册
- ` static mpComponentOptions``静态变量 `为`使用`组件时,进行配置传参
- 在`Angular`@Component 组件中添加`static mpPageOptions`进行配置传参,与`Page({})`等同
  > 当使用`pageStartup`函数时,使用此方法
- 在`Angular`@Component 组件中添加`static mpComponentOptions`进行配置传参,与`Component({})`等同
  > 当使用`componentRegistry`函数时或使用`pageStartup`函数,但是 options 为`{useComponent:true}`,使用此方法
- `miniProgramPlatform`为一个 string 类型的全局变量,指示当前小程序的运行平台(`wx`,`zfb`,`zj`,`bdzn`,`qq`,`dd`等)

### 平台

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
