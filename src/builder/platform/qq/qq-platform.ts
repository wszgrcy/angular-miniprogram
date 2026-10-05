import * as fs from 'fs-extra';
import * as path from 'path';
import { wxStyleProjectDefaults } from '../mp-project-defaults';
import {
  BuildPlatform,
  type CustomTabbarSpec,
  type MpPlatformConfig,
} from '../platform';

export class QqBuildPlatform extends BuildPlatform {
  packageName = 'qq';
  customTabbar: CustomTabbarSpec = { dir: 'custom-tab-bar', flag: 'custom' };

  mpConfig: MpPlatformConfig = {
    projectFilename: 'project.config.json',
    subPackageKey: 'subpackages',
    projectDefaults: wxStyleProjectDefaults,
    capabilities: {
      subpackages: true,
      independentSubpackages: true,
      workers: true,
      darkmode: true,
      customTabbar: true,
    },
  };

  globalObject = 'qq';
  globalVariablePrefix = 'qq.__window';
  fileExtname = {
    style: '.qss',
    logic: '.js',
    content: '.qml',
    wxs: '.qs',
    contentTemplate: '.qml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    qq.__global = qq.__window = obj;`;
}
