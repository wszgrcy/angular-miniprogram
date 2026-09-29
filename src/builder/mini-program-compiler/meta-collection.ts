import { UseComponent } from './type';

export class MetaCollection {
  localPath: Set<UseComponent> = new Set();
  libraryPath: Set<UseComponent> = new Set();
  templateList: { name: string; content: string }[] = [];
  /** 本模板用到的 wxs 模块名，驱动 `.wxs` 资源产出 */
  wxsModules: Set<string> = new Set();
  merge(other: MetaCollection) {
    other.localPath.forEach((item) => {
      this.localPath.add(item);
    });
    other.libraryPath.forEach((item) => {
      this.libraryPath.add(item);
    });
    other.wxsModules.forEach((item) => {
      this.wxsModules.add(item);
    });
    this.templateList.push(...other.templateList);
  }
}
