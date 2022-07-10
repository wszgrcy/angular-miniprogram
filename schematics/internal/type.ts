export interface SchematicsType {
  'forms-hook': FormsHookOptions;
  'common-hook': CommonHookOptions;
}
export type FormsHookOptions = HookOptions;
export type CommonHookOptions = HookOptions;

export interface HookOptions {
  branch: string;
  source: string;
  savePath: string;
  sourceInSchematicsPath: string;
  schematicPath: string;
  subDir: string;
}
