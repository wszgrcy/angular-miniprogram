import { CommonModule } from '@angular/common';
import { Component1Module } from '../../__components/component1/component1.module';
import { Component2Module } from '../../__components/component2/component2.module';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, Component1Module, Component2Module],
  selector: 'app-base-component',
  templateUrl: './base-component.component.html',
  styleUrls: ['./base-component.component.css'],
})
export class BaseComponentComponent implements OnInit {
  componentInput1 = '由父组件传入';
  constructor() {}

  ngOnInit() {}
}
