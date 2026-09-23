import { register } from 'ts-node';
import { createTransformer } from 'static-injector/transform';
import Jasmine from 'jasmine';
import path from 'path';

register({
  project: path.resolve(__dirname, '../tsconfig.spec.json'),
  transformers: (program) => {
    const transformer = createTransformer(program);
    return {
      before: [transformer],
    };
  },
  logError: true,
});
import Module from 'module';
import { createMatchPath } from 'tsconfig-paths';

/**
 * 让 `angular-miniprogram/*` 的**包自引用**在 Node 测试里可解析。
 *
 * 库源码里大量用 `import ... from 'angular-miniprogram/platform/wx'`
 * 这种自引用（50 处），构建时靠 tsconfig.library.json 的 paths 映射。
 * 但那是**编译期**的，Node 运行时不认，且 src/library/package.json 的
 * exports 里也没有这些子路径，于是 require 直接失败。
 *
 * 这里注册一个解析钩子把同一套映射搬到运行时，使得在测试里可以
 * 真正 boot 组件、跑 getPageRefreshContext 拿真实 nodeList。
 */
const matchPath = createMatchPath(
  path.resolve(__dirname, '..'),
  {
    'angular-miniprogram/platform/default': [
      './src/library/platform/default/index.ts',
    ],
    'angular-miniprogram/platform/wx': ['./src/library/platform/wx/index.ts'],
    'angular-miniprogram/platform/type': [
      './src/library/platform/type/index.ts',
    ],
    'angular-miniprogram/platform': ['./src/library/platform/index.ts'],
    'angular-miniprogram/common': ['./src/library/common/index.ts'],
    'angular-miniprogram/common/http': ['./src/library/common/http/index.ts'],
  },
  ['main'],
  false
);

/**
 * 小程序全局 `wx` 的最小替身。
 *
 * `platform-core.ts` 里 `MINIPROGRAM_GLOBAL = wx` 是直接引用全局，
 * 模块加载时就要有，所以必须在启动阶段装好。
 *
 * 用 Proxy 兜底：任意成员访问返回一个可调用且可继续取属性的对象，
 * 这样测试里不必预先枚举小程序 API 的全部表面。真实值需要断言的
 * 场景，用 setWxStub() 覆盖具体成员。
 */
const wxOverrides: Record<string, unknown> = {};
function makeStub(name: string): any {
  const fn = function (...args: any[]) {
    void args;
    return undefined;
  };
  return new Proxy(fn, {
    get(_t, prop) {
      if (prop === 'then') {
        // 别让它被误当成 thenable
        return undefined;
      }
      if (prop in wxOverrides) {
        return wxOverrides[prop as string];
      }
      return makeStub(`${name}.${String(prop)}`);
    },
    has() {
      return true;
    },
    apply() {
      return undefined;
    },
  });
}
(globalThis as any).wx = new Proxy({} as any, {
  get(_t, prop) {
    if (prop in wxOverrides) {
      return wxOverrides[prop as string];
    }
    return makeStub(`wx.${String(prop)}`);
  },
  has() {
    return true;
  },
});

// 小程序页面的几个顶层全局函数，同样要在模块加载前存在
(globalThis as any).App = (globalThis as any).App || ((...a: any[]) => void a);
(globalThis as any).Page =
  (globalThis as any).Page || ((...a: any[]) => void a);
(globalThis as any).Component =
  (globalThis as any).Component || ((...a: any[]) => void a);
(globalThis as any).getApp =
  (globalThis as any).getApp || (() => ({ globalData: {} }));
(globalThis as any).getCurrentPages =
  (globalThis as any).getCurrentPages || (() => []);

const origResolve: (...a: any[]) => string = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (
  request: string,
  ...rest: any[]
): string {
  const mapped = matchPath(request, undefined, undefined, undefined);
  return origResolve.call(this, mapped ?? request, ...rest);
};

let jasmineInstance = new Jasmine();
let args = process.argv.slice(2) || [];
jasmineInstance.loadConfigFile(path.resolve(__dirname, '../jasmine.json'));
jasmineInstance.execute(undefined, args[0] || undefined);
