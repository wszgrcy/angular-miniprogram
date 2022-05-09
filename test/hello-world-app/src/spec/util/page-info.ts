import type { MiniProgramComponentVariable } from 'angular-miniprogram/platform/type';
import { BehaviorSubject } from 'rxjs';

export function assertMiniProgramComponent(
  page
): page is MiniProgramComponentVariable {
  return page.__ngComponentInstance ? true : false;
}

export function getComponent<T>(
  page: WechatMiniprogram.Page.Instance<
    WechatMiniprogram.IAnyObject,
    WechatMiniprogram.IAnyObject
  >
): T {
  return page.__ngComponentInstance;
}

export function componentTestComplete(subject: BehaviorSubject<unknown>) {
  return new Promise<void>((res) => {
    subject.subscribe({
      complete: () => {
        res();
      },
    });
  });
}
