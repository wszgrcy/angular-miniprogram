import * as fs from 'fs-extra';
import * as path from 'path';
import { ttStyleProjectDefaults } from '../mp-project-defaults';
import { BuildPlatform, type MpPlatformConfig } from '../platform';
/** 字节小程序适配 */
export class ZjBuildPlatform extends BuildPlatform {
  packageName = 'zjtd';
  mpConfig: MpPlatformConfig = {
    projectFilename: 'project.config.json',
    subPackageKey: 'subpackages',
    projectDefaults: ttStyleProjectDefaults,
    capabilities: { subpackages: true, customTabbar: false },
  };

  globalObject = 'tt';
  globalVariablePrefix = 'tt.__window';
  fileExtname = {
    style: '.ttss',
    logic: '.js',
    content: '.ttml',
    wxs: '.sjs',
    contentTemplate: '.ttml',
    config: '.json',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    tt.__global = tt.__window = obj;`;
}
