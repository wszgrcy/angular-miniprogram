import { CommonModule } from '@angular/common';
import { HttpClientModule } from 'angular-miniprogram';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-base-http',
  templateUrl: './base-http.component.html',
  styleUrls: ['./base-http.component.css'],
})
export class BaseHttpComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {}
  request() {
    this.http
      .get('https://api.realworld.io/api/articles?limit=10&offset=0')
      .subscribe((item) => {
        console.log(item);
      });
  }
}
