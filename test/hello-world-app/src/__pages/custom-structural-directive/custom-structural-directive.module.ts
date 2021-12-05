import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomStructuralDirectiveComponent } from './custom-structural-directive.component';
import { Structural1Directive } from './structural1.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [CustomStructuralDirectiveComponent, Structural1Directive],
})
export class CustomStructuralDirectiveModule {}
