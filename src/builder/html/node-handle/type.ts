export type MatchedMeta = MatchedComponent | MatchedDirective;
export interface MatchedComponent {
  isComponent: true;
  outputs: string[];
  selector: string;
  filePath: string;
  exportPath: string;
  className: string;
}
export interface MatchedDirective {
  isComponent: false;
  listeners: string[];
}
