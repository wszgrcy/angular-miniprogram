import { MiniProgramCore as Base } from 'angular-miniprogram/platform/default';
declare const swan: any;
export const MiniProgramCore = { ...Base, MINIPROGRAM_GLOBAL: swan };
