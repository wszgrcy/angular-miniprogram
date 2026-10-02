import * as path from 'path';

/**
 * `test-library` 这份夹具的构建参数与落点，`globalSetup` 与
 * `library.spec.ts` 共用一份，避免两处各写一遍然后慢慢漂。
 */

/** fixture 工程根 */
export const APP_ROOT = path.resolve(__dirname, 'hello-world-app');

/** 与 angular.json 里 `projects.test-library` 的 target 名一致 */
export const LIBRARY_PROJECT_NAME = 'test-library';

/** 传给 `angular-miniprogram:library` builder 的 options */
export const LIBRARY_BUILD_OPTIONS = {
  project: 'projects/test-library/ng-package.json',
  tsConfig: 'projects/test-library/tsconfig.lib.json',
};

/**
 * 库产物落点。来自 ng-package.json 的 `dest: ../../dist/test-library`，
 * 在模板目录里，被 SANDBOX_EXCLUDE 排除在 sandbox 之外，不会污染构建输入。
 */
export const LIBRARY_OUTPUT = path.join(APP_ROOT, 'dist/test-library');

/** 装进 fixture `node_modules` 的那份副本，app 构建读的是它 */
export const INSTALLED_LIBRARY = path.join(
  APP_ROOT,
  'node_modules/test-library',
);
