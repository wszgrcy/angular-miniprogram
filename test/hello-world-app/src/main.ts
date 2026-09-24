import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { bootstrapApplication } from 'angular-miniprogram';

if (environment.production) {
  enableProdMode();
}

// 不再需要 MainModule：小程序没有启动组件，只建 ApplicationRef，
// 页面/组件由小程序运行时逐个创建后 attach 进来。
bootstrapApplication().catch((err) => console.error(err));
