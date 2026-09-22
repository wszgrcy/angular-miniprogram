import { Component, OnInit, computed, input, output } from '@angular/core';

/**
 * 使用 signal input / signal output 的基础组件，
 * 用于验证 signal 形式的输入输出在小程序渲染链路下工作正常。
 */
@Component({
  standalone: false,
  selector: 'app-signal-io',
  template: `<div class="signal-io-content">
    {{ input1() }}-{{ doubled() }}
  </div>`,
})
export class SignalIoComponent implements OnInit {
  /** signal input，替代 `@Input() input1: string` */
  input1 = input<string>('');
  /** signal output，替代 `@Output() emitted = new EventEmitter<string>()` */
  emitted = output<string>();

  doubled = computed(() => `${this.input1()}!`);

  ngOnInit(): void {
    this.emitted.emit(this.doubled());
  }
}
