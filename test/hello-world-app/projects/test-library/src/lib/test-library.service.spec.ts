import { TestBed } from '@angular/core/testing';

import { TestLibraryService } from './test-library.service';

describe('TestLibraryService', () => {
  let service: TestLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
