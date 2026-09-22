import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-complex-structure',
  templateUrl: './complex-structure.component.html',
  styleUrls: ['./complex-structure.component.css'],
})
export class ComplexStructureComponent implements OnInit {
  list = [1, 2, 3];
  constructor() {}

  ngOnInit() {}
}
