// 自定义 Starlight i18n 键的类型声明，键名需与 src/content/i18n/*.json 保持一致。
import '@astrojs/starlight';

declare global {
  namespace StarlightApp {
    interface I18n {
      'docCopy.idle': string;
      'docCopy.done': string;
      'docCopy.failed': string;
    }
  }
}

export {};
