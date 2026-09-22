import { CommonModule } from 'angular-miniprogram/common';
import { ContentModule } from '../../__components/content/content.module';
import { ContentMultiModule } from '../../__components/content-multi/content-multi.module';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, ContentModule, ContentMultiModule],
  selector: 'app-ng-content',
  templateUrl: './ng-content.component.html',
  styleUrls: ['./ng-content.component.css'],
})
export class NgContentComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
