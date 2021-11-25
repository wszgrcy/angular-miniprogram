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

export interface ComponentMetaFromLibrary {
  isComponent: true;
  exportPath: string;
}
export interface DirectiveMetaFromLibrary {
  isComponent: false;
  listeners: string[];
}
export type MetaFromLibrary =
  | ComponentMetaFromLibrary
  | DirectiveMetaFromLibrary;

export interface UseComponent {
  selector: string;
  className: string;
  path: string;
}
