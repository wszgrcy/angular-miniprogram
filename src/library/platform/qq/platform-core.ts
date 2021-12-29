import {
  MiniProgramCoreFactory as BaseFactory,
  pageBindFactory,
} from 'angular-miniprogram/platform/default';
declare const getCurrentPages: Function;
class MiniProgramCoreFactory extends BaseFactory {
  override getPageId(component: any) {
    return (
      component.route || getCurrentPages()[getCurrentPages().length - 1].route
    );
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
