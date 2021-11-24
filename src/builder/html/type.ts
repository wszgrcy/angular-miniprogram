export interface ComponentBuildMeta {
  content: string;
  template: string;
  meta: string;
}
export interface StyleHookData {
  sizeOffset: number;
  content: string;
  styles: string[];
  styleUrls: string[];
}

export interface MatchedComponentMeta {
  outputs: string[];
  isComponent: true;
  moduleName: string;
  filePath: string;
  selector: string;
}
export interface MatchedDirectiveMeta {
  listeners: string[];
}
