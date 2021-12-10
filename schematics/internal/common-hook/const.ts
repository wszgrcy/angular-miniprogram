import path from 'path';

export const SCHEMATICS_COMMON_LIBRARY_PATH = `src/library/common`;
export const SCHEMATICS_ANGULAR_COMMON_PATH = `.temp-git/common-hook/packages/common`;
export const ANGULAR_COMMON_PATH = path.resolve(
  process.cwd(),
  SCHEMATICS_ANGULAR_COMMON_PATH
);
