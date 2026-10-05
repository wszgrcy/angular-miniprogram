import * as path from 'path';
import { toPosix as posix } from '../util/path';
import { rewriteComponentForWxs } from './wxs-component-rewrite';

const FILE = path.resolve('/proj/src/pages/wxs/wxs.component.ts');
const CACHED = path.resolve('/proj/.ng-cache/src/pages/wxs/wxs.component.ts');
const TPL = posix(path.resolve('/proj/src/pages/wxs/wxs.component.html'));

function rewrite(
  source: string,
  templates: Map<string, string> = new Map([[TPL, '<p>{{ [a()] }}</p>']]),
) {
  return rewriteComponentForWxs(source, FILE, CACHED, (p) => templates.get(p));
}
describe('rewriteComponentForWxs：生成给 Angular 编译的组件文件', () => {
  it('没有命中 wxs 模板时返回 null，不生成', () => {
    const src = `
      import { Component } from '@angular/core';
      @Component({ selector: 'a', templateUrl: './other.html' })
      export class C {}
    `;
    expect(rewrite(src)).toBeNull();
  });

  it('templateUrl 换成内联 template', () => {
    const src = `
      import { Component } from '@angular/core';
      @Component({
        selector: 'app-wxs',
        templateUrl: './wxs.component.html',
      })
      export class WxsComponent {}
    `;
    const r = rewrite(src)!;
    expect(r.code).not.toContain('templateUrl');
    expect(r.code).toContain('template: "<p>{{ [a()] }}</p>"');
    expect(r.inlinedTemplates).toEqual([TPL]);
  });

  it('一个文件多个组件，逐个命中', () => {
    const TPL2 = posix(path.resolve('/proj/src/pages/wxs/second.html'));
    const src = `
      import { Component } from '@angular/core';
      @Component({ selector: 'a', templateUrl: './wxs.component.html' })
      export class A {}
      @Component({ selector: 'b', templateUrl: './second.html' })
      export class B {}
    `;
    const r = rewrite(
      src,
      new Map([
        [TPL, '<p>A</p>'],
        [TPL2, '<p>B</p>'],
      ]),
    )!;
    expect(r.code).toContain('template: "<p>A</p>"');
    expect(r.code).toContain('template: "<p>B</p>"');
    expect(r.inlinedTemplates.length).toBe(2);
  });

  it('同文件内其余组件的 templateUrl 原样留着，改成复制资源', () => {
    const src = `
      import { Component } from '@angular/core';
      @Component({ selector: 'a', templateUrl: './wxs.component.html' })
      export class A {}
      @Component({ selector: 'b', templateUrl: './plain.component.html' })
      export class B {}
    `;
    const r = rewrite(src)!;
    expect(r.code).toContain(`templateUrl: './plain.component.html'`);
    const plain = r.resources.filter(
      (x) =>
        x.from ===
          posix(path.resolve(path.dirname(FILE), './plain.component.html')) &&
        x.to ===
          posix(path.resolve(path.dirname(CACHED), './plain.component.html')),
    );
    expect(plain.length).toBe(1);
  });

  it('styleUrl / styleUrls 原样留着，改成复制资源（绝对路径会被 ngtsc 当 URL）', () => {
    const src = `
      import { Component } from '@angular/core';
      @Component({
        selector: 'a',
        templateUrl: './wxs.component.html',
        styleUrl: './a.css',
        styleUrls: ['./wxs.component.scss', '../shared.scss'],
      })
      export class A {}
    `;
    const r = rewrite(src)!;
    expect(r.code).toContain(`styleUrl: './a.css'`);
    expect(r.code).toContain(`'./wxs.component.scss'`);
    expect(r.resources).toEqual([
      {
        from: posix(path.resolve(path.dirname(FILE), './a.css')),
        to: posix(path.resolve(path.dirname(CACHED), './a.css')),
      },
      {
        from: posix(path.resolve(path.dirname(FILE), './wxs.component.scss')),
        to: posix(path.resolve(path.dirname(CACHED), './wxs.component.scss')),
      },
      {
        from: posix(path.resolve(path.dirname(FILE), '../shared.scss')),
        to: posix(path.resolve(path.dirname(CACHED), '../shared.scss')),
      },
    ]);
  });

  it('非相对的样式路径不收集，原样交给 Angular', () => {
    const src = `
      import { Component } from '@angular/core';
      @Component({
        selector: 'a',
        templateUrl: './wxs.component.html',
        styleUrls: ['shared/a.scss', 'https://x/y.scss'],
      })
      export class A {}
    `;
    expect(rewrite(src)!.resources).toEqual([]);
  });

  it('相对 import 绝对化，包名 import 不动', () => {
    const src = `
      import { Component } from '@angular/core';
      import { Svc } from './svc';
      import { Up } from '../up';
      export { Re } from './re';
      @Component({ selector: 'a', templateUrl: './wxs.component.html' })
      export class A {}
    `;
    const r = rewrite(src)!;
    const dir = posix(path.dirname(FILE));
    expect(r.code).toContain(`from '@angular/core'`);
    expect(r.code).toContain(`from ${JSON.stringify(`${dir}/svc`)}`);
    expect(r.code).toContain(
      `from ${JSON.stringify(posix(path.resolve(path.dirname(FILE), '../up')))}`,
    );
    expect(r.code).toContain(
      `export { Re } from ${JSON.stringify(`${dir}/re`)}`,
    );
  });

  it('非字面量 templateUrl 跳过，不为无关组件卡住构建', () => {
    const src = `
      import { Component } from '@angular/core';
      const url = './x.html';
      @Component({ selector: 'a', templateUrl: url })
      export class A {}
    `;
    expect(() => rewrite(src)).not.toThrow();
  });

  it('模板文本里的引号 / 换行经 JSON 转义后仍是合法 TS', () => {
    const tricky = `<p class="x">\n  {{ [a()] }}\n</p>`;
    const r = rewrite(
      `
      import { Component } from '@angular/core';
      @Component({ selector: 'a', templateUrl: './wxs.component.html' })
      export class A {}
    `,
      new Map([[TPL, tricky]]),
    )!;
    // 内联后不应残留裸换行破坏语法
    const line = r.code.split('\n').find((l) => l.includes('template:'))!;
    expect(line).toContain('\\n');
  });
});
