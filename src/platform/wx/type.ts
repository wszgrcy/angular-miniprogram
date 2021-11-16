import {
  MiniProgramComponentMethod,
  MiniProgramComponentVariable,
} from '../type';
import 'miniprogram-api-typings';

export interface WxLifetimes {
  wxLifetimes?: WechatMiniprogram.Component.Lifetimes['lifetimes'];
  wxPageLifetimes?: Partial<WechatMiniprogram.Component.PageLifetimes>;
}

export type WxComponentInstance = WechatMiniprogram.Component.Instance<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>,
  {},
  Partial<MiniProgramComponentMethod>,
  MiniProgramComponentVariable
>;
