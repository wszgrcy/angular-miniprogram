export const LIBRARY_OUTPUT_ROOTDIR = 'library';

/**
 * 这里**只剩**产物根目录一个常量。
 *
 * 历史上这里还有几个「内联标记后缀」：
 *
 *   - `_Listeners` / `_Properties` / `_OutputPath` —— 拼进 `.d.ts`
 *   - `_ExtraData`（`LIBRARY_COMPONENT_METADATA_SUFFIX`）—— 拼进库 JS 产物
 *   - `Global_Template`（`GLOBAL_TEMPLATE_SUFFIX`）—— 拼进库 JS 产物
 *
 * 三条通道都已删除，不做版本兼容。库构建现在只做一件事：
 * 算元数据 → 写 `<库根>/mp-library-meta.json`，见 `library-meta-schema.ts`。
 * 运行时 hook（`amp.propertyChange`）与 wxml 产出全部归主构建。
 */
