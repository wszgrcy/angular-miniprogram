export interface ExtraTemplateData {
  template: string;
  useComponents?: Record<string, string>;
  templateName?: string;
  outputPath?: string;
}

export interface ExportLibraryComponentMeta {
  id: string;
  content: string;
  contentTemplate?: string;
  style?: string;
  className: string;
  libraryPath: string;
  useComponents: Record<string, string>;
  moduleId: string;
}
export interface LibraryComponentEntryMeta extends ExportLibraryComponentMeta {
  importPath: string;
  context: string;
  contextPath: string;
}
