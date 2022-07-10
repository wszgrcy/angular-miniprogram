import path from 'path';
import { runSchematics } from '../schematics/internal/schematics-runner';
runSchematics(
  'common-hook',
  {
    source: 'https://github.com/angular/angular.git',
    branch: '14.0.5',
    savePath: path.resolve(process.cwd(), '.temp-git/common-hook'),
    sourceInSchematicsPath: '.temp-git/common-hook',
    subDir: 'packages/common',
  },
  { dryRun: false }
);
