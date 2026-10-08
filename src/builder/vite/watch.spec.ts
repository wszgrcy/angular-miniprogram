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
import { memoize } from '../../../test/util/memoize';
import { PlatformType } from '../platform/platform';
import { runViteBuilder } from './index';

const angularConfig = {
  ...DEFAULT_ANGULAR_CONFIG,
  platform: PlatformType.wx,
  watch: true,
};

/**
 * Vite watch 模式。小程序没有浏览器 dev-server——微信开发者工具本身就是「服务器」，它盯 dist 目录。
 * 所以 watch 就是 builder 监听源码重构建写 dist，DevTools 自动刷新。
 * 实现上不用 Vite 原生 watch（Rolldown watch 不支持动态加 input），而是「发现变动就重算入口 + 重跑一次 vite.build」。
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
          normalize(join(root, 'src', '__pages')),
        );
        list.push(
          ...(await myTestProjectHost.getFileList(
            normalize(join(root, 'src', '__components')),
          )),
        );
        await myTestProjectHost.importPathRename(list);
        await myTestProjectHost.moveDir(ALL_PAGE_NAME_LIST, '__pages', 'pages');
        await myTestProjectHost.moveDir(
          COMP_LIST,
          '__components',
          'components',
        );
        await myTestProjectHost.addPageEntry(ALL_PAGE_NAME_LIST);
      };

      const readOut = (base: string, rel: string) =>
        fs.readFileSync(path.join(base, rel), 'utf8');

      /**
       * 「改模板能重出 wxml」与「新增入口能被拉进来」是同一次 watch 会话的两个侧面。
       * 两处改动在同一个批次里写完，所以只会触发一轮重建。
       */
      const session = memoize(async () => {
        await setup();
        const marker = 'VITE_WATCH_MARKER';
        const htmlFile = 'src/pages/control-flow/control-flow.component.html';
        let watchNewBefore = true;
        let sourceHasMarkerBefore = true;

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
                watchNewBefore = fs.existsSync(
                  path.join(base, 'pages/watch-new/watch-new-entry.wxml'),
                );
                /**
                 * 改的是源模板。产物里带着改写后的 `[nodeList[1][index]]` 这类片段，
                 * 当模板喂回去就是展开语法，增量构建必然「Parser Error: Unexpected token ...」。
                 */
                const source = harness.readFile(htmlFile);
                sourceHasMarkerBefore = source.includes(marker);
                const appJson = JSON.parse(harness.readFile('src/app.json'));
                appJson.pages = [
                  ...(appJson.pages || []),
                  'pages/watch-new/watch-new-entry',
                ];
                void harness.writeFiles({
                  [htmlFile]: `${source}\n${marker}`,
                  'src/app.json': JSON.stringify(appJson),
                  'src/pages/watch-new/watch-new.entry.ts': `import { Component } from '@angular/core';

@Component({
  selector: 'app-watch-new',
  standalone: true,
  template: '<view>{{ title }}</view>',
})
export class WatchNewComponent {
  title = 'watch-new';
}

export default WatchNewComponent;
`,
                });
              }
              return of(result);
            }),
            take(2),
            skip(1),
          )
          .toPromise();

        const last = results[results.length - 1].result;
        const base = last!.baseOutputPath!;
        return {
          success: last?.success,
          watchNewBefore,
          sourceHasMarkerBefore,
          controlFlowWxml: readOut(
            base,
            'pages/control-flow/control-flow-entry.wxml',
          ),
          libComp: fs.existsSync(
            path.join(
              base,
              'library/test-library/lib-comp1-component/lib-comp1-component.js',
            ),
          ),
          watchNewJs: fs.existsSync(
            path.join(base, 'pages/watch-new/watch-new-entry.js'),
          ),
          watchNewWxml: fs.existsSync(
            path.join(base, 'pages/watch-new/watch-new-entry.wxml'),
          ),
        };
      });

      it('watch 下改模板能重新产出 wxml', async () => {
        const r = await session();
        expect(r.sourceHasMarkerBefore).toBe(false);
        // 先确认构建成功：少了这一步，构建失败只会变成一个莫名其妙的 path.join(undefined) TypeError
        expect(r.success).toBe(true);
        expect(r.controlFlowWxml).toContain('VITE_WATCH_MARKER');

        // watch 轮次不能只重编改动的页面：库组件产物（走 library-meta 那条旁路）也得在。
        expect(r.libComp).toBe(true);
      }, 180000);

      it('watch 期间新增入口能被拉进来', async () => {
        const r = await session();
        expect(r.watchNewBefore).toBe(false);
        expect(r.success).toBe(true);
        expect(r.watchNewJs).toBe(true);
        expect(r.watchNewWxml).toBe(true);
      }, 180000);
    });
  },
);
