import { CommonModule } from 'angular-miniprogram/common';
import { FormsModule } from 'angular-miniprogram/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  selector: 'app-base-forms',
  templateUrl: './base-forms.component.html',
  styleUrls: ['./base-forms.component.css'],
})
export class BaseFormsComponent implements OnInit {
  value = '默认值';
  checked = ['1'];
  constructor() {}

  ngOnInit() {}
  modelChange(e) {
    console.log('数据变更', e);
  }
  checkboxChange(e) {
    console.log(e);
  }
}
