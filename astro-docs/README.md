# astro-docs

Angular 小程序的文档站点，基于 [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)。

当前只是一个可跑通的最小骨架：中文文档先行，英文目录先占位，后续按页面补齐。

## 目录结构

```
astro-docs/
├─ astro.config.mjs              # Starlight 配置：双语 locale + 侧边栏
├─ src/
│  ├─ content.config.ts          # 内容集合（docs / i18n）
│  └─ content/
│     ├─ docs/
│     │  ├─ zh/                  # 中文文档（默认语言）
│     │  └─ en/                  # 英文文档（占位，待补）
│     └─ i18n/
│        └─ zh-CN.json           # 界面文案覆盖
```

## 语言约定

- 默认语言 `zh`，URL 前缀 `/zh/`；英文在 `/en/`。
- 侧边栏只写一份：`label` 用中文，英文通过 `translations: { en }` 提供。
- 新增页面时，`zh/` 与 `en/` 下**同名同路径**各放一份，英文暂时只写一句占位。

## 命令

```bash
npm install         # 在本目录安装
npm run dev         # 开发服务器，http://localhost:4321/angular-miniprogram/
npm run build       # 静态构建，产物在 ./dist
npm run preview     # 预览构建产物
```

仓库根目录也挂了快捷命令：`npm run docs:dev` / `npm run docs:build`。

## 在受限环境里构建

Astro 7 的模板编译器是 NAPI 原生模块（`@astrojs/compiler-binding-linux-x64-gnu`）。
个别沙箱里加载它会直接 `Bus error (core dumped)`。这种情况下改用 WASI 版：

```bash
npm i @astrojs/compiler-binding-wasm32-wasi --force --no-save
```

然后把 `node_modules/@astrojs/compiler-binding/index.js` 里的
`nativeBinding = requireNative()` 改成
`nativeBinding = require('@astrojs/compiler-binding-wasm32-wasi')`。

`node_modules` 不入库，所以这个改动只影响本机。
