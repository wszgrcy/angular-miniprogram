import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'vite';
import {
  type WxsAnalysisRef,
  splitComponentKey,
} from '../../mini-program-compiler/type';
import { pathKey, toAbsolutePosix, toPosix } from '../../util/path';
import { lookupStrippedByContent } from '../../wxs/wxs-angular-strip';
import { rewriteComponentForWxs } from '../../wxs/wxs-component-rewrite';

/**
 * 把「改写后的组件」喂给 Angular。
 *
 * 触发条件有两个清单：带 wxs 的组件（表达式被改成了枝叶数组）与带 ICU 的组件
 * （整段 `{x, plural, ...}` 被替成了普通插值）。两者产出的都是「Angular 可见
 * 模板」，走的是同一条 fileReplacements 通道，所以共用一套生成逻辑。
 *
 * Angular 编译发生在 analog 插件里，而 `fileReplacements` 必须在它建
 * program **之前**就位（`initialize()` 之后就改不动了）。所以本插件
 * 必须 `enforce: 'pre'`，抢在 analog 的 buildStart 前面把替换项 push
 * 进那个**共享数组**里。
 *
 * 组件清单来自分析层（`analysisRef.current`），本插件不扫盘：
 * 分析层第一步就已经把所有组件、它们的模板和改写结果都解析完了，
 * 再走一遍全盘纯属重复劳动，还得自己处理 node_modules / dist 这些排除项。
 *
 * 只处理被改写过的组件，其余组件不进替换表，零影响。
 */
export interface WxsStripPluginOptions {
  workspaceRoot: string;
  /** 生成目录，必须在 `src/` 之外，否则会被库的 src 通配 include 吃进去 */
  cacheDir: string;
  /** 与 analog 共享的数组实例，本插件就地 push */
  fileReplacements: Array<{ replace: string; with: string }>;
  /** 分析层结果，由 mini-program:assets 在它的 buildStart 里填 */
  analysisRef: {
    current: WxsAnalysisRef;
  };
  watch: boolean;
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
  let cur: Buffer | null;
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
  /**
   * redirect 的值集合（cache 绝对路径）。
   *
   * 给 resolveId 认「已经被别的插件改到 cache 上」的解析结果用，
   * 理由见 resolveId 里的注释。
   */
  /**
   * `pathKey(cache 绝对路径)` -> `toPosix(cache 绝对路径)`。
   *
   * 给 resolveId 认「已经被别的插件改到 cache 上」的解析结果用，理由见 resolveId 里的注释。
   * 查表用 pathKey（盘符大小写不敏感），但**返回的是我们自己拼的那份
   * `toPosix(cached)`**：返回归一后的 key 会让同一个文件以两种盘符大小写
   * 进入模块图，被当成两个模块。
   */
  const redirectedTargets = new Map<string, string>();

  const rebuild = (): void => {
    /** 被改写过的组件 key */
    const touched = new Set<string>([
      ...(options.analysisRef.current?.wxsModules?.keys() ?? []),
    ]);
    if (!touched.size) {
      options.fileReplacements.length = 0;
      options.fileReplacements.push(...userReplacements);
      return;
    }

    /**
     * 键是 `组件文件#类名`，同一个 .ts 里多个组件会归并成一个文件 ——
     * fileReplacements 是文件级的，整档只能换一次。
     */
    const components = [
      ...new Map(
        [...touched].map((key) => {
          // key 里的 sourceFile 是 pathKey 形态（身份令牌），要变回可用路径
          // 必须走 toAbsolutePosix，不能 path.resolve —— 后者在 Windows 上会
          // 把 `/C/a/b.ts` 当成「C 盘下的 \C\a\b.ts」。
          const file = toAbsolutePosix(splitComponentKey(key).sourceFile);
          return [pathKey(file), file] as const;
        }),
      ).values(),
    ];

    const ours: Array<{ replace: string; with: string }> = [];
    redirect.clear();
    redirectedTargets.clear();
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
      // redirect 是我们自己的查表，用 pathKey；上面 push 给 analog 的
      // replace/with 用 toPosix——那边是第三方插件拿 endsWith 去和 vite 的
      // id 比，跟着我们降盘符反而对不上。
      redirect.set(pathKey(component), toPosix(cached));
      redirectedTargets.set(pathKey(cached), toPosix(cached));
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
      const resolvedId = pathKey(resolved.id);
      const hit = redirect.get(resolvedId);
      if (hit) {
        return hit;
      }
      /**
       * 解析结果已经是我们的 cache 文件 —— 照单收下，别再返回 null。
       *
       * 坑在 analog 的 `rollup-plugin-replace-files`：它也是 `enforce: 'pre'`，
       * 而且只要 `fileReplacements` 在**建插件列表时**非空就会注册（生产构建
       * 有 environment.prod.ts 替换，所以正好非空；dev 没有，于是躲过去了）。
       * 两条链会互相把对方绕进去：
       *   1. 我们 this.resolve（跳过自己）→ replaceFiles 命中替换表，返回 cache；
       *      我们拿 cache 去查 redirect（钥匙是**原路径**）→ 落空 → 返回 null。
       *   2. 轮到 replaceFiles：它 this.resolve（跳过自己）→ 又回到我们，我们返回
       *      cache；它拿 cache 去 `endsWith(原路径)` → 落空 → 也返回 null。
       *   3. 两个 pre 插件都返回 null，vite 退回默认解析 = **原文件**，于是
       *      Angular 那份没剥离 wxs 的模板被编进 js（wxml 却还是对的）。
       * 所以只要解析结果落在我们的 cache 上，就得由我们把它认下来。
       */
      return redirectedTargets.get(resolvedId) ?? null;
    },

    async buildStart() {
      // 每轮都重算：模板可能新增或去掉了 wxs，替换表必须跟着变
      rebuild();
    },
  };
}
