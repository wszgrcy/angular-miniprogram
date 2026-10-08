/**
 * 条件编译平台常量的类型声明。把本文件加入工程 tsconfig（include 或 types）后，源码即可写：
 *
 * ```ts
 * if (__MP_WX__) {
 *   // 仅微信：构建期 __MP_WX__ === true，其余平台此分支被 DCE 移除
 * }
 * const app = __MP_PLATFORM__; // "wx" | "zfb" | "zj" | "bdzn" | "qq" | "dd" | "jd" | "ks" | "xhs" | "fs"
 * ```
 *
 * 值由构建器 `platformConditionDefine()` 注入，与构建目标 platform 一致。
 */
declare const __MP_PLATFORM__: string;
declare const __MP_WX__: boolean;
declare const __MP_ZJ__: boolean;
declare const __MP_JD__: boolean;
declare const __MP_BDZN__: boolean;
declare const __MP_ZFB__: boolean;
declare const __MP_QQ__: boolean;
declare const __MP_DD__: boolean;
declare const __MP_KS__: boolean;
declare const __MP_XHS__: boolean;
declare const __MP_FS__: boolean;
declare const __MP_LIBRARY__: boolean;
