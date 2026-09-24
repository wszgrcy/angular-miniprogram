import { CommonModule } from '@angular/common';
import { LibComp1Module } from 'test-library';
import { Component3Component } from '../../__components/component3/component3.component';
import { AppDir1Directive } from './app-dir1.directive';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LibComp1Module,
    Component3Component,
    AppDir1Directive,
  ],
  selector: 'app-complex-property-event',
  templateUrl: './complex-property-event.component.html',
  styleUrls: ['./complex-property-event.component.css'],
})
export class ComplexPropertyEventComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
