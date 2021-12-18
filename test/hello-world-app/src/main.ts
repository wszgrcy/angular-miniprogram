import { enableProdMode } from '@angular/core';

import { MainModule } from './main.module';
import { environment } from './environments/environment';
import { platformMiniProgram } from 'angular-miniprogram';
import 'zone.js';
if (environment.production) {
  enableProdMode();
}

platformMiniProgram()
  .bootstrapModule(MainModule)
  .then((e) => {
    console.log(e);
  });
