import { pageStartup } from 'angular-miniprogram';

import { NgContentComponent } from './ng-content.component';
import { NgContentModule } from './ng-content.module';

pageStartup(NgContentModule, NgContentComponent);
