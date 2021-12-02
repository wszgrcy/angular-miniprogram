import path from 'path';
import { runSchematics } from '../schematics/internal/schematics-runner';
runSchematics(
  'forms-hook',
  {
    source: 'https://github.com/angular/angular.git',
    branch: '13.0.2',
    savePath: path.resolve(process.cwd(), '.temp-git/forms-hook'),
    sourceInSchematicsPath: '.temp-git/forms-hook',
  },
  { dryRun: false }
);
