import * as fs from 'fs-extra';
import * as path from 'path';
import { ttStyleProjectDefaults } from '../mp-project-defaults';
import { BuildPlatform, type MpPlatformConfig } from '../platform';
/**
 * 飞书小程序适配。语法与抖音同源（模板 `.ttml`、样式 `.ttss`、指令 `tt:`），连宿主命名空间都沿用 `tt`，
 * 所以 `globalObject` 不能改成 `fs`——运行时所有 `tt.xxx` API 调用都靠它拼出来。
 * 平台区分度留给 `packageName` 与 `__MP_FS__`。
 */
export class FsBuildPlatform extends BuildPlatform {
  packageName = 'fs';
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
  };
  importTemplate = `${fs
    .readFileSync(path.resolve(__dirname, '../template/app-template.js'))
    .toString()};
    tt.__global = tt.__window = obj;`;
}
