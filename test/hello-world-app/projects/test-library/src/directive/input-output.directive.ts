import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[libInputOutput]',
})
export class InputOutputDirective {
  @Input() input1: string;
  @Input() input2: number;
  @Output() output1 = new EventEmitter();
  @Output() output2 = new EventEmitter();
}
