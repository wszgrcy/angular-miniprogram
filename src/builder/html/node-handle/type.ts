export type MatchedMeta = MatchedComponent | MatchedDirective;
export interface MatchedComponent {
  isComponent: true;
  outputs: string[];
  selector: string;
  filePath: string;
  exportPath: string;
  className: string;
  listeners: string[];
  inputs: string[];
  properties: string[];
}
export interface MatchedDirective {
  isComponent: false;
  listeners: string[];
  properties: string[];
  inputs: string[];
  outputs: string[];
}
