/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken } from '@angular/core';
import { MpFieldMap, MpMapFn } from './protocol-engine';
import { MpCallbackOptions, MpPlatform } from './types';

/** 自定义协议直接接管目标调用（如 showModal 需按参数选 alert/confirm） */
export type MpCustomCall = (
  targetName: string,
  targetArgs: MpCallbackOptions,
) => any;

/**
 * 单个 API 在某个平台上的差异协议（声明式）。
 * args / returnValue 共用 key 级引擎（protocol-engine），
 * 表格内容可对照 uni 的 protocols 逐条搬运。
 */
export interface MpApiProtocol {
  /** 目标平台 API 名，默认为统一名本身 */
  name?: string;
  /** 统一参数 -> 平台参数 */
  args?: MpFieldMap | MpMapFn;
  /** 结果整体替换（如支付宝 getStorageSync 的 {data} 拆封） */
  transformResult?: (res: any) => any;
  /** 平台结果 -> 统一结果（成功结果） */
  returnValue?: MpFieldMap | MpMapFn;
  /** 完全自定义：拿到已包装好回调的 options，自行选择目标 API */
  custom?: (args: MpCallbackOptions, call: MpCustomCall) => any;
  /**
   * canIUse 探测用的平台 API 名。`custom` 协议由多个平台 API 合成，
   * 无法从统一名直接推知，需显式声明；全部存在才算支持。
   */
  probe?: string[];
}

export type MpProtocolTable = Record<string, MpApiProtocol>;

const MODAL_OK = 'showModal:ok';

/** 微信口径 showModal -> alert/confirm 口径 */
function modalCustom(
  alertName: string,
  confirmName: string,
  confirmButtonText: string,
  cancelButtonText: string,
) {
  return (options: MpCallbackOptions, call: MpCustomCall) => {
    const {
      title,
      content,
      showCancel,
      confirmText,
      cancelText,
      success,
      fail,
      complete,
    } = options;
    if (showCancel === false) {
      return call(alertName, {
        title,
        content,
        success: () =>
          success?.({ confirm: true, cancel: false, errMsg: MODAL_OK }),
        fail,
        complete,
      });
    }
    return call(confirmName, {
      title,
      content,
      confirmButtonText: confirmText ?? confirmButtonText,
      cancelButtonText: cancelText ?? cancelButtonText,
      success: (res: any) =>
        success?.({
          confirm: !!res.confirm,
          cancel: !res.confirm,
          errMsg: MODAL_OK,
        }),
      fail,
      complete,
    });
  };
}

const NETWORK_VALUE_MAP: Record<string, string> = {
  NOTREACHABLE: 'none',
  WWAN: '3g',
};

/** 微信 icon 值域 -> 支付宝 type 值域 */
function toastType(v: string) {
  return v === 'error' ? 'fail' : v;
}

/** 支付宝/钉钉同步存储返回 { data }，需拆封；无存储时归一为空串 */
function unwrapSyncStorage(res: any) {
  return res && res.data !== null && res.data !== undefined ? res.data : '';
}

const ALIPAY: MpProtocolTable = {
  showModal: {
    custom: modalCustom('alert', 'confirm', '确定', '取消'),
    probe: ['alert', 'confirm'],
  },
  showToast: {
    // icon -> type 且值域转换，需表级函数形态（字段级函数只能改值不能换 key）
    args: (from, to) => {
      if (from.icon !== undefined) {
        to.type = toastType(from.icon);
      }
      return { title: 'content', icon: false };
    },
  },
  showLoading: {
    args: { title: 'content' },
  },
  setNavigationBarTitle: { name: 'setNavigationBar' },
  setClipboardData: {
    name: 'setClipboard',
    args: { data: 'text' },
  },
  getClipboardData: {
    name: 'getClipboard',
    returnValue: { text: 'data' },
  },
  getStorageSync: { transformResult: unwrapSyncStorage },
  getNetworkType: {
    returnValue: {
      networkType: (v: string) => NETWORK_VALUE_MAP[v] ?? String(v).toLowerCase(),
    },
  },
  makePhoneCall: {
    args: { phoneNumber: 'number' },
  },
  previewImage: {
    // 微信 current 是 url，支付宝是下标；下标可能是 0（假值），走函数形态直写
    args: (from, to) => {
      const urls: string[] = from.urls ?? [];
      to.current =
        typeof from.current === 'number'
          ? from.current
          : Math.max(0, urls.indexOf(String(from.current)));
    },
  },
  showActionSheet: {
    args: {
      itemList: (v: any[]) =>
        (v ?? []).map((item) => (typeof item === 'string' ? item : item.name)),
    },
  },
};

const DINGTALK: MpProtocolTable = {
  // 钉钉的 request 叫 httpRequest
  request: { name: 'httpRequest' },
  showModal: {
    custom: modalCustom('alert', 'confirm', '确定', '取消'),
    probe: ['alert', 'confirm'],
  },
  showToast: {
    args: (from, to) => {
      if (from.icon !== undefined) {
        to.type = toastType(from.icon);
      }
      return { title: 'content', icon: false };
    },
  },
  showLoading: {
    args: { title: 'content' },
  },
  setNavigationBarTitle: { name: 'setNavigationBar' },
  setClipboardData: {
    name: 'setClipboard',
    args: { data: 'text' },
  },
  getClipboardData: {
    name: 'getClipboard',
    returnValue: { text: 'data' },
  },
  getStorageSync: { transformResult: unwrapSyncStorage },
};

/**
 * 通用结果归一（支付宝系）：
 * - 成功结果补 `errMsg: '<name>:ok'`（支付宝原生结果没有该字段）
 * - `error` / `errorMessage` 字段转 `errMsg: '<name>:fail ...'`
 * 参考 uni-mp-alipay 的通用 returnValue。
 */
export function normalizeAlipayStyleResult(
  methodName: string,
  res: any,
) {
  if (res == null || typeof res !== 'object' || res instanceof Error) {
    return res;
  }
  if (res.error !== undefined || res.errorMessage !== undefined) {
    const { error, errorMessage, ...rest } = res;
    return { ...rest, errMsg: `${methodName}:fail ${errorMessage ?? error}` };
  }
  return { ...res, errMsg: `${methodName}:ok` };
}

/** 需要通用结果归一的平台 */
export const GENERIC_RESULT_NORMALIZERS: Partial<
  Record<MpPlatform, (name: string, res: any) => any>
> = {
  my: normalizeAlipayStyleResult,
  dd: normalizeAlipayStyleResult,
};

/**
 * 默认协议表：只收录各家与微信口径的高频差异。
 * 需要扩展/覆盖时 provide MP_API_PROTOCOLS 替换或合并。
 */
export const DEFAULT_MP_PROTOCOLS: Record<MpPlatform, MpProtocolTable> = {
  wx: {},
  tt: {},
  swan: {},
  qq: {},
  jd: {},
  my: ALIPAY,
  dd: DINGTALK,
};

export const MP_API_PROTOCOLS = new InjectionToken<
  Record<MpPlatform, MpProtocolTable>
>('MP_API_PROTOCOLS', {
  providedIn: 'root',
  factory: () => DEFAULT_MP_PROTOCOLS,
});
