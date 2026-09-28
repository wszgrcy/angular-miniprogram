import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-self-template',
  templateUrl: './self-template.component.html',
})
export class SelfTemplateComponent implements OnInit {
  template1 = input.required<TemplateRef<any>>();
  constructor() {}

  ngOnInit() {}
}
