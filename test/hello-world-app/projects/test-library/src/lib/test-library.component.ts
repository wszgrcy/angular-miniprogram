import { Component, HostBinding, OnInit, input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'lib-test-library',
  template: ``,
  styleUrls: ['./test-library.component.scss'],
})
export class TestLibraryComponent implements OnInit {
  /** signal input，替代 @Input() */
  input1 = input<any>(undefined);
  @HostBinding('property1') property1;

  constructor() {}

  ngOnInit(): void {}
}
