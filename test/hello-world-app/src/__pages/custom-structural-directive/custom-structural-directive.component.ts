import { Structural1Directive } from './structural1.directive';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [Structural1Directive],
  selector: 'app-custom-structural-directive',
  templateUrl: './custom-structural-directive.component.html',
  styleUrls: ['./custom-structural-directive.component.css'],
})
export class CustomStructuralDirectiveComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
