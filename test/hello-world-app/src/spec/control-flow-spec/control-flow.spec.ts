import { componentTestComplete, getComponent, openComponent } from '../util';
import { ControlFlowSPecComponent } from './control-flow.component';

describe('ControlFlowSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/control-flow-spec/control-flow-spec-entry`);
  });
  it('run', () => {
    const pages = getCurrentPages();
    const page = pages[0];
    const component = getComponent<ControlFlowSPecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
