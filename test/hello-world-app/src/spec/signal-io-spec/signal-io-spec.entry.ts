import { pageStartup } from 'angular-miniprogram';
import { SignalIoSpecModule } from './signal-io.module';
import { SignalIoSPecComponent } from './signal-io.component';

pageStartup(SignalIoSpecModule, SignalIoSPecComponent);
