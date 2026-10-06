import { componentTestComplete, getComponent, openComponent } from '../util';
import { SignalIoSPecComponent } from './signal-io.component';

describe('SignalIoSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/pages/signal-io-spec/signal-io-spec-entry`);
  });
  it('run', () => {
    const pages = getCurrentPages();
    const page = pages[0];
    const component = getComponent<SignalIoSPecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
