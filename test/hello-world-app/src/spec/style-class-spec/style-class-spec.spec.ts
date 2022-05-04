import { componentTestComplete, getComponent, openComponent } from '../util';
import { StyleClassSpecComponent } from './style-class-spec.component';

describe('StyleClassSpecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/style-class-spec/style-class-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<StyleClassSpecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
