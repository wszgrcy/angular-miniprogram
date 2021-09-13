import { AssetPattern } from '@angular-devkit/build-angular';

export interface PagePattern extends Exclude<AssetPattern, string> {
  /** 入口名 */
  entryName: string;
  /** 匹配文件,相对于input */
  fileName: string;
  /** 要输出的js出口 */
  output: string;
  /** 绝对路径,path.join */
  src: string;
  /** 导出wxml(html)文件 */
  outputWXML: string;
  /** 导出wxss(css)文件 */
  outputWXSS: string;
  /** 导出wxs(js)文件 */
  outputWXS: string;
}
