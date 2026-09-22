import { Component, OnInit, TemplateRef, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-component-need-template',
  templateUrl: './component-need-template.component.html',
  styleUrls: ['./component-need-template.component.css'],
})
export class ComponentNeedTemplateComponent implements OnInit {
  templateRef = input.required<TemplateRef<any>>();
  constructor() {}

  ngOnInit() {}
}
