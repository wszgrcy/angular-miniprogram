import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgSwitchSPecComponent } from './ng-switch.component';
describe('NgSwitchSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/ng-switch-spec/ng-switch-spec-entry`);
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgSwitchSPecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
