---
layout: post
title: 小程序特性
---
## 服务

- 通过`ComponentFinderService`服务来查询当前 ng 组件实例对应的小程序组件


```ts  
import { ComponentFinderService } from 'angular-miniprogram';
//...  
{
  constructor(private componentFinderService: ComponentFinderService) {}
} 
```
## token

- 通过`APP_TOKEN`可以获得 App 实例
- 通过`PAGE_TOKEN`可以获得组件对应的小程序页面实例

```ts  
import {
  APP_TOKEN,
  PAGE_TOKEN,
} from 'angular-miniprogram';
//...  
{
    constructor(
    @Inject(APP_TOKEN) appInstance: any,
    @Inject(PAGE_TOKEN) pageInstance: any
  ) {}
} 
```
## api

- `pageStartup`函数作为 page 的启动入口

```ts
import { pageStartup } from 'angular-miniprogram';
//...
pageStartup(Page1Module, Page1Component);
```
- `componentRegistry`组件注册

```ts
import { componentRegistry } from 'angular-miniprogram';
//...
componentRegistry(Component1Component);

```
## 组件上静态属性

- 在`Angular`@Component 组件中添加`static mpPageOptions`进行配置传参,与`Page({})`等同
  > 当使用`pageStartup`函数时,使用此方法

```ts
@Component({
  selector: 'app-life-time',
  templateUrl: './life-time.component.html',
})
export class LifeTimePage implements OnInit {
  static mpPageOptions: WechatMiniprogram.Page.Options<{}, {}> = {
    onLoad: function (this: MiniProgramComponentInstance) {
      console.log('mp-onLoad', this.__ngComponentInstance);
    },
    onShow: function () {
      console.log('mp-onShow', this.__ngComponentInstance);
    },
    onReady: function (
      this: WechatMiniprogram.Page.Instance<{}, {}> &
        MiniProgramComponentInstance<LifeTimePage>
    ) {
      console.log('mp-onReady');
    },
  };
//...
}
```
- 在`Angular`@Component 组件中添加`static mpComponentOptions`进行配置传参,与`Component({})`等同
  > 当使用`componentRegistry`函数时或使用`pageStartup`函数,但是 options 为`{useComponent:true}`,使用此方法

```ts
@Component({
  selector: 'app-life-time-component',
  templateUrl: './life-time.component.html',
  standalone: true,
})
export class LifeTimeComponent implements OnInit {
  static mpComponentOptions: WechatMiniprogram.Component.Options<{}, {}, {}> = {
    lifetimes: {
      created: function (this: MiniProgramComponentInstance) {
        console.log('created(component)');
      },
      attached: function () {
        console.log('attached(component)');
      },
      ready: function () {
        console.log('ready(component)');
      },
      moved: function () {
        console.log('moved(component)');
      },
      detached: function () {
        console.log('detached(component)');
      },
      error: function () {
        console.log('error(component)');
      },
    },
    pageLifetimes: {
      show: function () {
        console.log('page-show(component)');
      },
      hide: function () {
        console.log('page-hide(component)');
      },
      resize: function () {
        console.log('page-resize(component)');
      },
    },
  };
//...
}
```

## 全局变量

- `miniProgramPlatform`为一个 string 类型的全局变量,指示当前小程序的运行平台(`wx`,`zfb`,`zj`,`bdzn`,`qq`,`dd`等)
