import {
  type NodeQueryOption,
  type ScriptFunction,
  type FileQueryLayer,
  completePromise,
  fileBufferToString,
  stringToFileBuffer,
} from '@code-recycle/cli';

// 注：原先这里的 `templateName` 常量与 `getTemplateNameExpressionStr()`
// 是给 common 那 4 个指令 patch 拼表达式用的，patch 已移除，故一并删除。
let fn: ScriptFunction = async (util, rule, host, injector) => {
  let path = util.path;

  /**
   * Angular 仓库地址。默认走 GitHub，可以用 `ANGULAR_REPO` 指向本地已有的 clone，
   * 离线或内网环境下用得上（`git clone` 对本地路径同样有效）。
   */
  const angularRepo =
    process.env.ANGULAR_REPO || 'https://github.com/angular/angular.git';

  let data = await rule.os.gitClone(
    angularRepo,
    [
      '/packages/common',
      '/packages/forms',
      '!/packages/common/test',
      '!/packages/forms/test',
      /**
       * 不再同步 `packages/common/http`。
       *
       * 小程序只需要替换传输层，而 Angular 已经把 `HttpBackend` 设计成
       * 可插拔接缝——`platform/http/MiniprogramHttpBackend` 用
       * `wx.request` 实现它就够了。整个 http 包（约 9000 行）里
       * xhr / jsonp / xsrf / transfer_cache / fetch 在小程序里全是死代码。
       *
       * 现在 `angular-miniprogram/common/http` 改为薄再导出
       * `@angular/common/http`，对外 API 不变，源码不再 vendor。
       */
      '!/packages/common/http',
      /**
       * 整个 `packages/common` 也不再同步。
       *
       * 逐条实测后确认那些改动全部不必要（详见
       * src/library/common/public_api.ts 的注释）：DOCUMENT 是 core 的
       * 同一个 token、官方 22 已无 zone.js、__templateName 可在
       * fork 的 lViewToWXView 里从 declTNode 等价推导。
       *
       * `angular-miniprogram/common` 现为指向 @angular/common 的薄再导出。
       */
      '!/packages/common',
      '!**/*.bazel',
      '!**/*spec.ts',
      '!**/*.js',
      '!**/*.md',
    ],
    'packages',
    'branch',
    // Angular 21 起 tag 改成带 `v` 前缀（20.x 及以前是裸版本号）
    'v22.1.7'
  );
  let exclude = [
    'forms/src/directives/default_value_accessor.ts',
    'forms/src/directives/checkbox_value_accessor.ts',
    // 'forms/src/directives/number_value_accessor.ts',
    'forms/src/directives/radio_control_value_accessor.ts',
    // 'forms/src/directives/range_value_accessor.ts',
    // 'forms/src/directives/select_control_value_accessor.ts',
    // 'forms/src/directives/select_multiple_control_value_accessor.ts',
    'forms/src/directives.ts',
    'forms/src/forms.ts',
  ];

  /**
   * Angular 19 起 `packages/common/http` 内部改用相对路径（如 `../../index`）
   * 引用 `@angular/common`（18 及以前是直接写 `@angular/common`）。
   * 直接保留相对路径会让 ng-packagr 跨 entry point 取源码，报
   * TS6059（不在 rootDir 下），因此统一改写为库的公开入口。
   */
  function rewriteCrossEntryPointImports(filePath: string, content: string) {
    return content.replace(
      /(from\s+')((?:\.\.\/)+index)(')/g,
      (match, prefix: string, spec: string, suffix: string) => {
        const resolved = path
          .normalize(path.join(path.dirname(filePath), spec))
          .split('\\')
          .join('/');
        if (/^common(\/[^/]+)*\/index$/.test(resolved)) {
          const entryDir = resolved.replace(/\/index$/, '');
          return `${prefix}angular-miniprogram/${entryDir}${suffix}`;
        }
        return match;
      }
    );
  }

  for (const key in data) {
    if (exclude.includes(key)) {
      continue;
    }
    let buffer = data[key];
    if (key.startsWith('common')) {
      let content = fileBufferToString(buffer).replace(
        /@angular\/common/g,
        `angular-miniprogram/common`
      );
      content = rewriteCrossEntryPointImports(key, content);
      buffer = stringToFileBuffer(content);
    }
    await completePromise(host.write(path.normalize(key), buffer));
  }
  let list = await util.changeList([
    /**
     * 原先这里有 7 条针对 `./common/**` 的 AST patch：
     *   - ng_for_of / ng_if / ng_switch / ng_template_outlet 注入 __templateName
     *   - common.ts / directives/index.ts / pipes/index.ts 删 i18n 与 NgComponentOutlet
     *
     * 已全部移除：`packages/common` 不再 sync（见上方 gitClone 排除列表），
     * `angular-miniprogram/common` 现为指向官方 @angular/common 的薄再导出。
     *
     * __templateName 改由 fork 自己的 lViewToWXView 从
     * tView.declTNode.localNames[0] 推导（实测与 patch 读的是同一个 TNode），
     * 覆盖见 src/library/platform/template-name-coverage.spec.ts。
     */
  ]);
  await util.updateChangeList(list);
};
export default fn;
