export interface MatchedDirective {
  isComponent: boolean;
  listeners?: string[];
  outputs?: string[];
  moduleName?: string;
  selector?: string;
  filePath?: string;
}
