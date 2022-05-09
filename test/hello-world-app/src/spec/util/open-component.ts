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
  try {
    await new Promise((res, rej) =>
      wx.reLaunch({
        url: url,
        fail: rej,
        success: res,
      })
    );
  } catch (error) {
    throw new Error(error);
  }
  await routeEvent()
    .pipe(
      tap((res) => {
        console.log('生命周期', res);
      }),
      filter((item) => item.openType === 'reLaunch'),
      take(1)
    )
    .toPromise();
}
