import { bootstrapApplication } from 'angular-miniprogram';
import { startupTest } from 'angular-miniprogram/karma/client';

let jasmineRequire = require('jasmine-core/lib/jasmine-core/jasmine.js');

function bootWithoutGlobals() {
  let jasmineInterface;
  const jasmine = jasmineRequire.core(jasmineRequire);
  const env = jasmine.getEnv({ suppressLoadErrors: true });
  jasmineInterface = jasmineRequire.interface(jasmine, env);

  return jasmineInterface;
}

let obj = bootWithoutGlobals();
for (const key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    (wx as any).__global[key] = obj[key];
  }
}
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;

bootstrapApplication().catch((e) => console.error(e));

// Then we find all the tests.
// 小程序端没有 webpack 的 require.context，这里写出来是给构建期的
// require-context-shim 插件看的，它会把已发现的 spec 列表改写成同步
// require 映射。直接跑（不经本仓库 builder）是不会有这个能力的。
const context = (require as any).context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

// 因为ng修改了test的获取实例的时机,改为拼在最后面,而启动操作要在最后面的后面,所以使用了延时(网页端正常是因为spec=>component,而小程序目前设计是component spec平行)
setTimeout(() => {
  startupTest();
}, 1000);
