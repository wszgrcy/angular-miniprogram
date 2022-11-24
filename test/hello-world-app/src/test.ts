import { platformMiniProgram } from 'angular-miniprogram';
import { startupTest } from 'angular-miniprogram/karma/client';
import { MainTestModule } from './main-test.module';
import 'zone.js';

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

platformMiniProgram()
  .bootstrapModule(MainTestModule)
  .then((e) => {});
// Then we find all the tests.
// And load the modules.
// 因为ng修改了test的获取实例的时机,改为拼在最后面,而启动操作要在最后面的后面,所以使用了延时(网页端正常是因为spec=>component,而小程序目前设计是component spec平行)
setTimeout(() => {
  startupTest();
}, 1000);
