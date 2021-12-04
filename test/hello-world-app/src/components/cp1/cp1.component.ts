import {
  Component,
  EventEmitter,
  HostListener,
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
  host: {
    '(bindtap)': 'tap4($event)',
  },
})
export class Cp1Component {
  @Input() input1 = 111;
  @Output() output1 = new EventEmitter();
  @HostListener('tap', ['$event']) tap5(e) {
    console.log('hostlistener监听', e, this.random);
  }
  private random = Math.random();
  constructor() {}
  tap4(e) {
    console.log('host监听', e, this.random);
  }
}
