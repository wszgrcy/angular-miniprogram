import { Directive, OnInit, input, output } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[libInputOutput]',
})
export class InputOutputDirective implements OnInit {
  /** signal input，替代 @Input() */
  input1 = input<string>('');
  input2 = input<number>(0);
  /** signal output，替代 @Output() + EventEmitter */
  output1 = output<string>();
  output2 = output<number>();

  ngOnInit(): void {
    // 把收到的输入回抛出去，便于验证 signal output 链路
    this.output1.emit(this.input1());
    this.output2.emit(this.input2());
  }
}
