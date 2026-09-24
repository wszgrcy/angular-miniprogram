import {
  type NodeQueryOption,
  type ScriptFunction,
  type FileQueryLayer,
  completePromise,
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
    angularRepo,    [
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

  /**
   * 必须校验 data 完整性。
   *
   * ## 为什么
   *
   * `gitClone` 的缓存跳过条件是「`<gitCloneTmpDir>/<hash>/packages`
   * 存在且非空」，**不校验内容、也不校验上次 clone 是否成功**：
   *
   *   if (!(await exists(u)) || !(await list(u)).length) { ...clone... }
   *
   * 于是首次 clone 中途失败（网络问题）时，git 已经把 `packages/`
   * 目录建出来了。之后每次 sync：
   *
   *   1. 看到 `packages/` 存在且非空 → 跳过整个 clone
   *   2. 从不完整的目录里读出空 / 残缺的 `data`
   *   3. 下面的 for 循环无东西可写
   *   4. **秒级完成、退出码 0、不报任何错**
   *
   * 实测确认：手动在缓存里建个 `packages/forms` 后，sync 1 秒
   * 返回 0，完全不访问网络。
   *
   * 没有这道校验，sync 的失败是**静默的**——比报错危险得多。
   */
  const syncedKeys = Object.keys(data);
  const REQUIRED_KEYS = [
    'forms/src/forms.ts',
    'forms/src/directives.ts',
    'forms/src/validators.ts',
  ];
  const missingKeys = REQUIRED_KEYS.filter((k) => !syncedKeys.includes(k));

  if (syncedKeys.length === 0 || missingKeys.length > 0) {
    throw new Error(
      [
        `sync 数据不完整：共拿到 ${syncedKeys.length} 个文件，缺少 ` +
          `[${missingKeys.join(', ')}]。`,
        '',
        '常见原因：上次 `git clone` 中途失败（网络 / SSL），但',
        'code-recycle 的缓存目录已经残留了 `packages/` 子目录，',
        '导致本次 sync 直接跳过 clone 并读到空数据。',
        '',
        '修复办法（任选其一）：',
        '  1. 删掉 code-recycle 的 gitClone 缓存目录后重试。',
        '     缓存路径形如 <tmp>/<hash>/packages，可用',
        '     `ls <tmp> | grep -v "."` 或直接清理系统临时目录。',
        '  2. 用本地已有的 Angular clone：',
        '     `ANGULAR_REPO=/path/to/angular npm run sync`',
        '     （脚本已支持，git clone 对本地路径同样有效）',
      ].join('\n')
    );
  }

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

  for (const key in data) {
    if (exclude.includes(key)) {
      continue;
    }
    // 直接写入。原先这里有一个 `key.startsWith('common')` 分支做
    // `@angular/common` → `angular-miniprogram/common` 的重定根与
    // 跳 entry point 路径改写，但 `packages/common` 已不再 sync，
    // 该分支永不命中，已删。
    await completePromise(host.write(path.normalize(key), data[key]));
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
