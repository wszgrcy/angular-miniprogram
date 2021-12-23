import { runScript } from './run-script';

export function libraryTemplateResolve(
  content: string,
  directivePrefix: string,
  eventListConvert: (name: string[]) => string,
  templateInterpolation: [string, string],
  fileExtname: any
) {
  return runScript(`(()=>{return \`${content}\`})()`, {
    directivePrefix,
    eventListConvert,
    templateInterpolation,
    fileExtname,
  });
}
