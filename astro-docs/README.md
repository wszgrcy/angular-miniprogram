# angular-miniprogram 文档站

基于 [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) 的文档站，
替代原先基于 GitHub Pages 默认主题（Jekyll）的文档。

## 本地开发

```bash
cd astro-docs
npm install
npm run dev      # 默认 http://localhost:4321/angular-miniprogram/
```

## 构建

```bash
npm run build    # 静态构建，产物输出到仓库根的 docs/
npm run preview
```

仓库根目录也提供了透传脚本：

```bash
npm --prefix ./astro-docs run build
```

## 目录结构

```text
astro-docs/
├─ astro.config.mjs          # 站点配置：base、语言、侧边栏
└─ src/
   ├─ content/docs/
   │  ├─ zh/                  # 简体中文（默认语言）
   │  └─ en/                  # English
   └─ content.config.ts       # docs 集合的 schema
```

## 语言约定

- 中文为默认语言（`defaultLocale: 'zh'`），路径 `/zh/`。
- 英文为 fallback 语言，路径 `/en/`。
- **英文以中文为准。** 中文里标注「不支持 / 受限 / 有 bug」的内容，英文里不得写成
  可用；拿不准的宁可留 TODO，也不要写成能用。

## 写页面

在 `src/content/docs/<语言>/<分组>/xxx.md` 新建文件，frontmatter 至少给 `title`。
新页面需要在 `astro.config.mjs` 的 `sidebar` 里挂上，英文标签用 `translations.en` 给。

某语言缺文件时，Starlight 会回退到默认语言的正文，所以英文可以只翻译侧边栏与
已确认的页面，其余留空即可。
