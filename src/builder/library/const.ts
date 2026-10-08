export const LIBRARY_OUTPUT_ROOTDIR = 'library';

/**
 * 产物根目录常量。库构建只做一件事：算元数据 → 写 `<库根>/mp-library-meta.json`，
 * 见 `library-meta-schema.ts`。运行时 hook 与 wxml 产出全部归主构建。
 */
