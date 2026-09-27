/* eslint-disable @typescript-eslint/no-explicit-any */
import { ɵgetDocument, ɵsetDocument } from '@angular/core';
import {
  MINI_PROGRAM_FAKE_DOCUMENT,
  installFakeDocument,
} from './fake-document';

/**
 * 模拟小程序环境：没有 global document。
 * 这才是微信里 NG0210 的真实条件——测试跑在 Node 时 global.document
 * 可能存在，所以必须手动删掉才能复现。
 */
describe('fake-document (无 document 环境)', () => {
  const g = globalThis as any;
  let saved: unknown;

  beforeEach(() => {
    saved = g.document;
    delete g.document;
    // 重置 Angular 内部 DOCUMENT，回到「没装补丁」的初始态
    ɵsetDocument(undefined as any);
  });

  afterEach(() => {
    g.document = saved;
    ɵsetDocument(undefined as any);
  });

  it('前置条件：无 document 且未装补丁时，getDocument() 必须抛 NG0210', () => {
    expect(typeof g.document).toBe('undefined');
    expect(() => ɵgetDocument()).toThrowError(/NG0210/);
  });

  it('装补丁后 getDocument() 返回占位物，不再抛', () => {
    installFakeDocument();
    expect(() => ɵgetDocument()).not.toThrow();
    expect(ɵgetDocument()).toBe(MINI_PROGRAM_FAKE_DOCUMENT);
  });

  it('占位物的 head 可访问（getStyleHost 会取 doc().head）', () => {
    installFakeDocument();
    expect(() => (ɵgetDocument() as any).head).not.toThrow();
    expect((ɵgetDocument() as any).head).toBeDefined();
  });
});
