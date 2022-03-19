import { platformMiniProgram } from 'angular-miniprogram';
import { startupTest } from 'angular-miniprogram/karma/test';
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
describe('describe1', () => {
  it('it1', () => {
    console.log('main');
    expect(true).toBe(true);
  });
});
platformMiniProgram()
  .bootstrapModule(MainTestModule)
  .then((e) => {
    console.log(e);
  });
startupTest();
