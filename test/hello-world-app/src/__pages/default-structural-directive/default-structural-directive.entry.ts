import { pageStartup } from 'angular-miniprogram';

import { DefaultStructuralDirectiveComponent } from './default-structural-directive.component';
import { DefaultStructuralDirectiveModule } from './default-structural-directive.module';

pageStartup(
  DefaultStructuralDirectiveModule,
  DefaultStructuralDirectiveComponent
);
