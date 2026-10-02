/**
 * spec 模块注册表。
 *
 * 小程序不能像浏览器那样按 URL 动态 import 一个文件，spec 必须事先全部
 * 编进包。宿主下发的 `WorkerRequest` 里带的是**宿主机上的绝对路径**，
 * 所以这里要能把那个路径映射回包内的模块 —— 用「路径后缀」匹配，
 * 因为包内模块的 key 是构建期给的短名（`specs/foo/bar`），
 * 而宿主给的是 `<repo>/test/.../foo/bar.spec.ts`。
 */
export interface TestModuleRegistry {
  load(filepath: string): unknown;
  /** 反查：包内 key，用于日志与错误信息 */
  keys(): string[];
}

export type TestModuleMap = Readonly<Record<string, () => unknown>>;

function normalize(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function createTestModuleRegistry(
  modules: TestModuleMap,
): TestModuleRegistry {
  const entries = Object.entries(modules).map(
    ([key, load]) => [normalize(key), load] as const,
  );

  return {
    keys: () => entries.map(([key]) => key),
    load(filepath: string) {
      const target = normalize(filepath);
      const matches = entries.filter(([key]) => target.endsWith(key));
      if (matches.length === 0) {
        throw new Error(
          `spec "${filepath}" 没被打进小程序包。` +
            `已打包 ${entries.length} 个：${entries
              .map(([key]) => key)
              .slice(0, 10)
              .join(', ')}`,
        );
      }
      if (matches.length > 1) {
        throw new Error(
          `spec "${filepath}" 同时匹配到多个已打包模块：${matches
            .map(([key]) => key)
            .join(', ')}`,
        );
      }
      return matches[0][1]();
    },
  };
}

/**
 * 兼容 webpack 风格 `require.context()` 的注册表。
 *
 * 本仓库的 require-context-shim 插件会把 `require.context(...)` 改写成
 * `{ key: () => require(file) }` 形态，这里直接吃那个形状，
 * 让已有的 spec 发现机制不用改。
 */
export function createRequireContextRegistry(context: {
  keys(): string[];
  (key: string): unknown;
}): TestModuleRegistry {
  const modules: Record<string, () => unknown> = {};
  for (const key of context.keys()) {
    modules[key] = () => context(key);
  }
  return createTestModuleRegistry(modules);
}
