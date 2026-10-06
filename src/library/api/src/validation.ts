import { InjectionToken } from '@angular/core';
import { Observable, tap } from 'rxjs';
// 具名导入：`import * as v` 会让 valibot 整包无法 tree-shake（实测 278KB vs 4.6KB）
import {
  BaseIssue,
  BaseSchema,
  safeParse,
  strictObject,
  any as vAny,
  array as vArray,
  boolean as vBoolean,
  number as vNumber,
  object as vObject,
  optional as vOptional,
  picklist as vPicklist,
  string as vString,
  union as vUnion,
} from 'valibot';
import type { MpInvokeContext } from './pipe-registry';

/** valibot schema 统一形态：入参按 unknown 收，不做输出转换 */
export type MpApiSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;

/**
 * 业务侧 multi 贡献自有 schema。同名会覆盖内置 schema，作为「我觉得这 API 不该这么严」的逃生口。
 *
 * ```ts
 * providers: [
 *   { provide: MP_API_SCHEMAS, multi: true, useValue: {
 *       showToast: strictObject({ title: optional(string()) }),
 *   } },
 * ]
 * ```
 */
export const MP_API_SCHEMAS = new InjectionToken<Record<string, MpApiSchema>>(
  'MP_API_SCHEMAS',
);

/** 框架自身注入的键，不属于业务参数，校验前摘除 */
const FRAMEWORK_KEYS = ['signal'];

/**
 * 内置规则：只覆盖高频且易写错的 API，未收录的不校验。
 * 必须是函数惰性构建，不能是模块级常量——顶层调用 valibot 会被打包器当成模块副作用保留，
 * `ngDevMode=false` 也删不掉。
 */
function buildBuiltinSchemas(): Record<string, MpApiSchema> {
  const str = vString();
  const optStr = vOptional(str);
  const bool = vBoolean();
  const num = vNumber();

  return {
    // 路由
    navigateTo: strictObject({ url: str }),
    redirectTo: strictObject({ url: str }),
    switchTab: strictObject({ url: str }),
    reLaunch: strictObject({ url: str }),
    preloadPage: strictObject({ url: str }),
    unPreloadPage: strictObject({ url: str }),
    navigateBack: strictObject({ delta: vOptional(num) }),

    // 交互反馈
    showToast: strictObject({
      title: optStr,
      icon: vOptional(vPicklist(['success', 'error', 'loading', 'none'])),
      duration: vOptional(num),
      mask: vOptional(bool),
    }),
    showLoading: strictObject({
      title: optStr,
      mask: vOptional(bool),
    }),
    showModal: strictObject({
      title: optStr,
      content: optStr,
      showCancel: vOptional(bool),
      confirmText: optStr,
      cancelText: optStr,
    }),
    showActionSheet: strictObject({
      itemList: vArray(vUnion([str, vObject({ name: str })])),
      itemColor: optStr,
      popoverStyle: optStr,
    }),

    // 剪贴板 / 电话
    setClipboardData: strictObject({
      data: str,
      showToast: vOptional(bool),
    }),
    makePhoneCall: strictObject({ phoneNumber: str }),

    // 扫码
    scanCode: strictObject({
      onlyFromCamera: vOptional(bool),
      scanType: vOptional(
        vArray(vPicklist(['barCode', 'qrCode', 'datamatrix', 'pdf417'])),
      ),
      compress: vOptional(num),
      autoDecodeCharSet: vOptional(bool),
    }),

    // 导航栏
    setNavigationBarTitle: strictObject({ title: str }),

    // 媒体
    getImageInfo: strictObject({ src: str }),
    getVideoInfo: strictObject({ src: str }),

    // 设备
    setKeepScreenOn: strictObject({ keepScreenOn: bool }),
    setScreenBrightness: strictObject({ value: num }),

    // 蓝牙
    getBLEDeviceRSSI: strictObject({ deviceId: str }),
    setBLEMTU: strictObject({ deviceId: str, mtu: num }),
  };
}

function formatIssue(issue: BaseIssue<unknown>): string {
  const path = (issue.path ?? []).map((p) => String(p.key)).join('.');
  return `${path || '?'}: ${issue.message}`;
}

/**
 * 参数校验管道：命中规则的 API 做一次 `strictObject` 校验，拼错的键、缺必填、类型/枚举不符都会报出来。
 * 只告警不阻断——校验本身出错不该拖垮业务调用。
 */
export function mpValidationPipe(
  schemas: Record<string, MpApiSchema>,
): (src: Observable<MpInvokeContext>) => Observable<MpInvokeContext> {
  return (src) =>
    src.pipe(
      tap(({ name, options }) => {
        const schema = schemas[name];
        if (!schema) {
          return;
        }
        const apiOptions = { ...options };
        for (const key of FRAMEWORK_KEYS) {
          delete apiOptions[key];
        }
        const result = safeParse(schema, apiOptions);
        if (!result.success) {
          // eslint-disable-next-line no-console -- 开发期诊断输出
          console.warn(
            `[mp-api] ${name} 参数校验未通过：\n  ${result.issues
              .map(formatIssue)
              .join('\n  ')}`,
          );
        }
      }),
    );
}

/**
 * 开发期判定。仅供测试 / 业务自查使用。库内部需要「生产可消除」时不要调这个函数——函数调用对
 * 打包器是黑盒，它无法证明分支已死，schema 会跟整进产物。必须内联写
 * `if (typeof ngDevMode !== 'undefined' && ngDevMode)`。
 */
export function isMpDevMode(): boolean {
  return typeof ngDevMode !== 'undefined' && ngDevMode !== null;
}

/** 合并 DI 贡献：内置在前，业务覆盖在后 */
export function mergeSchemas(
  contributions: Record<string, MpApiSchema>[],
): Record<string, MpApiSchema> {
  return Object.assign(buildBuiltinSchemas(), ...contributions);
}
