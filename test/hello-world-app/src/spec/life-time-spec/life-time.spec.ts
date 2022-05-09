import { componentTestComplete, getComponent, openComponent } from '../util';
import { LifeTimeSPecComponent } from './life-time.component';
describe('LifeTimeSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/life-time-spec/life-time-spec-entry`);
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<LifeTimeSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
