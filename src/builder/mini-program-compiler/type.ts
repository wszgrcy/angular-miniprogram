import { MetaCollection } from './meta-collection';

export interface ComponentMetaFromLibrary {
  isComponent: true;
  exportPath: string;
  listeners: string[];
  properties: string[];
}
export interface DirectiveMetaFromLibrary {
  isComponent: false;
  listeners: string[];
  properties: string[];
}
export type MetaFromLibrary =
  | ComponentMetaFromLibrary
  | DirectiveMetaFromLibrary;

export interface UseComponent {
  selector: string;
  className: string;
  path: string;
}
export interface ResolvedDataGroup {
  style: Map<string, string[]>;
  outputContent: Map<string, string>;
  useComponentPath: Map<
    string,
    {
      localPath: UseComponent[];
      libraryPath: UseComponent[];
    }
  >;
  otherMetaCollectionGroup: Record<string, MetaCollection>;
}
