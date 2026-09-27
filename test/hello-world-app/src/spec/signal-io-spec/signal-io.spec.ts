import { componentTestComplete, getComponent, openComponent } from '../util';
import { SignalIoSPecComponent } from './signal-io.component';

describe('SignalIoSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(`/spec/signal-io-spec/signal-io-spec-entry`);
  });
  it('run', (done) => {
    const pages = getCurrentPages();
    const page = pages[0];
    const component = getComponent<SignalIoSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
