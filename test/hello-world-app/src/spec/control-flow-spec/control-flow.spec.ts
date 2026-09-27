import { componentTestComplete, getComponent, openComponent } from '../util';
import { ControlFlowSPecComponent } from './control-flow.component';

describe('ControlFlowSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/control-flow-spec/control-flow-spec-entry`);
  });
  it('run', (done) => {
    const pages = getCurrentPages();
    const page = pages[0];
    const component = getComponent<ControlFlowSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
