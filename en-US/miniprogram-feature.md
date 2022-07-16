---
layout: post
title: Miniprogram Feature
---
## Service

- `ComponentFinderService`: get MiniProgram Component corresponding to Angular Component


```ts  
import { ComponentFinderService } from 'angular-miniprogram';
//...  
{
  constructor(private componentFinderService: ComponentFinderService) {}
} 
```
## token

- `APP_TOKEN`: get App instance
- `PAGE_TOKEN`: get MiniProgram Page corresponding to Angular Component


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

- `pageStartup`: page entry

```ts
import { pageStartup } from 'angular-miniprogram';
//...
pageStartup(Page1Module, Page1Component);
```
- `componentRegistry`: component registry

```ts
import { componentRegistry } from 'angular-miniprogram';
//...
componentRegistry(Component1Component);

```
## Static property on @Component

- `static mpPageOptions`: like `Page(mpPageOptions)`
  > use when Component as a Page

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

- `static mpComponentOptions`: like `Component(mpComponentOptions)`
  > use when Component as a Component or a Page but `pageStartup` with `{useComponent:true}`

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

## Global Variable

- `miniProgramPlatform`: string, hint miniprogram platform(`wx`,`zfb`,`zj`,`bdzn`,`qq`,`dd`,etc)
