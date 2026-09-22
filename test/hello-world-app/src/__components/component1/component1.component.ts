import { Component, OnInit, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-component1',
  templateUrl: './component1.component.html',
  styleUrls: ['./component1.component.css'],
})
export class Component1Component implements OnInit {
  /** signal input，替代 @Input() */
  input1 = input('');
  constructor() {}

  ngOnInit() {}
}
