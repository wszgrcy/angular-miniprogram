import { Component, OnInit } from '@angular/core';
import { HttpClient } from 'angular-miniprogram/common/http';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-http-spec',
  template: ``,
})
export class HttpSpecComponent implements OnInit {
  testFinish$$ = new BehaviorSubject(undefined);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.request();
  }
  request() {
    this.http
      .get('https://api.realworld.io/api/articles?limit=10&offset=0')
      .subscribe((item) => {
        expect(item).toBeTruthy();
        expect(typeof item).toBe('object');
        this.testFinish$$.complete();
      });
  }
}
