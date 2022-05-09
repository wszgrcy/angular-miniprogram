import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgTemplateOutletSPecComponent } from './ng-template-outlet.component';
describe('NgTemplateOutletSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(
      `/spec/ng-template-outlet-spec/ng-template-outlet-spec-entry`
    );
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgTemplateOutletSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
