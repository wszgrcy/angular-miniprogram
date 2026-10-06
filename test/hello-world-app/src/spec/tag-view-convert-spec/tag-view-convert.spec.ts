import { componentTestComplete, getComponent, openComponent } from '../util';
import { TagViewConvertSpecComponent } from './tag-view-convert.component';

describe('TagViewConvertSpecComponent', () => {
  beforeEach(async () => {
    await openComponent(
      `/pages/tag-view-convert-spec/tag-view-convert-spec-entry`,
    );
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    let component = getComponent<TagViewConvertSpecComponent>(page);
    return componentTestComplete(component.testFinish$$);
  });
});
