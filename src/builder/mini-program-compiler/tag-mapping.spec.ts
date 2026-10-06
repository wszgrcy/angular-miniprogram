import { mapAngularTagToWxml } from './tag-mapping';

describe('HTML 标签 → wxml 标签', () => {
  it('容器类语义标签统一成 view', () => {
    for (const tag of ['div', 'p', 'h1', 'h6', 'span', 'section', 'li', 'td']) {
      expect(mapAngularTagToWxml(tag)).toBe('view');
    }
  });

  it('行内语义标签也成 view，而不是原样落进 wxml', () => {
    for (const tag of ['b', 'em', 'strong', 'code', 'small', 'del']) {
      expect(mapAngularTagToWxml(tag)).toBe('view');
    }
  });

  it('小程序有同名组件的标签原样透传', () => {
    for (const tag of [
      'view',
      'text',
      'input',
      'textarea',
      'button',
      'scroll-view',
    ]) {
      expect(mapAngularTagToWxml(tag)).toBe(tag);
    }
  });

  it('名字不同但语义相同的小程序组件要改名', () => {
    expect(mapAngularTagToWxml('img')).toBe('image');
  });

  it('结构指令标签映射成 block', () => {
    expect(mapAngularTagToWxml('ng-container')).toBe('block');
  });

  it('自定义组件标签原样保留', () => {
    expect(mapAngularTagToWxml('app-component1')).toBe('app-component1');
  });

  it('属性名不同的小程序对应物不静默换标签', () => {
    // navigator 要 url 不要 href，picker 完全是另一套用法，
    // 换错了比原样输出更难查，所以保持原标签。
    expect(mapAngularTagToWxml('a')).toBe('a');
    expect(mapAngularTagToWxml('select')).toBe('select');
  });
});
