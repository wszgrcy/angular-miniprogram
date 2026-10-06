import { Component, OnInit } from '@angular/core';
import { OtherComponent } from '../other/other.component';
import { OutsideTemplateComponent } from '../outside-template/outside-template.component';

@Component({
  // standalone 组件不再从模块继承作用域，模板里用到的东西必须自己 import
  imports: [OutsideTemplateComponent, OtherComponent],
  selector: 'app-global-self-template',
  templateUrl: './global-self-template.component.html',
  styleUrls: ['./global-self-template.component.css'],
})
export class GlobalSelfTemplateComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
