import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-self-component',
  templateUrl: './self-component.component.html',
  styleUrls: ['./self-component.component.css'],
})
export class SelfComponentComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
