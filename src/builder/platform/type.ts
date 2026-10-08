export interface PlatformFileExtname {
  style: string;
  logic: string;
  content: string;
  contentTemplate: string;
  /**
   * 渲染层脚本扩展名。各平台方言不同：wx=.wxs / qq=.qs / zfb|dd|bd|zjtd|ks|xhs|fs=.sjs / jd=.jds。
   */
  wxs: string;
  config?: string;
}
