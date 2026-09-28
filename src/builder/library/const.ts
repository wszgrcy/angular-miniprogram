export const LIBRARY_OUTPUT_ROOTDIR = 'library';
// 旧版用于 d.ts 内联标记的三个后缀（`_Listeners` / `_Properties` /
// `_OutputPath`）已随 sidecar 重构删除，不再做版本兼容。
// 库元数据现在统一走 `mp-library-meta.json`，见 `library-meta-schema.ts`。
export const LIBRARY_COMPONENT_METADATA_SUFFIX = 'ExtraData';
export const GLOBAL_TEMPLATE_SUFFIX = 'Global_Template';
