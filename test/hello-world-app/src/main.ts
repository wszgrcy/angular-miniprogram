// 模板里有 i18n / ICU，需要 @angular/localize。但**不在这里 import**：
// 官方定位它是 polyfill，由构建器按 angular.json 的 `polyfills` 注入。
// CLI 甚至对源码里直接 import '@angular/localize/init' 发警告。
import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication } from 'angular-miniprogram';

if (environment.production) {
  enableProdMode();
}

// 不再需要 MainModule：小程序没有启动组件，只建 ApplicationRef，
// 页面/组件由小程序运行时逐个创建后 attach 进来。
bootstrapApplication().catch((err) => console.error(err));
