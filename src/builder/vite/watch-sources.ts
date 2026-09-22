import * as fs from 'fs';
import * as path from 'path';

export type WatchEventType = 'created' | 'modified' | 'deleted';

export interface SourceWatcher {
  close(): void;
}

/**
 * 能拿到就用的 watcher 工厂。
 *
 * 测试里由 vendored devkit 的 harness 提供（harness.writeFile 会 notify 进来）；
 * 真实环境没有，退化成 fs.watch。
 */
export interface WatcherFactoryLike {
  watch(
    files: Iterable<string>,
    directories: Iterable<string>,
    callback: (events: Array<{ path: string; type: WatchEventType }>) => void
  ): { close(): void };
}

/**
 * 监听一批目录，任何变动合并成一次回调。
 *
 * 为什么不用 Vite 原生 watch：
 *   Rolldown 的 watch 不支持动态加 input，watch 期间新增入口文件拉不进来。
 *   webpack 侧是靠 DynamicWatchEntryPlugin 每轮重写 config.entry 解决的。
 *   这里改成「发现变动就重算入口 + 重跑一次 vite.build」，
 *   冷构建才 1.5s，全量重建的 dev 体验完全可接受，
 *   而且顺带把「新增入口」这个坑一起解决了。
 */
export function watchSources(options: {
  directories: string[];
  onChange: () => void;
  /** 测试里传 harness 的 watcher；不传则用原生 fs.watch */
  factory?: WatcherFactoryLike;
  /** 合并窗口，避免一次保存触发多次重建 */
  debounceMs?: number;
}): SourceWatcher {
  const debounceMs = options.debounceMs ?? 50;
  let timer: NodeJS.Timeout | undefined;
  let closed = false;

  const fire = () => {
    if (closed) {
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      options.onChange();
    }, debounceMs);
  };

  const dirs = options.directories.filter((d) => {
    try {
      return fs.statSync(d).isDirectory();
    } catch {
      return false;
    }
  });

  if (options.factory) {
    const handle = options.factory.watch([], dirs, fire);
    return {
      close: () => {
        closed = true;
        if (timer) {
          clearTimeout(timer);
        }
        handle.close();
      },
    };
  }

  // 原生退化路径：真实 ng build --watch 走这里
  const watchers: fs.FSWatcher[] = [];
  for (const dir of dirs) {
    try {
      watchers.push(
        fs.watch(dir, { recursive: true }, () => {
          fire();
        })
      );
    } catch (error) {
      // 目录不存在或平台不支持 recursive，跳过而不是整体失败
      continue;
    }
  }
  return {
    close: () => {
      closed = true;
      if (timer) {
        clearTimeout(timer);
      }
      for (const w of watchers) {
        try {
          w.close();
        } catch (error) {
          // ignore
        }
      }
    },
  };
}

/**
 * 需要监听的目录：pages / components 的 input 目录 + 项目源码根。
 *
 * 入口 glob 是在每次重建时重新展开的，所以只要目录被监听到，
 * 新增的入口文件就能进下一轮构建。
 */
export function collectWatchDirectories(options: {
  workspaceRoot: string;
  sourceRoot?: string;
  entrySrcPaths: string[];
}): string[] {
  const dirs = new Set<string>();
  if (options.sourceRoot) {
    dirs.add(path.resolve(options.workspaceRoot, options.sourceRoot));
  }
  for (const src of options.entrySrcPaths) {
    dirs.add(path.dirname(path.resolve(src)));
  }
  return [...dirs];
}
