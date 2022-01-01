import { pageStartup } from 'angular-miniprogram';
import { BaseHttpComponent } from './base-http.component';
import { BaseHttpModule } from './base-http.module';

pageStartup(BaseHttpModule, BaseHttpComponent);
