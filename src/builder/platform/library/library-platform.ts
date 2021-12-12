import { Injectable } from 'static-injector';
import { BuildPlatform } from '../platform';
import { LibraryTransform } from './library.transform';

export const ERROR_VALUE="!!!library_can_not_use!!!"
@Injectable()
export class LibraryBuildPlatform extends BuildPlatform {
  globalObject = ERROR_VALUE;
  globalVariablePrefix = ERROR_VALUE;
  fileExtname = {
    style: ERROR_VALUE,
    logic: ERROR_VALUE,
    content: ERROR_VALUE,
    contentTemplate: ERROR_VALUE,
  };
  importTemplate = ERROR_VALUE;
  constructor(public templateTransform: LibraryTransform) {
    super(templateTransform);
  }
}
