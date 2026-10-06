/* eslint-disable @typescript-eslint/no-explicit-any */
import { MiniProgramCoreFactory as BaseFactory } from 'angular-miniprogram/platform/default';
import type {
  MiniProgramComponentInstance,
  NodePath,
} from 'angular-miniprogram/platform/type';
import { wxEventNamesOf } from './event-name';

class MiniProgramCoreFactory extends BaseFactory {
  override eventPrefixList = [
    { listener: 'on', prefix: 'on' },
    { listener: 'catch', prefix: 'catch' },
  ];
  /** 一个事件名在 `listener` 表里允许占的键 */
  private eventKeys(prefix: string, name: string) {
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
  /**
   * 支付宝的 `e.type` 是驼峰名（`touchStart`），而模板写的是微信名（`(touchstart)` → 监听键 `touchstart`）。
   * 先把 `e.type` 反查回微信名，两套候选一起铺：两种写法都接得住，普通事件（`tap`）候选一个不多。
   */
  override getListenerEventMapping(prefix: string, name: string) {
    const keys = new Set(this.eventKeys(prefix, name));
    wxEventNamesOf(name).forEach((alias) => {
      this.eventKeys(prefix, alias).forEach((key) => keys.add(key));
    });
    return [...keys];
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
      this: Record<string, any> & MiniProgramComponentInstance,
    ) {
      let resolveFunction!: () => void;
      this.__waitLinkPromise = new Promise<void>(
        (resolve) => (resolveFunction = resolve),
      );
      this.__waitLinkResolve = resolveFunction;
      addWait = true;
      if (oldOnInit) {
        oldOnInit.bind(this)();
      }
    };
    const oldDidMount = config.didMount;
    config.didMount = function (
      this: Record<string, any> & MiniProgramComponentInstance,
    ) {
      if (!addWait) {
        addWait = true;
        let resolveFunction!: () => void;
        this.__waitLinkPromise = new Promise<void>(
          (resolve) => (resolveFunction = resolve),
        );
        this.__waitLinkResolve = resolveFunction;
      }
      const nodePath: NodePath = (this.props.nodePath || []).map(
        (item: string) => (item === 'directive' ? item : parseInt(item, 10)),
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

/**
 * 平台包必须能被当成 `platform/wx` 的替身：构建时 `platformReplacementAlias()` 把
 * `angular-miniprogram/platform/wx` 整个换成 `angular-miniprogram/platform/<平台>`，换完之后
 * 主包那句 `export { AgentNode, ... } from 'angular-miniprogram/platform/wx'` 就得由这里来兑现。
 * 所以这里必须 `export *`，不能手写名单——手抄名单漏一个名字，该平台构建当场 `[MISSING_EXPORT]`。
 * 本地那份 `MiniProgramCore` 会盖掉 star 导出里的同名项（ES 规范：显式导出优先于 `export *`），
 * 这正是我们要的——平台替换要换的就是它。
 */
export * from 'angular-miniprogram/platform/default';
