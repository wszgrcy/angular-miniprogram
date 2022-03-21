import { BaseComponentComponent } from './base-component.component';

describe('BaseComponent', () => {
  beforeEach(async () => {
    await wx.reLaunch({ url: `/spec/base-component/base-component-entry` });
  });
  it('run', () => {
    let pages = getCurrentPages();
    expect(
      pages[0].__ngComponentInstance instanceof BaseComponentComponent
    ).toBe(true);
  });
});
