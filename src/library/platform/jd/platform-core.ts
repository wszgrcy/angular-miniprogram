import { MiniProgramCore as Base } from 'angular-miniprogram/platform/default';
declare const jd: any;
export const MiniProgramCore = { ...Base, MINIPROGRAM_GLOBAL: jd };
