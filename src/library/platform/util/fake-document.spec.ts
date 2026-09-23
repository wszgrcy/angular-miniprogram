import { DOCUMENT } from '@angular/core';

import {
  FAKE_DOCUMENT_PROVIDER,
  MINI_PROGRAM_FAKE_DOCUMENT,
  installFakeDocument,
} from './fake-document';

/**
 * Angular 22 起 createComponentRef 会无条件要真 Document
 * （getStyleHost，commit cdda51a3b2）。小程序没有，靠本模块的占位物兜住。
 *
 * 注意：这些用例跑在 Node 里，`typeof document` 可能是 undefined，
 * 正好复现小程序那侧「没有 document」的条件；但也因此**不能**依赖
 * 「不装补丁就抛」来验证——测试环境装了 jsdom 就不会抛，
 * 而微信里会抛。所以这里直接断言占位物本身被正确装上，
 * 而不是断言「不装会炸」。
 */
describe('fake-document', () => {
  it('占位物有 head 属性（getStyleHost 会访问 doc().head）', () => {
    expect(MINI_PROGRAM_FAKE_DOCUMENT.head).toBeDefined();
  });

  it('installFakeDocument 让 Angular 内部 getDocument() 返回占位物', async () => {
    installFakeDocument();
    const core = await import('@angular/core');
    const getDocument = (core as unknown as { ɵgetDocument?: () => Document })
      .ɵgetDocument;

    // 必须存在。之前写成 `if (getDocument) {...} else {宽松兜底}`，
    // 一旦 Angular 改了导出名，这条用例会在什么都没验证的情况下通过，
    // 而真正要防的 NG0210 又回来了。所以这里 fail fast。
    expect(getDocument)
      .withContext('ɵgetDocument 应从 @angular/core 导出')
      .toBeInstanceOf(Function);

    expect(() => getDocument()).not.toThrow();
    expect(getDocument()).toBe(MINI_PROGRAM_FAKE_DOCUMENT);
  });

  it('provider 指向同一个占位物', () => {
    expect(FAKE_DOCUMENT_PROVIDER.provide).toBe(DOCUMENT);
    expect(FAKE_DOCUMENT_PROVIDER.useValue).toBe(MINI_PROGRAM_FAKE_DOCUMENT);
  });
});
