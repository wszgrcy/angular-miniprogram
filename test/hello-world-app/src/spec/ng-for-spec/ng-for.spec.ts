import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgForSPecComponent } from './ng-for.component';
describe('NgForSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/ng-for-spec/ng-for-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgForSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
