import { componentTestComplete, getComponent, openComponent } from '../util';
import { NgLibraryImportSPecComponent } from './ng-library-import.component';
describe('NgLibraryImportSPecComponent', () => {
  beforeEach(async () => {
    await openComponent(
      `/spec/ng-library-import-spec/ng-library-import-spec-entry`
    );
  });
  it('run', (done) => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<NgLibraryImportSPecComponent>(page);
    componentTestComplete(component.testFinish$$).then(() => {
      done();
    });
  });
});
