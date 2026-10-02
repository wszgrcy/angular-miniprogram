import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [NgIf],
  selector: 'app-ng-if',
  templateUrl: './ng-if.component.html',
})
export class NgIfComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
