## 服务

- 通过`ComponentFinderService`服务来查询当前 ng 组件实例对应的小程序组件

## token

- 通过`APP_TOKEN`可以获得 App 实例
- 通过`PAGE_TOKEN`可以获得组件对应的小程序页面实例

## api

- `pageStartup`函数作为 page 的启动入口
- `componentRegistry`组件注册

## 组件上静态属性

- 在`Angular`@Component 组件中添加`static mpPageOptions`进行配置传参,与`Page({})`等同
  > 当使用`pageStartup`函数时,使用此方法
- 在`Angular`@Component 组件中添加`static mpComponentOptions`进行配置传参,与`Component({})`等同
  > 当使用`componentRegistry`函数时或使用`pageStartup`函数,但是 options 为`{useComponent:true}`,使用此方法

## 全局变量

- `miniProgramPlatform`为一个 string 类型的全局变量,指示当前小程序的运行平台(`wx`,`zfb`,`zj`,`bdzn`,`qq`,`dd`等)
