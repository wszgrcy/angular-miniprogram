import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-test-library',
  template: ` <p>test-library works!</p>
    <app-other></app-other>`,
  styles: [
    `
      h1 {
        color: red;
      }
    `,
  ],
  styleUrls: ['./test-library.component.scss'],
})
export class TestLibraryComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
