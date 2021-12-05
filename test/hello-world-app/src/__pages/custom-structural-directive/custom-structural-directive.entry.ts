import { pageStartup } from 'angular-miniprogram';

import { CustomStructuralDirectiveComponent } from './custom-structural-directive.component';
import { CustomStructuralDirectiveModule } from './custom-structural-directive.module';

pageStartup(
  CustomStructuralDirectiveModule,
  CustomStructuralDirectiveComponent
);
