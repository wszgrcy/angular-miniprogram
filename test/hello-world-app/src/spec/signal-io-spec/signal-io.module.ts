import { NgModule } from '@angular/core';
import { SignalIoSPecComponent } from './signal-io.component';
import { SignalIoModule } from '../../spec-component/signal-io/signal-io.module';

@NgModule({
  imports: [SignalIoModule],
  declarations: [SignalIoSPecComponent],
})
export class SignalIoSpecModule {}
