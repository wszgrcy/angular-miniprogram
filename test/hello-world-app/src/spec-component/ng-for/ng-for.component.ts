import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-ng-for',
  templateUrl: './ng-for.component.html',
})
export class NgForComponent implements OnInit {
  @Input() list: string[];
  constructor() {}

  ngOnInit() {}
}
