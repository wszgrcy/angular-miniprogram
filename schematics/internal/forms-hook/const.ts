import { join, normalize } from '@angular-devkit/core';
import path from 'path';

export const SCHEMATICS_FORMS_LIBRARY_PATH = `src/library/forms`;
export const SCHEMATICS_ANGULAR_FORMS_PATH = `.temp-git/forms-hook/packages/forms`;
export const ANGULAR_FORMS_PATH = path.resolve(
  process.cwd(),
  SCHEMATICS_ANGULAR_FORMS_PATH
);
export const SCHEMATICS_FORMS_LIBRARY_HOOK_FILE_LIST = [
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/default_value_accessor.ts'
  ),
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/checkbox_value_accessor.ts'
  ),
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/number_value_accessor.ts'
  ),
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/radio_control_value_accessor.ts'
  ),
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/range_value_accessor.ts'
  ),
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/select_control_value_accessor.ts'
  ),
  join(
    normalize(SCHEMATICS_FORMS_LIBRARY_PATH),
    'src/directives/select_multiple_control_value_accessor.ts'
  ),
  join(normalize(SCHEMATICS_FORMS_LIBRARY_PATH), 'src/directives.ts'),
  join(normalize(SCHEMATICS_FORMS_LIBRARY_PATH), 'src/forms.ts'),
];
