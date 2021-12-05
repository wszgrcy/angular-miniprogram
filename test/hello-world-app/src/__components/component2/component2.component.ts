import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-component2',
  templateUrl: './component2.component.html',
  styleUrls: ['./component2.component.css'],
})
export class Component2Component implements OnInit {
  @Input() cp2Input1 = '';
  constructor() {}

  ngOnInit() {}
}
