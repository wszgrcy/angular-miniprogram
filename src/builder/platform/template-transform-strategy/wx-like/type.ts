import { UseComponent } from '../../../html/type';

export interface MetaCollection {
  method: Set<string>;
  listeners: { methodName: string; index: number; eventName: string }[];
  localPath: Set<UseComponent>;
  libraryPath: Set<UseComponent>;
}
