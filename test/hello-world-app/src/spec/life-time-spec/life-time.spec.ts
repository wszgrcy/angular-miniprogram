import { componentTestComplete, getComponent, openComponent } from '../util';
import { LifeTimeSPecComponent } from './life-time.component';
describe('LifeTimeSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/life-time-spec/life-time-spec-entry`);
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<LifeTimeSPecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
