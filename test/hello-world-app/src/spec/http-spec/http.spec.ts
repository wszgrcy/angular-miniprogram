import {
  componentTestComplete,
  getComponent,
  openComponent,
  FIXTURE_ARTICLES_EXPECTED,
} from '../util';
import { HttpSpecComponent } from './http.component';

describe('http', () => {
  let oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  beforeEach(async () => {
    // 跨网请求给 25s：够慢网跑完，又不至于像原来 100s 那样把整轮拖死
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 25 * 1000;
    await openComponent(`/pages/http-spec/http-spec-entry`);
  });
  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
  });
  it('run', async () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<HttpSpecComponent>(page);
    await componentTestComplete(component.testFinish$$, 20000);
    // 请求失败不能默默吞掉，到这儿显式报出来
    expect(component.testError).toBeUndefined();
    // 还要确认数据真的过了一层，不是「没报错」就算过
    expect(
      component.response?.articlesCount,
      '响应体应完整送到适配层上层',
    ).toBe(FIXTURE_ARTICLES_EXPECTED.articlesCount);
    expect(component.response?.articles?.[0]?.slug).toBe(
      FIXTURE_ARTICLES_EXPECTED.firstSlug,
    );
  });
});
