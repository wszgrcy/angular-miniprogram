import { CommonModule } from 'angular-miniprogram/common';
import { ComponentNeedTemplateModule } from '../../__components/component-need-template/component-need-template.module';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, ComponentNeedTemplateModule],
  selector: 'app-self-component',
  templateUrl: './self-component.component.html',
  styleUrls: ['./self-component.component.css'],
})
export class SelfComponentComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
