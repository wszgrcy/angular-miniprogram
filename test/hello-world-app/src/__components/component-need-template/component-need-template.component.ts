import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-component-need-template',
  templateUrl: './component-need-template.component.html',
  styleUrls: ['./component-need-template.component.css'],
})
export class ComponentNeedTemplateComponent implements OnInit {
  @Input() templateRef: TemplateRef<any>;
  constructor() {}

  ngOnInit() {}
}
