---
layout: post
title: 生命周期
---
# 组件(Component)

- created
  > 等待链接(小程序 Component 与 ng Component 关联)
- properties 变更(第一次)
  > 链接(ng自动初始化)
- attached
- ready

# 页面(Page)

- onLoad
  > 初始化并链接
- onShow(第一次)
- onReady

# 页面(Component)

- onLoad
- onShow(第一次)
- created
  > 初始化
- attached
  > 链接
- onReady


# 组件(Component)在页面(Page)中

- ng-constructor(onLoad 开始)
> 页面组件
> 初始化并链接
- ng-constructor(component)
> 子组件
- ng-ngOnInit
- ng-ngAfterContentInit
- ng-ngOnInit(component)
- ng-ngAfterContentInit(component)
- ng-ngAfterViewInit(component)
- ng-ngAfterViewInit
- mp-created(component)
> 子组件链接(created之后,attached之前)
- mp-attached(component)
- mp-onLoad(onLoad 末尾)
- mp-onShow
- mp-onReady
- mp-ready(component)
