---
layout: post
title: Quick Start
---
## set Page pattern

- Set output Page pattern in `angular.json`, same with `assets` field

```json
"pages": [
  {
    "glob": "**/*.entry.ts",
    "input": "./src/pages",
    "output": "pages"
  }
]
```

- This config is, in `src/pages` dir match `*.entry.ts` file, and output in`[outputDir]/pages` Dir

## add a Page

- Create code with the following structure

```tree
├── page1.component.html
├── page1.component.scss
├── page1.component.ts
├── page1.entry.json
├── page1.entry.ts
└── page1.module.ts
```

- Create a `page1.entry.ts` file, add code as follow

```ts
import { pageStartup } from 'angular-miniprogram';
import { Page1Component } from './page1.component';
import { Page1Module } from './page1.module';

pageStartup(Page1Module, Page1Component);
```

## set Component pattern

- Set output Component pattern in `angular.json`, same with `assets` field

```json
"components":[
         {
           "glob": "**/*.entry.ts",
           "input": "./src/components",
           "output": "components"
         }
       ]
```

## add a Component

- Create code with the following structure

```tree
├── component1.component.html
├── component1.component.scss
├── component1.component.ts
├── component1.entry.json
├── component1.entry.ts
└── component1.module.ts
```

- Create a `component1.entry.ts` file, add code as follow

```ts
import { componentRegistry } from 'angular-miniprogram';
import { Component1Component } from './component1.component';

componentRegistry(Component1Component);
```

- This code is registry Component as a miniprogram Component
- because of auto init, so use `Registry`
