import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgContentSpecComponent } from './ng-content.component';
describe('NgContentSpecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/ng-content-spec/ng-content-spec-entry`);
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgContentSpecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
