import type { Plugin } from 'vite';

/**
 * `require.context(dir, deep, reg)` 是 webpack 独有 API，Vite 完全不认，
 * 产物里原样留着，小程序运行时直接
 *   TypeError: require.context is not a function
 *
 * 坑在于它一般写在 test.ts 模块顶层，抛异常会把**同模块里它之后的所有代码**
 * 一起带走。典型表现：jasmine 全局装好了、app 也起来了、页面也渲染了，但
 * `setTimeout(startupTest)` 那行根本没执行，karma 客户端永远不连服务器，
 * 日志停在 "Starting browser miniprogram" 直到超时——从日志完全看不出断在哪。
 *
 * 为什么在 generateBundle 改产物，而不是在 transform 改源码：
 * Angular 的编译（experimental.useAngularCompilationAPI）用自己的 file host
 * 读 TS 源文件，**不吃 Vite transform 的返回值**。实测 transform 里替换成功、
 * 日志也打了 REPLACED，但最终 chunk 里还是原始 require.context
 * （只有 .map 里是改过的），所以 transform 这条路对 .ts 无效。
 * generateBundle 直接改 chunk.code，编译链谁也拦不住。
 */

/** 一条 spec 的「context key」与它在产物里的 chunk 文件名 */
export interface RequireContextModule {
  /** 相对 context dir 的 key，如 `./spec/first/component.spec.ts` */
  key: string;
  /** 产物 chunk 相对输出根的路径，如 `specs/spec/first/component.spec.js` */
  file: string;
}

/**
 * 匹配 require.context("dir"[, deep][, /regex/flags])
 *
 * 要照颐 Angular CLI 习惯的 TS 写法 `(require as any).context(...)`，
 * 编译前后两种形式都可能出现，这里一并覆盖。
 * 三个参数必须是字面量，推不出来就不动（宁可漏改，不要改错）。
 */
const CALLEE =
  '(?:require\\s*\\.\\s*context|\\(\\s*require\\s+as\\s+[^)]+\\)\\s*\\.\\s*context)';
const CALL_RE = new RegExp(
  CALLEE +
    '\\(\\s*([\'"])([^\'"\\n]*)\\1\\s*' +
    '(?:,\\s*(true|false)\\s*)?' +
    '(?:,\\s*/((?:\\\\.|[^/\\n\\\\])*)/([gimsuy]*)\\s*)?\\)',
  'g',
);

/** 产物路径一律 posix，且不能带前导 `/`（require 字面量要相对路径） */
function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

/** 从 fromFile 所在目录到 targetFile 的相对 require 路径 */
function relRequire(fromChunk: string, targetFile: string): string {
  const fromDir = toPosix(fromChunk).includes('/')
    ? toPosix(fromChunk).slice(0, toPosix(fromChunk).lastIndexOf('/') + 1)
    : '';
  const target = toPosix(targetFile);
  if (!fromDir) {
    return `./${target}`;
  }
  // 粗算：目标比当前 chunk 浅时逐级 ..
  const fromParts = fromDir.replace(/\/$/, '').split('/');
  let i = 0;
  while (
    i < fromParts.length &&
    i < target.split('/').length &&
    fromParts[i] === target.split('/')[i]
  ) {
    i += 1;
  }
  const up = '../'.repeat(fromParts.length - i);
  const down = target.split('/').slice(i).join('/');
  return (up || './') + down;
}

function buildReplacement(
  chunkFileName: string,
  dir: string,
  deep: string | undefined,
  regexSource: string | undefined,
  regexFlags: string | undefined,
  modules: RequireContextModule[],
): string {
  // 带 g 的正则 .test() 有 lastIndex 状态，过滤时会漏，去掉
  const flags = (regexFlags ?? '').replace(/g/g, '');
  const re = regexSource ? new RegExp(regexSource, flags) : null;
  const matched = modules.filter((m) => !re || re.test(m.key));

  const assigns = matched
    .map(
      (m) =>
        `  __mods[${JSON.stringify(m.key)}] = require(${JSON.stringify(
          relRequire(chunkFileName, m.file),
        )});`,
    )
    .join('\n');

  return (
    `(() => {\n` +
    `  const __mods = {};\n` +
    `${assigns}\n` +
    `  const __keys = Object.keys(__mods);\n` +
    `  const __ctx = (__k) => __mods[__k];\n` +
    `  __ctx.keys = () => __keys;\n` +
    `  __ctx.resolve = (__k) => __k;\n` +
    `  return __ctx;\n` +
    `})()`
  );
}

/**
 * 把产物里残留的 require.context 换成等价的同步 require 映射。
 *
 * modules 由调用方（karma builder）传入——它本来就已经把 spec 全量 glob
 * 出来并加进 entry 了，这里直接复用那份清单，保证「发现」只有一处真相。
 */
export function requireContextShimPlugin(
  modules: RequireContextModule[],
): Plugin {
  return {
    name: 'mini-program:require-context-shim',
    generateBundle(_options: unknown, bundle: Record<string, unknown>) {
      for (const [fileName, item] of Object.entries(bundle)) {
        const chunk = item as { type: string; code?: string };
        if (chunk.type !== 'chunk' || !chunk.code) {
          continue;
        }
        if (!/\.\s*context\s*\(/.test(chunk.code)) {
          continue;
        }
        CALL_RE.lastIndex = 0;
        let replaced = 0;
        const next = chunk.code.replace(
          CALL_RE,
          (full, _q, dir, deep, regSrc, flags) => {
            replaced += 1;
            return buildReplacement(
              fileName,
              String(dir),
              deep,
              typeof regSrc === 'string' ? regSrc : undefined,
              typeof flags === 'string' ? flags : undefined,
              modules,
            );
          },
        );
        if (replaced) {
          chunk.code = next;
        }
      }
    },
  };
}
