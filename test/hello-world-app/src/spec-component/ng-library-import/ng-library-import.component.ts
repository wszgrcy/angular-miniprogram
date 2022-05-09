import { Component, OnInit, ViewChild } from '@angular/core';
import { LibComp1Component } from 'test-library';
@Component({
  selector: 'app-ng-library-import',
  templateUrl: './ng-library-import.component.html',
})
export class NgLibraryImportComponent implements OnInit {
  @ViewChild('libComp1', { static: true }) libComp1: LibComp1Component;
  constructor() {}

  ngOnInit() {}
}
