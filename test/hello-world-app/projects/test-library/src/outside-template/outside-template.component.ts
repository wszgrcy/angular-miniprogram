import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-outside-template',
  templateUrl: './outside-template.component.html',
  styleUrls: ['./outside-template.component.css'],
})
export class OutsideTemplateComponent implements OnInit {
  @Input() template: TemplateRef<any>;
  constructor() {}

  ngOnInit() {}
}
