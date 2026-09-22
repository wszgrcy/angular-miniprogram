import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-base-directive',
  templateUrl: './base-directive.component.html',
  styleUrls: ['./base-directive.component.css'],
})
export class BaseDirectiveComponent implements OnInit {
  /** 由 libInputOutput 的 signal output 回传 */
  output1Value: string | undefined;
  output2Value: number | undefined;

  constructor() {}

  ngOnInit() {}

  event1(value?: string) {
    this.output1Value = value;
  }

  event2(value?: number) {
    this.output2Value = value;
  }
}
