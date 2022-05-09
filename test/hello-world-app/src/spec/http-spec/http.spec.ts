import { componentTestComplete, getComponent, openComponent } from '../util';
import { HttpSpecComponent } from './http.component';

describe('http', () => {
  let oldTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  beforeEach(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * 1000;
    await openComponent(`/spec/http-spec/http-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<HttpSpecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
      jasmine.DEFAULT_TIMEOUT_INTERVAL = oldTimeout;
    });
  });
});
