import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-cp1',
  templateUrl: './cp1.component.html',
  styleUrls: ['./cp1.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Cp1Component implements OnInit {
  @Input() testInputValue = 111;
  @Output() custom = new EventEmitter();
  // 用来判断是否为一个实例
  random = Math.random();
  constructor() {
    console.log('Cp1Component构造');
  }

  ngOnInit() {
    console.log('ngOnInit钩子');
  }
  testclick(event) {
    console.log(event);
    console.log('事件引用', this);
    this.custom.next({ detail: '测试' });
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
    this.random = Math.random();
  }
}
