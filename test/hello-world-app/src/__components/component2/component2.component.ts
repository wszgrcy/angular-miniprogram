import { Component, OnInit, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-component2',
  templateUrl: './component2.component.html',
  styleUrls: ['./component2.component.css'],
})
export class Component2Component implements OnInit {
  cp2Input1 = input('');
  constructor() {}

  ngOnInit() {}
}
