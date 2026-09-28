import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from 'angular-miniprogram';
import { FIXTURE_ARTICLES_URL } from '../util/fixture-server';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-http-spec',
  template: ``,
})
export class HttpSpecComponent implements OnInit {
  testFinish$$ = new BehaviorSubject(undefined);
  /** 请求失败时把错误带回去，由 spec 断言，不在 onReady 里直接挂死 */
  testError?: string;
  /** 存下响应，让 spec 能断言「数据真的过了一层」而不只是「没报错」 */
  response?: { articlesCount?: number; articles?: { slug?: string }[] };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.request();
  }
  request() {
    /**
     * 打本地 fixture 服务（由 karma.conf.js 起），不再挨外部域名。
     *
     * 请求仍是真的 `wx.request` → 127.0.0.1，适配层链路完全一致，
     * 只是响应可控。原来挨的 api.realworld.io 已返 530，
     * 测试会长期红且与代码无关。
     */
    this.http.get(FIXTURE_ARTICLES_URL).subscribe({
      next: (item) => {
        expect(item).toBeTruthy();
        expect(typeof item).toBe('object');
        this.response = item as HttpSpecComponent['response'];
        this.testFinish$$.complete();
      },
      /**
       * 必须接 error。
       *
       * 之前只传了 next：请求一失败（域名不可达 / 超时 / 非 2xx）
       * 就没人调 complete()，spec 始终挂到 jasmine 超时，把整轮
       * 测试的时长和错误信息都搞没了。
       */
      error: (e: unknown) => {
        this.testError = String(
          (e as Error)?.message ??
            (e as { statusText?: string })?.statusText ??
            e,
        );
        this.testFinish$$.complete();
      },
    });
  }
}
