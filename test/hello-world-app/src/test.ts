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
const context = (require as any).context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
startupTest();
