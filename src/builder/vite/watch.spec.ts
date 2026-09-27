import { join, normalize } from '@angular-devkit/core';
import * as fs from 'fs-extra';
import * as path from 'path';
import { of } from 'rxjs';
import { concatMap, skip, take } from 'rxjs/operators';
import {
  MyTestProjectHost,
  describeBuilder,
} from '../../../test/plugin-describe-builder';
import {
  BROWSER_BUILDER_INFO,
  DEFAULT_ANGULAR_CONFIG,
} from '../../../test/test-builder';
import {
  ALL_COMPONENT_NAME_LIST,
  ALL_PAGE_NAME_LIST,
  ALL_COMPONENT_NAME_LIST as COMP_LIST,
} from '../../../test/util/file';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  watch: true,
};

/**
 * Vite watch 模式。
 *
 * 小程序没有浏览器 dev-server——微信开发者工具本身就是「服务器」，
 * 它盯 dist 目录。所以 watch 就是原来的 dev 流程：
 * builder 监听源码重构建写 dist，DevTools 自动刷新。
 *
 * 实现上不用 Vite 原生 watch（Rolldown watch 不支持动态加 input），
 * 而是「发现变动就重算入口 + 重跑一次 vite.build」，
 * 顺带把 watch 期间新增入口这个坑一起解决掉。
 */
describeBuilder(
  runViteBuilder,
  { ...BROWSER_BUILDER_INFO, name: 'test-builder:vite-watch' },
  (harness) => {
    describe('vite-watch', () => {
      const setup = async () => {
        const root = harness.host.root();
        const myTestProjectHost = new MyTestProjectHost(harness.host);
        const list = await myTestProjectHost.getFileList(
          normalize(join(root, 'src', '__pages'))
        );
        list.push(
          ...(await myTestProjectHost.getFileList(
            normalize(join(root, 'src', '__components'))
          ))
        );
        await myTestProjectHost.importPathRename(list);
        await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
        await myTestProjectHost.moveDir(
          COMP_LIST,
          '__components',
          'components'
        );
        await myTestProjectHost.addPageEntry(ALL_PAGE_NAME_LIST);
      };

      const readOut = (base: string, rel: string) =>
        fs.readFileSync(path.join(base, rel), 'utf8');

      it('watch 下改模板能重新产出 wxml', async () => {
        await setup();
        const marker = 'VITE_WATCH_MARKER';

        harness.useTarget('build', angularConfig as never);
        const results: Array<{
          result?: { success?: boolean; baseOutputPath?: string };
        }> = [];
        await harness
          .execute()
          .pipe(
            concatMap((result, index) => {
              results.push(result as never);
              if (index === 0) {
                const base = result.result!.baseOutputPath!;
                const before = readOut(
                  base,
                  'pages/control-flow/control-flow-entry.wxml'
                );
                expect(before).not.toContain(marker);
                void harness.writeFile(
                  'src/pages/control-flow/control-flow.component.html',
                  before + marker
                );
              }
              return of(result);
            }),
            take(2),
            skip(1)
          )
          .toPromise();

        const base = results[results.length - 1].result!.baseOutputPath!;
        expect(
          readOut(base, 'pages/control-flow/control-flow-entry.wxml')
        ).toContain(marker);
      }, 180000);

      it('watch 期间新增入口能被拉进来', async () => {
        await setup();

        harness.useTarget('build', angularConfig as never);
        const results: Array<{
          result?: { success?: boolean; baseOutputPath?: string };
        }> = [];
        await harness
          .execute()
          .pipe(
            concatMap((result, index) => {
              results.push(result as never);
              if (index === 0) {
                const base = result.result!.baseOutputPath!;
                expect(
                  fs.existsSync(
                    path.join(base, 'pages/watch-new/watch-new-entry.wxml')
                  )
                ).toBeFalsy();
                const appJson = JSON.parse(harness.readFile('src/app.json'));
                appJson.pages = [
                  ...(appJson.pages || []),
                  'pages/watch-new/watch-new-entry',
                ];
                void harness.writeFiles({
                  'src/app.json': JSON.stringify(appJson),
                  'src/pages/watch-new/watch-new.entry.ts': `import { Component } from '@angular/core';
import { bootstrapPage } from 'angular-miniprogram';

@Component({
  selector: 'app-watch-new',
  standalone: true,
  template: '<view>{{ title }}</view>',
})
export class WatchNewComponent {
  title = 'watch-new';
}

bootstrapPage(WatchNewComponent);
`,
                });
              }
              return of(result);
            }),
            take(2),
            skip(1)
          )
          .toPromise();

        const base = results[results.length - 1].result!.baseOutputPath!;
        expect(
          fs.existsSync(path.join(base, 'pages/watch-new/watch-new-entry.js'))
        ).toBeTruthy();
        expect(
          fs.existsSync(path.join(base, 'pages/watch-new/watch-new-entry.wxml'))
        ).toBeTruthy();
      }, 180000);
    });
  }
);
