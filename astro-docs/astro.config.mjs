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
  redirect: {
    '/': '/zh/',
  },
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
      sidebar: [
        {
          label: '入门',
          translations: { en: 'Getting Started' },
          items: [
            nav('快速开始', 'Quick Start', '/getting-started/quick-start/'),
          ],
        },
        {
          label: '模板语法',
          translations: { en: 'Template Syntax' },
          items: [
            nav('标签映射', 'Tag Mapping', '/template/tag-mapping/'),
            nav(
              '富文本 innerHTML',
              'Rich Text innerHTML',
              '/template/rich-text/',
            ),
          ],
        },
      ],
    }),
  ],
});
