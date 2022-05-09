import { pageStartup } from 'angular-miniprogram';
import { HttpSpecModule } from './http.module';
import { HttpSpecComponent } from './http.component';

pageStartup(HttpSpecModule, HttpSpecComponent);
