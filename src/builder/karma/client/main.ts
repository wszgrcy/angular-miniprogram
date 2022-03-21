import { KarmaClient } from './karma';
import { IO } from './platform';
import { StatusUpdater } from './updater';
import { createStartFn } from './adapter';
declare const KARMA_CLIENT_CONFIG: any;
export function startupTest() {
  const socket = new IO();
  const updater = new StatusUpdater(socket);
  let karmaClient = new KarmaClient(updater, socket);
  if (KARMA_CLIENT_CONFIG.captureConsole) {
    // patch the console
    var localConsole = console || {
      log: function () {},
      info: function () {},
      warn: function () {},
      error: function () {},
      debug: function () {},
    };
    const logMethods: (keyof Console)[] = [
      'log',
      'info',
      'warn',
      'error',
      'debug',
    ];
    var patchConsoleMethod = function (method: keyof Console) {
      var orig = localConsole[method];
      if (!orig) {
        return;
      }
      localConsole[method] = function () {
        karmaClient.log(method, Array.from(arguments));
        try {
          return Function.prototype.apply.call(orig, localConsole, arguments);
        } catch (error) {
          karmaClient.log('warn', [
            'Console method ' + method + ' threw: ' + error,
          ]);
        }
      } as any;
    };
    for (var i = 0; i < logMethods.length; i++) {
      patchConsoleMethod(logMethods[i]);
    }
  }
  createStartFn(karmaClient, jasmine.getEnv())();
}
