---
title: '构建组件库'
---

组件库通过 `angular-miniprogram:library` 构建。它在 ng-packagr 之上增加了一层模板到
wxml 的编译，因此库的书写方式与普通 Angular 库**完全一致**：standalone 组件、
`public-api.ts` 出口、`ng-package.json`、二级入口均沿用原有做法。

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
的 watcher，在网络盘 / WSL 挂载场景下有用。

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

组件内不需要任何框架 API，`@Input` / `@Output` / signal / 服务均可正常使用：

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

二级入口目录需要与主 `ng-package.json` **同级**（`projects/first/secondary`），
不应放入 `src/`。ng-packagr 以主 `ng-package.json` 所在目录的相对路径为 entry
命名，放入 `src/` 会产生 `first/src/secondary` 这样的名称。

## 使用侧

库产物位于 `dist/first`，应用通过 `tsconfig.base.json` 的 `paths` 指向该目录：

```jsonc
{
  "compilerOptions": {
    "paths": {
      "first": ["./dist/first"],
      "first/secondary": ["./dist/secondary"],
    },
  },
}
```

```ts
import { FirstComponent, FirstService } from 'first';
import { SecondaryPanelComponent } from 'first/secondary';

@Component({ standalone: true, imports: [FirstComponent], template: `<lib-first [title]="t()"></lib-first>` })
export class PageComponent { … }
```

**先构建库，再构建应用。** 应用编译时读取的是 `dist/first`，库未构建则找不到模块。
建议将该顺序写入 CI / npm script：`"build": "npm run build:lib && ng build"`。

发布到 npm 时移除 `paths`，安装依赖后 `import from 'first'` 由 node_modules 解析，
用法不变。

## 产物

库组件的产物落在应用产物的 `library/` 目录下，按「库名 / 组件名」分：

```text
dist/my-mp/
├─ library/first/first-component/first-component.{js,wxml,wxss,json}
├─ library/first/secondary/secondary-panel-component/secondary-panel-component.*
└─ library-template/First.wxml     # 库的具名模板（跨库传递模板时使用）
```

`usingComponents` 由构建器计算，无需手写路径。

## 库内传递模板

库组件接收外部 `TemplateRef` 时，模板名需要带库作用域前缀 `$$mp$$<ScopeName>$$xxx`。
`ScopeName` 由库名推导：`test-library` → `TestLibrary`，`@my/library` → `MyLibrary`。
详见 [ng-template 与 TemplateRef](../../template/template-ref/)。

## 库内组件不能被原生页面引用

库编译产出的是 Angular 组件的小程序产物，回连 Angular 侧依赖父模板传入
`nodePath` / `nodeIndex` 两个 property。脱离 Angular 页面后没有来源传入这两个值，
组件会渲染为空容器且不报错。**将库内组件提供给原生小程序页面使用的方式不成立。**
