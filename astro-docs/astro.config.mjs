import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// 侧边栏标签：中文为 label，英文通过 translations 提供。
// link 不带语言前缀，Starlight 会按当前语言自动补 zh/ 或 en/。
const nav = (zh, en, link) => ({
  label: zh,
  translations: { en },
  link,
});

export default defineConfig({
  site: 'https://wszgrcy.github.io/angular-miniprogram/',
  base: '/angular-miniprogram/',
  outDir: '../docs',
  deleteOutDir: true,
  integrations: [
    starlight({
      title: {
        'zh-CN': 'Angular 小程序 文档',
        en: 'Angular Miniprogram Docs',
      },
      defaultLocale: 'zh',
      locales: {
        zh: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      components: {
        PageTitle: './src/overrides/starlight/PageTitle.astro',
      },
      sidebar: [
        {
          label: '入门',
          translations: { en: 'Getting Started' },
          items: [
            nav('快速开始', 'Quick Start', '/getting-started/quick-start/'),
            nav(
              '工程结构与产物',
              'Project Layout',
              '/getting-started/project-structure/',
            ),
            nav(
              '变更检测与状态',
              'Change Detection',
              '/getting-started/change-detection/',
            ),
            nav(
              '不支持与受限的能力',
              'Limitations',
              '/getting-started/limitations/',
            ),
          ],
        },
        {
          label: '构建配置',
          translations: { en: 'Build' },
          items: [
            nav('构建选项', 'Build Options', '/guide/build-options/'),
            nav('入口：页面 / 组件 / tabBar', 'Entries', '/guide/entry/'),
            nav(
              '配置文件：app.json / project 配置',
              'Config Files',
              '/guide/mp-config/',
            ),
            nav('多平台与条件编译', 'Platforms', '/guide/platforms/'),
            nav(
              '使用原生自定义组件',
              'Native Components',
              '/guide/native-components/',
            ),
            nav('样式', 'Styles', '/guide/styles/'),
            nav(
              '自定义 vite 配置',
              'Custom Vite Config',
              '/guide/custom-vite-config/',
            ),
            nav(
              '构建选项迁移',
              'Builder Options Migration',
              '/guide/migration-builder-options/',
            ),
          ],
        },
        {
          label: '模板语法',
          translations: { en: 'Template' },
          items: [
            nav('标签映射', 'Tag Mapping', '/template/tag-mapping/'),
            nav('事件修饰符', 'Event Modifiers', '/template/event/'),
            nav(
              '内容投影',
              'Content Projection',
              '/template/content-projection/',
            ),
            nav(
              'ng-template 与 TemplateRef',
              'Templates & TemplateRef',
              '/template/template-ref/',
            ),
            nav(
              '富文本 innerHTML',
              'Rich Text innerHTML',
              '/template/rich-text/',
            ),
            nav('WXS 渲染层脚本', 'WXS', '/template/wxs/'),
          ],
        },
        {
          label: '运行时',
          translations: { en: 'Runtime' },
          items: [
            nav('启动与依赖注入', 'Bootstrap & DI', '/runtime/bootstrap/'),
            nav('生命周期', 'Lifecycle', '/runtime/lifecycle/'),
            nav(
              '原生配置：mpComponentOptions',
              'Native Component Options',
              '/runtime/native-options/',
            ),
            nav('节点查询', 'Node Query', '/runtime/node-query/'),
            nav('小程序 API', 'Mini Program API', '/runtime/mp-api/'),
            nav('HTTP 请求', 'HTTP', '/runtime/http/'),
            nav('表单', 'Forms', '/runtime/forms/'),
            nav('多语言', 'i18n', '/runtime/i18n/'),
          ],
        },
        {
          label: '组件库与测试',
          translations: { en: 'Library & Testing' },
          items: [
            nav('构建组件库', 'Build a Library', '/advanced/library/'),
            nav('在小程序里跑测试', 'Testing', '/advanced/testing/'),
          ],
        },
      ],
    }),
  ],
});
