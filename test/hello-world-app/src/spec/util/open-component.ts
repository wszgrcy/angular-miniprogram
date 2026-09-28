import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

export function routeEvent() {
  return new Observable<any>((ob) => {
    (wx as any).onAppRoute((result) => {
      ob.next(result);
    });
  });
}

export async function openComponent(url: string) {
  /**
   * 必须**先订阅再跳转**。
   *
   * onAppRoute 是事件流，不会重发历史。等 reLaunch 完了再去注册，
   * 路由事件早就发出去了，这个 await 会一直挂到 jasmine 超时。
   */
  const routed = routeEvent()
    .pipe(
      tap((res) => {
        console.log('生命周期', res);
      }),
      filter((item) => item.openType === 'reLaunch'),
      take(1),
    )
    .toPromise();

  try {
    await new Promise((res, rej) =>
      wx.reLaunch({
        url: url,
        fail: rej,
        success: res,
      }),
    );
  } catch (error) {
    throw new Error(String(error));
  }
  await routed;
}
