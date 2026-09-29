/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * sandbox 拷贝策略的回归用例。
 *
 * 背景：`describeBuilder` 的 `beforeEach/afterEach` 会为**每个 spec** 建 / 拆一次
 * sandbox（`TestProjectHost`）。上游那份实现把模板目录整个搬进 sandbox，包括
 * 上一次构建留下的 `dist/`（真实模板里 5.7MB / 358 个文件），实测占了整个测试
 * 套件 ~31% 的时间。本文件钉住改完之后的两个方向：
 *
 *   ✅ 构建产物 / 缓存目录**不进** sandbox（省时间，且不让 toExist() 拿旧产物蒙对）
 *   ✅ 源码与 node_modules **必须进** sandbox（否则构建直接解析不到依赖）
 *
 * 两个方向都重要：只测第一条的话，把排除规则写宽一点也能过，但构建会直接崩。
 */
import { getSystemPath, normalize } from '@angular-devkit/core';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  FastTestProjectHost,
  isExcludedFromSandbox,
} from '../../test/cyia-ngx-devkit';

/** 真实模板根，与 test/plugin-describe-builder 用的是同一个 */
const REAL_TEMPLATE = path.resolve(__dirname, '../../test/hello-world-app');

describe('sandbox 拷贝策略（性能回归）', () => {
  describe('isExcludedFromSandbox 规则', () => {
    const root = path.resolve('/proj/app');
    const ex = (rel: string) =>
      isExcludedFromSandbox(root, path.join(root, rel));

    it('构建产物与缓存目录被排除', () => {
      expect(ex('dist')).toBeTrue();
      expect(ex(path.join('dist', 'app', 'app.js'))).toBeTrue();
      expect(ex(path.join('.angular', 'cache', 'x.json'))).toBeTrue();
      expect(ex(path.join('__test-app', 'app.js'))).toBeTrue();
    });

    it('源码 / 配置 / 依赖不被排除', () => {
      expect(ex('angular.json')).toBeFalse();
      expect(ex(path.join('src', 'main.ts'))).toBeFalse();
      expect(
        ex(path.join('node_modules', 'test-library', 'package.json')),
      ).toBeFalse();
    });

    it('不误伤名字里带 dist / angular 的源码路径', () => {
      // 只匹配「整段目录名」，子串不算
      expect(ex(path.join('src', 'dist-utils', 'main.ts'))).toBeFalse();
      expect(ex(path.join('src', 'pages', 'district', 'page.ts'))).toBeFalse();
      expect(ex('dist.ts')).toBeFalse();
      expect(ex(path.join('src', 'my.angular', 'a.ts'))).toBeFalse();
    });
  });

  it('自建模板：dist / .angular 不进 sandbox，src 与 node_modules 进', async () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-sandbox-'));
    try {
      fs.mkdirSync(path.join(fixture, 'src'), { recursive: true });
      fs.writeFileSync(
        path.join(fixture, 'src', 'main.ts'),
        'export const a = 1;\n',
      );
      fs.writeFileSync(path.join(fixture, 'angular.json'), '{}');
      fs.mkdirSync(path.join(fixture, 'node_modules', 'pkg'), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(fixture, 'node_modules', 'pkg', 'package.json'),
        '{}',
      );
      fs.mkdirSync(path.join(fixture, 'dist', 'app'), { recursive: true });
      fs.writeFileSync(
        path.join(fixture, 'dist', 'app', 'stale.js'),
        'stale-build-output',
      );
      fs.mkdirSync(path.join(fixture, '.angular', 'cache'), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(fixture, '.angular', 'cache', 'blob.json'),
        '{}',
      );

      const h = new FastTestProjectHost(normalize(fixture));
      await h.initialize().toPromise();
      const sandbox = getSystemPath(h.root());
      try {
        // 该进来的必须进来
        expect(fs.existsSync(path.join(sandbox, 'src', 'main.ts')))
          .withContext('src 必须进 sandbox')
          .toBeTrue();
        expect(fs.existsSync(path.join(sandbox, 'angular.json')))
          .withContext('angular.json 必须进 sandbox')
          .toBeTrue();
        expect(
          fs.existsSync(
            path.join(sandbox, 'node_modules', 'pkg', 'package.json'),
          ),
        )
          .withContext('node_modules 必须进 sandbox，否则构建解析不到依赖')
          .toBeTrue();

        // 构建产物 / 缓存不得进来
        expect(fs.existsSync(path.join(sandbox, 'dist')))
          .withContext('dist 不该被拷进 sandbox')
          .toBeFalse();
        expect(fs.existsSync(path.join(sandbox, '.angular')))
          .withContext('.angular 缓存不该被拷进 sandbox')
          .toBeFalse();

        // 模板本体不能被改动过
        expect(fs.existsSync(path.join(fixture, 'dist', 'app', 'stale.js')))
          .withContext('模板本体不应被移动 / 删除')
          .toBeTrue();
      } finally {
        await h.restore().toPromise();
      }

      expect(fs.existsSync(sandbox)).toBeFalse();
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it('真实模板：src / node_modules 齐全，dist 缺席', async () => {
    // 用**自己**的 host 实例，去碰 `setWorkspaceRoot` / 共享的 `host`：
    // describeBuilder 在注册时就把 host 抓进了 harness，中途换掉会让
    // `harness.host` 和模块变量指向不同实例，后面的 spec 直接拿不到 root。
    const h = new FastTestProjectHost(normalize(REAL_TEMPLATE));
    await h.initialize().toPromise();
    try {
      const sandbox = getSystemPath(h.root());

      expect(fs.existsSync(path.join(sandbox, 'angular.json')))
        .withContext('angular.json 必须在 sandbox 里')
        .toBeTrue();
      expect(fs.existsSync(path.join(sandbox, 'src', 'main.ts')))
        .withContext('src/main.ts 必须在 sandbox 里')
        .toBeTrue();
      expect(
        fs.existsSync(
          path.join(sandbox, 'node_modules', 'test-library', 'package.json'),
        ),
      )
        .withContext(
          'node_modules/test-library 必须在 sandbox 里（库依赖解析靠它）',
        )
        .toBeTrue();

      expect(fs.existsSync(path.join(sandbox, 'dist')))
        .withContext('模板里的 dist/ 不该被拷进 sandbox')
        .toBeFalse();
    } finally {
      await h.restore().toPromise();
    }
  });
});
