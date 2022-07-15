import { pageStartup } from 'angular-miniprogram';
import { LifeTimePageModule } from './life-time.module';
import { LifeTimePage } from './life-time.component';
pageStartup(LifeTimePageModule, LifeTimePage, { useComponent: true });
