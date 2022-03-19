import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-component',
  templateUrl: './base-component.component.html',
  styleUrls: ['./base-component.component.css'],
})
export class BaseComponentComponent implements OnInit {
  componentInput1 = '由父组件传入';
  constructor() {}

  ngOnInit() {}
}
