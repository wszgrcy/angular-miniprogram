import { join, normalize, virtualFs } from '@angular-devkit/core';
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
} from '../../../test/util/file';
import { analyzeFileInjection } from '../../../test/util/template-inject-ast';
import { PlatformType } from '../platform/platform';
import { runViteBuilder as runBuilder } from '../vite';

/**
 * 端到端校验 changeComponent 在真实构建产物里对组件 template 函数的改写。
 *
 * 全部走 AST（见 test/util/template-inject-ast.ts）。不用字符串/正则匹配：
 * webpack 在不同 chunk 里对同一份注入代码排版不同（entry 是 `}if(rf & 2){`，
 * vendor 会排成 `} if (rf & 2) {`，`;;` 会变成 `; ;`），字面量匹配会漏，
 * 放宽空白又容易误判。
 */
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('component-template-inject: 构建产物 AST 校验', () => {
    it('每个有 rf & 1 的组件模板都被注入且只注入一次', async () => {
      const angularConfig = {
        ...DEFAULT_ANGULAR_CONFIG,
        platform: PlatformType.wx,
        sourceMap: false,
      };
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
        ALL_COMPONENT_NAME_LIST,
        '__components',
        'components'
      );
      await myTestProjectHost.addPageEntry(ALL_PAGE_NAME_LIST);
      harness.useTarget('build', angularConfig);
      const result = await harness.executeOnce();
      expect(result.result?.success).toBeTruthy();

      const files = await myTestProjectHost.getFileList(
        join(root, DEFAULT_ANGULAR_CONFIG.outputPath)
      );

      const allComponents: {
        file: string;
        name: string;
        branch: string;
      }[] = [];
      const missed: string[] = [];
      const malformed: string[] = [];
      let strayCalls = 0;
      let branchA = 0;
      let branchB = 0;

      for (const f of files) {
        const p = String(f);
        if (!p.endsWith('.js')) {
          continue;
        }
        const content = virtualFs.fileBufferToString(
          await harness.host.read(normalize(p)).toPromise()
        );
        const report = analyzeFileInjection(p, content);
        strayCalls += report.strayCalls;

        for (const c of report.components) {
          // 空模板（连 rf & 1 都没有）没有可注入位置，属正常跳过
          if (!c.hasInitBlock) {
            continue;
          }
          allComponents.push({
            file: p.split('/').slice(-1)[0],
            name: c.componentName,
            branch: c.branch ?? 'NONE',
          });
          if (c.branch === null) {
            missed.push(`${c.componentName} (${p})`);
            continue;
          }
          if (c.branch === 'A') {
            branchA++;
          } else {
            branchB++;
          }
          if (!c.isLastStatement || c.propertyChangeCount !== 1) {
            malformed.push(
              `${c.componentName} (${p}) count=${c.propertyChangeCount} last=${c.isLastStatement}`
            );
          }
        }
      }

      // 核心不变式：凡是有 rf & 1 的组件模板，都必须被注入。
      // 之前 OutsideTemplateComponent 就是因为选择器把 template 解析成了
      // StringLiteral 而被静默跳过，这条断言就是用来兜住这类漏注入的。
      expect({ missed, malformed }).toEqual({
        missed: [],
        malformed: [],
      });
      // 两条分支都得被真实命中，否则说明其中一条已失去覆盖
      expect(branchA).toBeGreaterThan(0);
      expect(branchB).toBeGreaterThan(0);
      // 注入点不能跑到 rf & 2 之外
      expect(strayCalls).toBe(0);
      // 确实检查到了组件，不是空跑
      expect(allComponents.length).toBe(branchA + branchB);
      expect(allComponents.length).toBeGreaterThan(10);
    }, 180000);
  });
});
