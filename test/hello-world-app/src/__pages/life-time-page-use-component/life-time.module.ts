import { NgModule } from '@angular/core';
import { CommonModule } from 'angular-miniprogram/common';
import { LifeTimeComponent } from '../../__components/life-time/life-time.component';
import { LifeTimePage } from './life-time.component';

@NgModule({
  imports: [CommonModule, LifeTimeComponent],
  declarations: [LifeTimePage],
})
export class LifeTimePageModule {}
