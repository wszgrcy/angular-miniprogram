import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgForSPecComponent } from './ng-for.component';
describe('NgForSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/ng-for-spec/ng-for-spec-entry`);
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgForSPecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
