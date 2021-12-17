import {
  MiniProgramCoreFactory as BaseFactory,
  pageBindFactory,
} from 'angular-miniprogram/platform/default';
import { ComponentPath } from 'angular-miniprogram/platform/type';
declare const my: any;

class MiniProgramCoreFactory extends BaseFactory {
  override getPageId(component: any) {
    return component.$page ? component.$page.$id : component.$id;
  }
  override MINIPROGRAM_GLOBAL = my;
  override addNgComponentLinkLogic(config: any) {
    let self = this;
    config.props = {
      componentPath: undefined,
      nodeIndex: undefined,
    };
    config.didMount = function () {
      let componentPath: ComponentPath = (this.props.componentPath || []).map(
        (item: string) => (item === 'directive' ? item : parseInt(item, 10))
      );
      let nodeIndex = parseInt(this.props.nodeIndex, 10);
      if (this.__isLink) {
        return;
      }

      self.linkNgComponentWithPath(this, [...componentPath, nodeIndex]);
    };
    return config;
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
