/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiniProgramCoreFactory as BaseFactory } from 'angular-miniprogram/platform/default';
import type {
  MiniProgramComponentInstance,
  NodePath,
} from 'angular-miniprogram/platform/type';

class MiniProgramCoreFactory extends BaseFactory {
  override eventPrefixList = [
    { listener: 'on', prefix: 'on' },
    { listener: 'catch', prefix: 'catch' },
  ];
  override getListenerEventMapping(prefix: string, name: string) {
    const upperName = name[0].toLocaleUpperCase() + name.substr(1);
    const isOn = prefix === 'on';
    return [
      name,
      prefix + name,
      prefix + upperName,
      ...(isOn
        ? [
            'mut-bind' + name,
            'capture-bind' + name,
            'bind' + name,
            'mut-bind' + upperName,
            'capture-bind' + upperName,
            'bind' + upperName,
          ]
        : ['capture-catch' + name, 'capture-catch' + upperName]),
    ];
  }
  override addNgComponentLinkLogic(config: any) {
    const _this = this;
    config.props = {
      nodePath: undefined,
      nodeIndex: undefined,
    };
    let addWait = false;
    const oldOnInit = config.onInit;
    config.onInit = function (
      this: Record<string, any> & MiniProgramComponentInstance
    ) {
      let resolveFunction!: () => void;
      this.__waitLinkPromise = new Promise<void>(
        (resolve) => (resolveFunction = resolve)
      );
      this.__waitLinkResolve = resolveFunction;
      addWait = true;
      if (oldOnInit) {
        oldOnInit.bind(this)();
      }
    };
    const oldDidMount = config.didMount;
    config.didMount = function (
      this: Record<string, any> & MiniProgramComponentInstance
    ) {
      if (!addWait) {
        addWait = true;
        let resolveFunction!: () => void;
        this.__waitLinkPromise = new Promise<void>(
          (resolve) => (resolveFunction = resolve)
        );
        this.__waitLinkResolve = resolveFunction;
      }
      const nodePath: NodePath = (this.props.nodePath || []).map(
        (item: string) => (item === 'directive' ? item : parseInt(item, 10))
      );
      const nodeIndex = parseInt(this.props.nodeIndex, 10);
      if (this.__isLink) {
        return;
      }
      this.__completePath = [...nodePath, nodeIndex];
      _this.linkNgComponentWithPath(this, this.__completePath);
      if (oldDidMount) {
        oldDidMount.bind(this)();
      }
    };
    return config;
  }
}
export const MiniProgramCore = new MiniProgramCoreFactory();
export {
  PAGE_TOKEN,
  MiniProgramRenderer,
  MiniProgramRendererFactory,
  ComponentFinderService,
  propertyChange,
  pageBind,
} from 'angular-miniprogram/platform/default';
