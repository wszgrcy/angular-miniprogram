import {
  MiniProgramCore as MiniProgramCoreBase,
  pageBindFactory,
} from 'angular-miniprogram/platform/default';
declare const my: any;

export const MiniProgramCore = {
  ...MiniProgramCoreBase,
  getPageId(component: any) {
    return component.$id;
  },
  MINIPROGRAM_GLOBAL: my,
};
export const pageBind = pageBindFactory(MiniProgramCore.getPageId);
export {
  PAGE_TOKEN,
  MiniProgramRenderer,
  MiniProgramRendererFactory,
  ComponentFinderService,
  propertyChange,
} from 'angular-miniprogram/platform/default';
