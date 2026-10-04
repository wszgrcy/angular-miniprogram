import type { BuilderHarness } from '../cyia-ngx-devkit/builder-testing';
import { getSystemPath } from '@angular-devkit/core';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 构建类用例的超时。
 *
 * 别写 600000：真出问题（模块解析不了、watch 没退出、harness 卡住）时，
 * CI 要挂十分钟才报出来，本地看着就是整个进程死了。实测一次全量构建
 * ≈ 2s，60s 已经是 30 倍余量；再慢就该去查为什么慢，而不是继续加大超时。
 */
export const BUILD_TIMEOUT_MS = 60_000;

/**
 * 「构建一次，多个用例断言」的构建缓存。
 *
 * 一次小程序全量构建 ≈ 2s，其中约一半是 Angular AOT（analog 插件在
 * `buildStart` 里整包重编），跟断言内容毫无关系。而现实里有一批 spec
 * 用的是**同一份 fixture + 同一份构建参数**，只是各看各的产物：
 * zoneless 看有没有 zone.js、control-flow 看 wxml 模板名、polyfill 看
 * require 顺序……于是同一件事被重复构建了七八遍。
 *
 * 这里按「构建输入」做进程内记忆化：命中就把上一次的产物目录拷进当前
 * sandbox，不再跑构建。
 *
 * ## 为什么只在进程内，不落盘跨进程复用
 *
 * 缓存键覆盖不了「构建器自己的源码变了」。一旦落盘，改了 `src/builder/**`
 * 之后命中的还是旧产物 —— 构建没跑、断言全绿，是典型的假绿灯。
 * 进程内缓存没这个问题：一次 `npm test` 里构建器代码是固定的，
 * 输入相同 ⇒ 产物必然相同。
 *
 * ## 键里为什么不含 outputPath
 *
 * 各 spec 习惯给不同的 outputPath（`dist/testProject` / `dist/vite-polyfill`
 * …），但产物内容与它无关：chunk 名是内容哈希，sourcemap 注释是相对路径。
 * 把它算进键里就彻底失去共享的意义。
 *
 * ## 谁不该用
 *
 * 依赖构建的**进程内副作用**的 spec 不能用：命中缓存就不会跑构建，
 * `manifest-registry`、library meta 那些模块级注册表会是空的。
 * 典型是 `node-index-equivalence.spec.ts` 的按组件精确比对。
 */

/** 缓存目录：在 sandbox 之外，`host.restore()` 碰不到它。 */
const CACHE_ROOT = path.resolve(__dirname, '..', '.shared-build');

/** 参与指纹计算的目录/文件之外的东西一律忽略（构建不读它们）。 */
const IGNORE =
  /(^|[\\/])(dist|\.angular|\.vite|\.ng-cache|node_modules[\\/]\.vite)([\\/]|$)/;

const cache = new Map<string, string>();

function stableKey(root: string, options: Record<string, unknown>): string {
  const hash = createHash('sha1');
  const relevant: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(options).sort((a, b) =>
    a[0] < b[0] ? -1 : 1,
  )) {
    if (k === 'outputPath') continue;
    relevant[k] = v;
  }
  hash.update(JSON.stringify(relevant));
  hash.update('\0');

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (IGNORE.test(full)) continue;
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      hash.update(path.relative(root, full));
      hash.update('\0');
      hash.update(fs.readFileSync(full));
      hash.update('\0');
    }
  };
  walk(root);
  return hash.digest('hex').slice(0, 16);
}

/**
 * 与 `harness.useTarget(target, options)` + `executeOnce()` 等价，
 * 但相同输入在同一进程里只真正构建一次。
 *
 * 返回值形状与 `executeOnce()` 一致，调用方无需区分命中与否。
 */
export async function executeOnceShared<T extends object>(
  harness: BuilderHarness<T>,
  target: string,
  options: T,
) {
  const opts = options as Record<string, unknown>;
  const root = getSystemPath(harness.host.root());
  const outputPath = String(opts.outputPath ?? '');
  const dest = path.resolve(root, outputPath);
  // 键里不含 outputPath，没有 outputPath 就没法把产物放回 sandbox；
  // 更不能让空 outputPath 与某个带 outputPath 的构建撞键（命中后会 rmSync 掉整个 sandbox）。
  // 同理，outputPath 必得落在 sandbox 内，否则命中时会往 sandbox 外删东西。
  if (!outputPath || !dest.startsWith(root + path.sep)) {
    harness.useTarget(target, options);
    return harness.executeOnce();
  }
  const key = stableKey(root, opts);

  const cached = cache.get(key);
  if (cached && fs.existsSync(cached)) {
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(cached, dest, { recursive: true });
    return {
      result: { success: true, baseOutputPath: dest },
      error: undefined,
      logs: [],
    };
  }

  harness.useTarget(target, options);
  const executed = await harness.executeOnce();

  if (executed.result?.success && fs.existsSync(dest)) {
    publish(path.join(CACHE_ROOT, key), dest);
    cache.set(key, path.join(CACHE_ROOT, key));
  }
  return executed;
}

/**
 * 先写临时目录再 `rename` 发布。
 *
 * 缓存表是进程内的，多个 worker 会同时算出同一个 key。直接往
 * `CACHE_ROOT/<key>` 里 `cpSync` 的话，两边互相删对方刚建的目录，
 * `cpSync` 会当场抛 `cannot create directory`（严重时直接把 worker 带卡）。
 * rename 在同一文件系统上是原子的：读侧要么看不见，要么看见一份完整的。
 */
function publish(dir: string, from: string): void {
  if (fs.existsSync(dir)) return;
  fs.mkdirSync(CACHE_ROOT, { recursive: true });
  const tmp = `${dir}.tmp-${process.pid}`;
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  fs.cpSync(from, tmp, { recursive: true });
  try {
    fs.renameSync(tmp, dir);
  } catch {
    // 另一个 worker 抢先发布了，丢掉自己这份就行
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
