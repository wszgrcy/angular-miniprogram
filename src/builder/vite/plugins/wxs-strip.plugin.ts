import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'vite';
import { splitComponentKey } from '../../mini-program-compiler/type';
import { lookupStrippedByContent } from '../../wxs/wxs-angular-strip';
import { rewriteComponentForWxs } from '../../wxs/wxs-component-rewrite';

/**
 * 把「剥离 wxs 后的组件」喂给 Angular。
 *
 * Angular 编译发生在 analog 插件里，而 `fileReplacements` 必须在它建
 * program **之前**就位（`initialize()` 之后就改不动了）。所以本插件
 * 必须 `enforce: 'pre'`，抢在 analog 的 buildStart 前面把替换项 push
 * 进那个**共享数组**里。
 *
 * 组件清单来自分析层（`analysisRef.current.wxsModules`），本插件不扫盘：
 * 分析层第一步就已经把所有组件、它们的模板和 wxs 声明都解析完了，
 * 再走一遍全盘纯属重复劳动，还得自己处理 node_modules / dist 这些排除项。
 *
 * 只处理含 wxs 的组件，其余组件不进替换表，零影响。
 */
export interface WxsStripPluginOptions {
  workspaceRoot: string;
  /** 生成目录，必须在 `src/` 之外，否则会被库的 src 通配 include 吃进去 */
  cacheDir: string;
  /** 与 analog 共享的数组实例，本插件就地 push */
  fileReplacements: Array<{ replace: string; with: string }>;
  /** 分析层结果，由 mini-program:assets 在它的 buildStart 里填 */
  analysisRef: {
    current: { wxsModules?: ReadonlyMap<string, unknown> } | null;
  };
  watch: boolean;
}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

function readFileOrNull(file: string): string | null {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function writeIfChanged(file: string, content: string): void {
  const existing = readFileOrNull(file);
  if (existing === content) {
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

/** 按字节复制；源文件不存在就静默跳过，让 Angular 去报它自己的错 */
function copyIfChanged(from: string, to: string): void {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(from);
  } catch {
    return;
  }
  let cur: Buffer | null = null;
  try {
    cur = fs.readFileSync(to);
  } catch {
    cur = null;
  }
  if (cur && cur.equals(buf)) {
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, buf);
}

export function wxsStripPlugin(options: WxsStripPluginOptions): Plugin {
  const userReplacements = [...options.fileReplacements];
  /** 原组件绝对路径 -> cache 绝对路径，供 resolveId 查表 */
  const redirect = new Map<string, string>();

  const rebuild = (): void => {
    const wxsModules = options.analysisRef.current?.wxsModules;
    if (!wxsModules?.size) {
      options.fileReplacements.length = 0;
      options.fileReplacements.push(...userReplacements);
      return;
    }

    /**
     * 键是 `组件文件#类名`，同一个 .ts 里多个组件会归并成一个文件 ——
     * fileReplacements 是文件级的，整档只能换一次。
     */
    const components = [
      ...new Set(
        [...wxsModules.keys()].map((key) =>
          toPosix(path.resolve(splitComponentKey(key).sourceFile)),
        ),
      ),
    ];

    const ours: Array<{ replace: string; with: string }> = [];
    redirect.clear();
    for (const component of components) {
      const source = readFileOrNull(component);
      if (source === null) {
        continue;
      }
      const rel = path.relative(options.workspaceRoot, component);
      const cached = path.join(options.cacheDir, rel);
      const rewritten = rewriteComponentForWxs(
        source,
        component,
        cached,
        // 只能按内容查：分析层拿不到模板文件路径（`file.fileName` 为 null）
        (tplPath) => {
          const text = readFileOrNull(tplPath);
          return text === null ? undefined : lookupStrippedByContent(text);
        },
        (raw) => lookupStrippedByContent(raw),
      );
      if (!rewritten) {
        continue;
      }
      for (const res of rewritten.resources) {
        copyIfChanged(res.from, res.to);
      }
      writeIfChanged(cached, rewritten.code);
      ours.push({ replace: component, with: toPosix(cached) });
      redirect.set(component, toPosix(cached));
    }

    options.fileReplacements.length = 0;
    options.fileReplacements.push(...userReplacements, ...ours);
  };

  return {
    name: 'mini-program:wxs-strip',
    enforce: 'pre',

    /**
     * bundler 侧的模块重定向。
     *
     * 为什么不能只靠 fileReplacements：analog 的 `replaceFiles` 插件在
     * **建插件列表时** 就看了一眼数组，空的直接 `return false` 不注册。
     * 我们是在 buildStart 才 push 的，那会儿已经迟了 —— 于是 vite 把
     * `./wxs.component` 解到原文件，而原文件在 Angular 程序里已被替换
     * 掉、根本没编译，产出一份没有 Template 函数的空壳 JS。
     *
     * 自己接 resolveId 就不依赖 analog 什么时候读那个数组。
     */
    async resolveId(source, importer, options) {
      if (!redirect.size || !importer) {
        return null;
      }
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });
      if (!resolved) {
        return null;
      }
      return redirect.get(toPosix(path.resolve(resolved.id))) ?? null;
    },

    async buildStart() {
      // 每轮都重算：模板可能新增或去掉了 wxs，替换表必须跟着变
      rebuild();
    },
  };
}
