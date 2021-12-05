import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-forms',
  templateUrl: './base-forms.component.html',
  styleUrls: ['./base-forms.component.css'],
})
export class BaseFormsComponent implements OnInit {
  value = '默认值';
  constructor() {}

  ngOnInit() {}
  modelChange(e) {
    console.log('数据变更', e);
  }
}
