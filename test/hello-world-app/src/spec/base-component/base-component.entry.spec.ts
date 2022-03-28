import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BaseComponentComponent } from './base-component.component';
function waitLoad() {
  return new Observable<any>((ob) => {
    (wx as any).onAppRoute((result) => {
      ob.next(result);
    });
  });
}
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
    await waitLoad()
      .pipe(
        filter((item) => item.openType === 'reLaunch'),
        take(1)
      )
      .toPromise();
  });
  it('run', () => {
    let pages = getCurrentPages();
    let page = pages[0];
    expect(page.__ngComponentInstance instanceof BaseComponentComponent).toBe(
      true
    );
  });
});
