import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.htm' + 'l',
  styleUrls: [],
  interpolation: ['((', '))'],
})
export class TestComponent {
  constructor() {}
}
