import { CssSelector, R3UsedDirectiveMetadata } from '@angular/compiler';

export interface MatchedDirective {
  selector: CssSelector;
  directiveMetadata: R3UsedDirectiveMetadata;
}
