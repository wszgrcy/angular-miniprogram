export type MatchedMeta = MatchedComponent | MatchedDirective;
export interface MatchedComponent {
  isComponent: true;
  selector: string;
  filePath: string;
  exportPath: string;
  className: string;
  listeners: string[];
  properties: string[];
  inputs: string[];
  outputs: string[];
}
export interface MatchedDirective {
  isComponent: false;
  listeners: string[];
  properties: string[];
  inputs: string[];
  outputs: string[];
}
