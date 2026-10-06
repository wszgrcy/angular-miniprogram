import { componentTestComplete, getComponent, openComponent } from '../util';
import { StyleClassSpecComponent } from './style-class-spec.component';

describe('StyleClassSpecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/style-class-spec/style-class-spec-entry`);
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<StyleClassSpecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
