import { runScript } from './run-script';

export function stringConfigToObjectConfig(content: string) {
  return runScript(`(()=>{return ${content}})()`);
}
