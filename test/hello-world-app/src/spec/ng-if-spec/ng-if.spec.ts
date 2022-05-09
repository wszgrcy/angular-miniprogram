import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgIfSPecComponent } from './ng-if.component';
describe('NgIfSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/ng-if-spec/ng-if-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgIfSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
