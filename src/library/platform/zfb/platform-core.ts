import { MiniProgramCore as Base } from 'angular-miniprogram/platform/default';
declare const my: any;
export const MiniProgramCore = { ...Base, MINIPROGRAM_GLOBAL: my };
