import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgContentSpecComponent } from './ng-content.component';
describe('NgContentSpecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/ng-content-spec/ng-content-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgContentSpecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
