import { MiniProgramCore as Base } from 'angular-miniprogram/platform/default';
declare const qq: any;
export const MiniProgramCore = { ...Base, MINIPROGRAM_GLOBAL: qq };
