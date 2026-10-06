import * as fs from 'fs-extra';
import * as path from 'path';
import { wxStyleProjectDefaults } from '../mp-project-defaults';
import {
  BuildPlatform,
  type CustomTabbarSpec,
  type MpPlatformConfig,
} from '../platform';

export class JdBuildPlatform extends BuildPlatform {
  packageName = 'jd';
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

  globalObject = 'jd';
  globalVariablePrefix = 'jd.__window';
  fileExtname = {
    style: '.jxss',
    logic: '.js',
    content: '.jxml',
    wxs: '.jds',
    contentTemplate: '.jxml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    jd.__global = jd.__window = obj;`;
}
