/* eslint-disable no-console */
import vm from 'vm';

export function runScript(code: string, context?: vm.Context) {
  try {
    return vm.runInNewContext(code, context);
  } catch (error) {
    console.error('运行脚本错误');
  }
}
