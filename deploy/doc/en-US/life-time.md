---
layout: post
title: Life Time
---
# Component(Component)

- created
  > Wait for link (miniprogram component is associated with ng component)
- properties Change(first)
  > link(init with ng auto)
- attached
- ready

# Page(Page)

- onLoad
  > init and link
- onShow(first)
- onReady

# Page(Component)

- onLoad
- onShow(first)
- created
  > init
- attached
  > link
- onReady

# Component(Component) in Page(Page)


- ng-constructor(onLoad start)
> ng page Component
> init and link
- ng-constructor(component)
> ng component Component
- ng-ngOnInit
- ng-ngAfterContentInit
- ng-ngOnInit(component)
- ng-ngAfterContentInit(component)
- ng-ngAfterViewInit(component)
- ng-ngAfterViewInit
- mp-created(component)
- mp-attached(component)
> sub component link(after created ,before created)
- mp-onLoad(onLoad end)
- mp-onShow
- mp-onReady
- mp-ready(component)
