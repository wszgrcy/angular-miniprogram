import { CommonModule } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ng-for',
  templateUrl: './ng-for.component.html',
})
export class NgForComponent implements OnInit {
  list = input<string[]>([]);
  constructor() {}

  ngOnInit() {}
}
