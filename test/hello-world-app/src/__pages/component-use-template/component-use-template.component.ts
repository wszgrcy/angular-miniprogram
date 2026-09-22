import { OutsideTemplateModule, GlobalSelfTemplateModule } from 'test-library';
import { Component1Module } from '../../__components/component1/component1.module';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [OutsideTemplateModule, Component1Module, GlobalSelfTemplateModule],
  selector: 'app-component-use-template',
  templateUrl: './component-use-template.component.html',
  styleUrls: ['./component-use-template.component.css'],
})
export class ComponentUseTemplateComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
