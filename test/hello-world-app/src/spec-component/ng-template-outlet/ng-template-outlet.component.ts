import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ng-template-outlet',
  templateUrl: './ng-template-outlet.component.html',
})
export class NgTemplateOutletComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
