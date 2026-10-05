import * as fs from 'fs-extra';
import * as path from 'path';
import { baiduProjectDefaults } from '../mp-project-defaults';
import { BuildPlatform, type MpPlatformConfig } from '../platform';

export class BdZnBuildPlatform extends BuildPlatform {
  packageName = 'bd';
  mpConfig: MpPlatformConfig = {
    projectFilename: 'project.swan.json',
    subPackageKey: 'subPackages',
    projectDefaults: baiduProjectDefaults,
    capabilities: {
      subpackages: true,
      independentSubpackages: true,
      darkmode: true,
      customTabbar: false,
    },
  };

  globalObject = 'swan';
  globalVariablePrefix = 'swan.__window';
  fileExtname = {
    style: '.css',
    logic: '.js',
    content: '.swan',
    wxs: '.sjs',
    contentTemplate: '.swan',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    swan.__global = swan.__window = obj;`;
}
