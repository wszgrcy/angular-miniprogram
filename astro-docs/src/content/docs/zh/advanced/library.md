---
title: '构建组件库'
---

组件库用 `angular-miniprogram:library` 构建。它就是 ng-packagr 加上「把模板也
编译成 wxml」这一层，所以库的写法跟普通 Angular 库**完全一样**：standalone 组件、
`public-api.ts` 出口、`ng-package.json`、二级入口，全照旧。

## 配置

```jsonc
// angular.json
"first": {
  "projectType": "library",
  "root": "projects/first",
  "architect": {
    "build": {
      "builder": "angular-miniprogram:library",
      "options": { "project": "projects/first/ng-package.json" },
      "configurations": {
        "production": { "tsConfig": "projects/first/tsconfig.lib.prod.json" },
        "development": { "tsConfig": "projects/first/tsconfig.lib.json" }
      },
      "defaultConfiguration": "production"
    }
  }
}
```

选项只有 `project`（必填）、`tsConfig`、`watch`、`poll`。`poll` 透传给 ng-packagr
的 watcher，网络盘 / WSL 挂载上有用。

## 库的写法

```text
projects/first/
├─ ng-package.json            # { "lib": { "entryFile": "src/public-api.ts" }, "dest": "../../dist/first" }
├─ package.json               # name: "first"
├─ src/
│  ├─ public-api.ts
│  └─ lib/first/first.component.ts
└─ secondary/                 # 二级入口，与 src 同级
   ├─ ng-package.json         # { "lib": { "entryFile": "./index.ts" } }
   └─ index.ts
```

组件里不需要任何框架 API，`@Input` / `@Output` / signal / 服务都照常用：

```ts
@Component({
  selector: 'lib-first',
  standalone: true,
  template: `<div class="lib-first">{{ title }} · {{ count() }}</div>`,
  styleUrls: ['./first.component.scss'],
})
export class FirstComponent {
  @Input() title = '';
  @Output() changed = new EventEmitter<number>();
  readonly count = signal(0);
}
```

### 二级入口的目录位置

二级入口目录要跟主 `ng-package.json` **同级**（`projects/first/secondary`），
不要放进 `src/`。ng-packagr 按「主 `ng-package.json` 所在目录的相对路径」给
entry 命名，放 `src/` 里会产成 `first/src/secondary` 这种名字。

## 使用侧

库产物在 `dist/first`，应用通过 `tsconfig.base.json` 的 `paths` 指过去：

```jsonc
{
  "compilerOptions": {
    "paths": {
      "first": ["./dist/first"],
      "first/secondary": ["./dist/secondary"]
    }
  }
}
```

```ts
import { FirstComponent, FirstService } from 'first';
import { SecondaryPanelComponent } from 'first/secondary';

@Component({ standalone: true, imports: [FirstComponent], template: `<lib-first [title]="t()"></lib-first>` })
export class PageComponent { … }
```

**先构建库，再构建应用。** 应用编译时读的是 `dist/first`，库没构建就找不到模块。
把这条排进 CI / npm script：`"build": "npm run build:lib && ng build"`。

发布到 npm 就把 `paths` 去掉，装包后 `import from 'first'` 走 node_modules，
用法不变。

## 产物

库组件的产物落在应用产物的 `library/` 目录下，按「库名 / 组件名」分：

```text
dist/my-mp/
├─ library/first/first-component/first-component.{js,wxml,wxss,json}
├─ library/first/secondary/secondary-panel-component/secondary-panel-component.*
└─ library-template/First.wxml     # 库的具名模板（跨库传模板时才用得到）
```

`usingComponents` 由构建器算，你不用写路径。

## 库里传模板

库组件接收外部 `TemplateRef` 时，模板名要带库作用域前缀 `$$mp$$<ScopeName>$$xxx`。
`ScopeName` 由库名算：`test-library` → `TestLibrary`，`@my/library` → `MyLibrary`。
详见 [ng-template 与 TemplateRef](../../template/template-ref/)。

## 库里的组件不能被原生页面引用

库编译出来的是 Angular 组件的小程序产物，回连 Angular 侧靠父模板传
`nodePath` / `nodeIndex` 两个 property。脱离 Angular 页面就没有人传这两个值，
组件会渲染成一个空盒子且不报错。**「把库里的组件给原生小程序页面用」这条路不成立。**
