import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgSwitchSPecComponent } from './ng-switch.component';
describe('NgSwitchSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/ng-switch-spec/ng-switch-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgSwitchSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
