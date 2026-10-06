import type { MiniProgramComponentVariable } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';

export function assertMiniProgramComponent(
  page,
): page is MiniProgramComponentVariable {
  return page.__ngComponentInstance ? true : false;
}

export function getComponent<T>(
  page: WechatMiniprogram.Page.Instance<
    WechatMiniprogram.IAnyObject,
    WechatMiniprogram.IAnyObject
  >,
): T {
  return page.__ngComponentInstance;
}

export function componentTestComplete(
  subject: BehaviorSubject<unknown>,
  timeoutMs = 15000,
) {
  /**
   * 等页面 onReady 把 testFinish$$ 打完成。
   *
   * 加超时兑底：onReady 里任何一步抛异常（选择器报错、上下文丢失等），
   * complete() 就不会被调用。没有这个超时的话整个 spec 会挂到 vitest
   * 默认 10s，而且 vitest 宿主 客户端长时间不发消息，直接被判
   * "no message in 30000 ms" 断连，后面的 spec 全部跑不到。
   */
  return new Promise<void>((res, rej) => {
    const timer = setTimeout(() => {
      rej(
        new Error(
          `页面 onReady 未在 ${timeoutMs}ms 内完成 testFinish$$` +
            `（isStopped=${subject.isStopped}）——` +
            `检查该页 onReady 是否抱异常、断言目标选择器是否存在`,
        ),
      );
    }, timeoutMs);
    subject.subscribe({
      complete: () => {
        clearTimeout(timer);
        res();
      },
    });
  });
}
