import { CssSelector, R3UsedDirectiveMetadata } from '@angular/compiler';

export interface MatchedDirective {
  selector: CssSelector;
  meta: { directive: R3UsedDirectiveMetadata; directiveMeta: any };
}
