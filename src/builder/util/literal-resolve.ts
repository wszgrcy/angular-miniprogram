/* eslint-disable @typescript-eslint/no-explicit-any */
import { runScript } from './run-script';

export function literalResolve<T extends Record<string, any>>(
  content: string,
  options?: T
) {
  return runScript(`(()=>{return ${content}})()`, options);
}
