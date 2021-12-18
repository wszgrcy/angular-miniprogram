import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.css'],
})
export class OtherComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  click() {
    console.log('other被点击');
  }
}
