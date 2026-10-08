/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  MpComponentOptions,
  MpPageOptions,
} from 'angular-miniprogram/platform/type';
import { MiniProgramCore } from './index';

/**
 * `mpComponentOptions` / `mpPageOptions` 的生效范围。框架在拼 `Component()` 配置单时会占用三段：
 * `data`（setData 的载体）、`properties`（`nodePath` / `nodeIndex` 这条 lView 回连通道）、
 * `methods`（事件分发 + wxs callMethod 转发）。用户在这三段里写的东西到不了微信，所以契约
 * （`MpComponentOptions`）不收——本 spec 钉住「运行时行为」与「契约」两边一致，防止哪天漂开。
 */
const captured: any[] = [];
const originalComponent = (globalThis as any).Component;
const originalPage = (globalThis as any).Page;

beforeAll(() => {
  const capture = (config: any) => {
    captured.push(config);
    return config;
  };
  (globalThis as any).Component = capture;
  (globalThis as any).Page = capture;
});
afterAll(() => {
  (globalThis as any).Component = originalComponent;
  (globalThis as any).Page = originalPage;
});

const lastConfig = () => captured[captured.length - 1];

/** `Behavior()` 的返回值，测试里不需要真的造一个 behavior */
const behaviorId = 'behavior-a' as unknown as NonNullable<
  MpComponentOptions['behaviors']
>[number];

/** 三段框架占用段之外，用户能写的全写上 */
function fullOptions() {
  const created = vi.fn();
  const show = vi.fn();
  const observer = vi.fn();
  const relationLinked = vi.fn();
  const options: MpComponentOptions = {
    lifetimes: { created },
    pageLifetimes: { show },
    behaviors: [behaviorId],
    relations: { '../x/x': { type: 'child', linked: relationLinked } },
    observers: { hasLoad: observer },
    options: { virtualHost: true },
  };
  return { options, created, show, observer, relationLinked };
}

describe('mpComponentOptions / mpPageOptions', () => {
  it('契约不收 data / properties / methods', () => {
    // @ts-expect-error data 由框架占用（setData 的载体）
    const withData: MpComponentOptions = { data: { mine: 1 } };
    // @ts-expect-error properties 由框架占用（nodePath / nodeIndex）
    const withProperties: MpComponentOptions = { properties: { title: null } };
    // @ts-expect-error methods 由框架占用（事件分发 / wxs 转发）
    const withMethods: MpComponentOptions = { methods: { nativeFn() {} } };
    void [withData, withProperties, withMethods];
  });

  it('组件入口：透传段原样到达 Component()', () => {
    const { options, created, show, observer, relationLinked } = fullOptions();
    class Cmp {
      static mpComponentOptions = options;
    }
    MiniProgramCore.componentRegistry(Cmp as any);
    const config = lastConfig();

    expect(config.behaviors).toEqual([behaviorId]);
    expect(config.options).toEqual({ virtualHost: true, multipleSlots: true });
    expect(config.observers.hasLoad).toBe(observer);
    expect(config.relations['../x/x'].linked).toBe(relationLinked);
    expect(config.lifetimes.created).not.toBe(created);
    expect(config.pageLifetimes.show).toBe(show);

    // 框架占用段：只剩框架自己的内容
    expect(Object.keys(config.properties)).toEqual(['nodePath', 'nodeIndex']);
    expect(config.data).toEqual({ hasLoad: false });
    expect(config.methods.bindEvent).toBeInstanceOf(Function);
  });

  it('组件入口：created 里用户那份仍会被调到', () => {
    const { options, created } = fullOptions();
    class Cmp {
      static mpComponentOptions = options;
    }
    MiniProgramCore.componentRegistry(Cmp as any);
    lastConfig().lifetimes.created.call({});
    expect(created).toHaveBeenCalledTimes(1);
  });

  it('组件即页面：methods 里的页面钩子保留（用户那份先跑）', async () => {
    const onShow = vi.fn();
    class PageCmp {
      static mpComponentOptions: MpComponentOptions<true> = {
        methods: { onShow },
      };
    }
    MiniProgramCore.bootstrapPage(PageCmp as any);
    const config = lastConfig();

    expect(config.methods.onShow).toBeInstanceOf(Function);
    await config.methods.onShow.call({});
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('页面入口：生命周期被包而非被丢，data 仍由框架占用', () => {
    const onLoad = vi.fn();
    class Page {
      static mpPageOptions: MpPageOptions = {
        onLoad,
      };
    }
    MiniProgramCore.bootstrapPage(Page as any);
    const config = lastConfig();

    expect(config.data).toEqual({ hasLoad: false });
    // 框架包了一层（Angular 实例起来后再调用户那份），不是丢掉
    expect(config.onLoad).toBeInstanceOf(Function);
    expect(config.onLoad).not.toBe(onLoad);
  });

  it('旧写法（整份 Component.Options 标注）能赋给新契约', () => {
    const legacy: WechatMiniprogram.Component.Options<{}, {}, {}, []> = {
      lifetimes: { created: () => {} },
      pageLifetimes: { show: () => {} },
    };
    // 能编译就是「旧代码不会被新契约卡住」的证据
    const narrowed: MpComponentOptions = legacy;
    void narrowed;
  });

  it('页面契约不收 data', () => {
    // @ts-expect-error data 由框架占用
    const withData: MpPageOptions = { data: { mine: 1 } };
    void withData;
  });
});
