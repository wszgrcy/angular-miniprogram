import { MiniProgramCoreFactory as BaseFactory } from 'angular-miniprogram/platform/default';

class MiniProgramCoreFactory extends BaseFactory {}
export const MiniProgramCore = new MiniProgramCoreFactory();

/**
 * 平台包是 `platform/wx` 的替身（构建时按平台整体替换包名），所以这里 `export *` 全量转发 `default`，
 * 不手写名单——手抄名单漏一个名字，该平台构建就报 `[MISSING_EXPORT]`。本地 `MiniProgramCore`
 * 显式导出优先于 `export *`，不会被 `default` 那份盖掉。
 */
export * from 'angular-miniprogram/platform/default';
