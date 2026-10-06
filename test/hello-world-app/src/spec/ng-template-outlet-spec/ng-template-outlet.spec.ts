import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgTemplateOutletSPecComponent } from './ng-template-outlet.component';
describe('NgTemplateOutletSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(
      `/pages/ng-template-outlet-spec/ng-template-outlet-spec-entry`,
    );
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgTemplateOutletSPecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
