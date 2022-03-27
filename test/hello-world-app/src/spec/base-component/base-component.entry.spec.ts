import { BaseComponentComponent } from './base-component.component';

describe('BaseComponent', () => {
  beforeEach(async () => {
    try {
      await new Promise((res, rej) =>
        wx.reLaunch({
          url: `/spec/base-component/base-component-entry`,
          fail: rej,
          success: res,
        })
      );
    } catch (error) {
      throw new Error(error);
    }
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    expect(page.__ngComponentInstance instanceof BaseComponentComponent).toBe(
      true
    );
  });
});
