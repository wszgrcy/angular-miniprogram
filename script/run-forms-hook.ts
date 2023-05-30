import path from 'path';
import { runSchematics } from '../schematics/internal/schematics-runner';
runSchematics(
  'forms-hook',
  {
    source: 'https://github.com/angular/angular.git',
    branch: '16.0.1',
    savePath: path.resolve(process.cwd(), '.temp-git/forms-hook'),
    sourceInSchematicsPath: '.temp-git/forms-hook',
    subDir: 'packages/forms',
  },
  { dryRun: false }
);
