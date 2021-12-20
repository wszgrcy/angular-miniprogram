import { UseComponent } from './type';

export class MetaCollection {
  listeners: { methodName: string; index: number; eventName: string[] }[] = [];
  localPath: Set<UseComponent> = new Set();
  libraryPath: Set<UseComponent> = new Set();
  templateList: { name: string; content: string }[] = [];
  merge(other: MetaCollection) {
    this.listeners.push(...other.listeners);
    other.localPath.forEach((item) => {
      this.localPath.add(item);
    });
    other.libraryPath.forEach((item) => {
      this.libraryPath.add(item);
    });
    this.templateList.push(...other.templateList);
  }
}
