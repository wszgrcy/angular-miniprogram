import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-self-template',
  templateUrl: './self-template.component.html',
})
export class SelfTemplateComponent implements OnInit {
  @Input() template1: TemplateRef<any>;
  constructor() {}

  ngOnInit() {}
}
