import { componentTestComplete, getComponent, openComponent } from '../util';
import { SelfTemplateSPecComponent } from './self-template.component';
describe('SelfTemplateSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/self-template-spec/self-template-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<SelfTemplateSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
