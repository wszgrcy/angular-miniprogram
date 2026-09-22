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
import { runBuilder } from '../application';
import { PlatformType } from '../platform/platform';

/**
 * 端到端校验 changeComponent 在真实构建里对组件 template 函数的改写。
 *
 * 注入点有两分支（见 change-component.ts）：
 *  A. 组件已有 `if (rf & 2)` 更新块 -> 把 propertyChange 追加到该块最后一条语句之后，
 *     产物里表现为 `...; ;<mod>.propertyChange(` 的双分号形态。
 *  B. 组件没有更新块（只有 rf & 1）-> 在 init 块后补一个完整的
 *     `}if(rf & 2){<mod>.propertyChange(...)}`。
 *
 * 这里用真实 Angular 编译产物来断言，避免只靠手写 fixture 贴近真实 codegen。
 */
describeBuilder(runBuilder, BROWSER_BUILDER_INFO, (harness) => {
  describe('component-template-inject: 构建产物校验', () => {
    it('两条注入分支在真实构建中都被命中，且注入点都在 rf & 2 内', async () => {
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

      // 分支 B：整个新补的更新块（无空格写法，是注入代码独有的形态）
      let appendedUpdateBlock = 0;
      // 分支 A：追加到已有更新块最后一条语句之后（双分号 + propertyChange）
      let appendedIntoExistingBlock = 0;
      // 实际被注入的调用点总数（排除库自身的 function propertyChange 定义）
      let injectedCallSites = 0;
      // 落在 rf & 2 之外的注入调用点
      let strayCallSites = 0;

      for (const f of files) {
        const p = String(f);
        if (!p.endsWith('.js')) {
          continue;
        }
        const content = virtualFs.fileBufferToString(
          await harness.host.read(normalize(p)).toPromise()
        );

        // webpack 在不同 chunk 里对同一份注入代码的空格排版不一样
        // （entry chunk 是 `}if(rf & 2){`，vendor chunk 会被排成 `} if (rf & 2) {`，
        //  双分号也会变成 `; ;`），所以匹配一律放宽空白。
        appendedUpdateBlock += (
          content.match(
            /\}\s*if\s*\(\s*rf\s*&\s*2\s*\)\s*\{\s*[a-zA-Z_$][\w$.]*\.propertyChange\(/g
          ) || []
        ).length;
        appendedIntoExistingBlock += (
          content.match(/;\s*;\s*[a-zA-Z_$][\w$.]*\.propertyChange\(/g) || []
        ).length;

        const callRe = /[a-zA-Z_$][\w$.]*\.propertyChange\(/g;
        let m: RegExpExecArray | null;
        while ((m = callRe.exec(content)) !== null) {
          injectedCallSites++;
          // 注入的调用点必须处在某个 rf & 2 分支内部。
          // 不能只看固定长度的前文——长模板（比如 ngSwitchCase 一堆分支的）
          // 离最近的 rf & 2 能有 1600+ 字符，固定窗口会误判成 stray。
          // 这里定位到包裹它的那个 template 函数开头，要求这段区间里出现 rf & 2。
          const fnStart = content.lastIndexOf('_Template(rf, ctx)', m.index);
          const span =
            fnStart === -1
              ? content.slice(Math.max(m.index - 4000, 0), m.index)
              : content.slice(fnStart, m.index);
          if (!span.includes('rf & 2')) {
            strayCallSites++;
          }
        }
      }

      // 两条分支都得被真实命中，否则说明其中一条已经失去覆盖
      expect(appendedUpdateBlock).toBeGreaterThan(0);
      expect(appendedIntoExistingBlock).toBeGreaterThan(0);
      expect(injectedCallSites).toBe(
        appendedUpdateBlock + appendedIntoExistingBlock
      );
      expect(strayCallSites).toBe(0);
    }, 180000);
  });
});
