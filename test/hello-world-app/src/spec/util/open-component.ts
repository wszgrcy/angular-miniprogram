import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

export function routeEvent() {
  return new Observable<any>((ob) => {
    const handler = (result: any) => {
      ob.next(result);
    };
    (wx as any).onAppRoute(handler);
    /**
     * 必须给 teardown。onAppRoute 的 handler 不摘就一直挂着：
     * openComponent 在每个 spec 的 beforeEach 里都调一次，13 个 spec 就泄
     * 13 个，全部活到整轮测试结束，而且都活在自己的 spec 之外。
     */
    return () => {
      const off = (wx as any).offAppRoute;
      if (typeof off === 'function') off(handler);
    };
  });
}

export async function openComponent(url: string) {
  /**
   * 必须**先订阅再跳转**。
   *
   * onAppRoute 是事件流，不会重发历史。等 reLaunch 完了再去注册，
   * 路由事件早就发出去了，这个 await 会一直挂到 vitest 超时。
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
