import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'lib-test-library',
  template: ``,
  styleUrls: ['./test-library.component.scss'],
})
export class TestLibraryComponent implements OnInit {
  @Input() input1;
  @HostBinding('property1') property1;

  constructor() {}

  ngOnInit(): void {}
}
