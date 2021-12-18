import {
  MiniProgramCoreFactory as BaseFactory,
  pageBindFactory,
} from 'angular-miniprogram/platform/default';
declare const swan: any;

class MiniProgramCoreFactory extends BaseFactory {
  override MINIPROGRAM_GLOBAL = swan;
  override getPageId(component: any) {
    return component.pageinstance ? component.pageinstance.uri : component.uri;
  }
}
export const MiniProgramCore = new MiniProgramCoreFactory();
export const pageBind = pageBindFactory(MiniProgramCore.getPageId);

export {
  PAGE_TOKEN,
  MiniProgramRenderer,
  MiniProgramRendererFactory,
  ComponentFinderService,
  propertyChange,
} from 'angular-miniprogram/platform/default';
