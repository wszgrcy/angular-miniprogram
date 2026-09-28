import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ng-switch',
  templateUrl: './ng-switch.component.html',
})
export class NgSwitchComponent implements OnInit {
  case1 = 'case1';
  constructor() {}

  ngOnInit() {}
}
