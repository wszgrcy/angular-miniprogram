import {
  MiniProgramCoreFactory as BaseFactory,
  pageBindFactory,
} from 'angular-miniprogram/platform/default';
import { NodePath } from 'angular-miniprogram/platform/type';

class MiniProgramCoreFactory extends BaseFactory {
  override getPageId(component: any) {
    return component.$page ? component.$page.$id : component.$id;
  }
  override eventPrefixList = [
    { listener: 'on', prefix: 'on' },
    { listener: 'catch', prefix: 'catch' },
  ];
  override getListenerEventMapping(prefix: string, name: string) {
    let upperName = name[0].toLocaleUpperCase() + name.substr(1);
    let isOn = prefix === 'on';

    return [
      name,
      prefix + name,
      prefix + upperName,
      ...(isOn
        ? ['mut-bind' + name, 'capture-bind' + name, 'bind' + name]
        : ['capture-catch' + name]),
    ];
  }
  override addNgComponentLinkLogic(config: any) {
    let self = this;
    config.props = {
      nodePath: undefined,
      nodeIndex: undefined,
    };
    config.didMount = function () {
      let nodePath: NodePath = (this.props.nodePath || []).map((item: string) =>
        item === 'directive' ? item : parseInt(item, 10)
      );
      let nodeIndex = parseInt(this.props.nodeIndex, 10);
      if (this.__isLink) {
        return;
      }

      self.linkNgComponentWithPath(this, [...nodePath, nodeIndex]);
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
