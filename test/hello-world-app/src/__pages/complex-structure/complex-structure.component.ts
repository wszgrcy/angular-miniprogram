import { CommonModule } from 'angular-miniprogram/common';
import { ContentModule } from '../../__components/content/content.module';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, ContentModule],
  selector: 'app-complex-structure',
  templateUrl: './complex-structure.component.html',
  styleUrls: ['./complex-structure.component.css'],
})
export class ComplexStructureComponent implements OnInit {
  list = [1, 2, 3];
  constructor() {}

  ngOnInit() {}
}
