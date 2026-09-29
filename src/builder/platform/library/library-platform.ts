import { BuildPlatform } from '../platform';

export const ERROR_VALUE = '!!!library_can_not_use!!!';
export class LibraryBuildPlatform extends BuildPlatform {
  globalObject = ERROR_VALUE;
  globalVariablePrefix = ERROR_VALUE;
  fileExtname = {
    style: '${fileExtname.style}',
    logic: '${fileExtname.logic}',
    content: '${fileExtname.content}',
    contentTemplate: '${fileExtname.contentTemplate}',
  };
  importTemplate = ERROR_VALUE;
}
