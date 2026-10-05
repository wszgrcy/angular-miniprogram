import * as fs from 'fs-extra';
import * as path from 'path';
import { alipayNormalizeAppJson, alipayNormalizeProjectJson } from '../mp-config-normalize';
import { alipayProjectDefaults } from '../mp-project-defaults';
import { BuildPlatform, type MpPlatformConfig } from '../platform';

export class DdBuildPlatform extends BuildPlatform {
  packageName = 'dd';
  mpConfig: MpPlatformConfig = {
    projectFilename: 'mini.project.json',
    projectOverrides: ['project.my.json'],
    subPackageKey: 'subPackages',
    projectDefaults: alipayProjectDefaults,
    capabilities: {
      subpackages: true,
      independentSubpackages: true,
      workers: true,
      darkmode: true,
      customTabbar: false,
    },
    normalizeAppJson: alipayNormalizeAppJson,
    normalizeProjectJson: alipayNormalizeProjectJson,
  };

  globalObject = 'dd';
  globalVariablePrefix = 'dd.__window';
  fileExtname = {
    style: '.acss',
    logic: '.js',
    content: '.axml',
    wxs: '.sjs',
    contentTemplate: '.axml',
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    dd.__global = dd.__window = obj;`;
}
