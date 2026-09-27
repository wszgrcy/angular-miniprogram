import * as glob from 'glob';
import * as path from 'path';

function globAsync(pattern: string, options: glob.IOptions) {
  return new Promise<string[]>((resolvePromise, reject) =>
    glob.default(pattern, options, (e, m) =>
      e ? reject(e) : resolvePromise(m)
    )
  );
}

export interface DiscoveredSpec {
  /** 绝对路径 */
  abs: string;
  /** 相对 sourceRoot 的路径（不含扩展名），用作 entry key */
  rel: string;
}

/**
 * 发现 spec 文件。
 *
 * webpack 侧是 FindTestsPlugin 干的。Vite 这边必须自己做：
 * `*.spec.ts` 不被任何 entry import，不显式加为 entry 的话
 * bundle 里根本没有 describe / it，jasmine 全局替换也就无从生效。
 */
export async function globSpecFiles(options: {
  cwd: string;
  include: string[];
  exclude: string[];
}): Promise<DiscoveredSpec[]> {
  const found = new Map<string, DiscoveredSpec>();
  for (const pattern of options.include) {
    const files = await globAsync(pattern, {
      cwd: options.cwd,
      dot: true,
      nodir: true,
      ignore: options.exclude,
    });
    for (const f of files) {
      const abs = path.resolve(options.cwd, f);
      const rel = f.replace(/\.ts$/, '').split(path.sep).join('/');
      found.set(abs, { abs, rel });
    }
  }
  return [...found.values()];
}
