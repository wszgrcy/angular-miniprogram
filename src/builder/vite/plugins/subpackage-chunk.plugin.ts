import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'vite';
import { MpAppConfig, resolveSubPackages } from '../app-config';

/** 只处理这些扩展名的源文件归属判定 */
const SOURCE_EXT = /\.(t|j)sx?$/;

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

export interface SubpackageChunkPluginOptions {
  /** 已解析的 app 配置（含 subpackages） */
  appConfig: MpAppConfig;
  /** 项目 sourceRoot 绝对路径（posix） */
  sourceRoot: string;
}

/**
 * 分包 chunk 归位 + 跨分包/独立分包校验。
 *
 * 约定：分包 `root`（app.json 里声明）同时是**源码目录**与**产物目录**，
 * 即 `src/<root>/...` 的源码编译后落到 `<root>/...`。与 uni-app 的
 * 分包目录约定一致。
 *
 * 三件事：
 *  1. config()：把 chunkFileNames 改成函数——某 chunk 的全部模块都在
 *     某分包源码目录下时，产物落进该分包目录（分包自包含，主包瘦身）。
 *  2. generateBundle()：跨分包静态 import 检测——分包 A 的 chunk 直接
 *     依赖分包 B 的 chunk 时报错（小程序不允许跨分包 require）。
 *  3. generateBundle()：独立分包隔离——独立分包的 chunk 依赖主包 chunk
 *     时报错（独立分包不得依赖主包，需自带全部依赖）。
 */
export function subpackageChunkPlugin(
  options: SubpackageChunkPluginOptions
): Plugin {
  const subPackages = resolveSubPackages(options.appConfig);
  const sourceRoot = toPosix(options.sourceRoot);
  // 分包源码绝对目录，按长度降序，保证最深匹配优先
  const subSrcDirs = subPackages
    .map((sp) => ({
      root: sp.root,
      independent: sp.independent,
      srcDir: `${sourceRoot}/${sp.root}`,
    }))
    .sort((a, b) => b.srcDir.length - a.srcDir.length);

  /** 一个模块源路径属于哪个分包（源码目录前缀匹配），undefined=主包 */
  const zoneOfModule = (moduleId: string) => {
    const id = toPosix(moduleId);
    return subSrcDirs.find((d) => id.startsWith(`${d.srcDir}/`));
  };

  return {
    name: 'mini-program:subpackage-chunk',
    config(config) {
      if (!subSrcDirs.length) {
        return;
      }
      const output = (config.build?.rollupOptions?.output ?? {}) as Record<
        string,
        unknown
      >;
      output.chunkFileNames = (chunk: {
        moduleId?: string;
        moduleIds?: string[];
        name?: string;
      }) => {
        const ids = chunk.moduleIds?.length
          ? chunk.moduleIds
          : chunk.moduleId
          ? [chunk.moduleId]
          : [];
        // 全部模块都在同一个分包源码目录下 → 归入该分包目录
        const zones = new Set(
          ids.filter((id) => SOURCE_EXT.test(id)).map((id) => zoneOfModule(id))
        );
        if (zones.size === 1) {
          const zone = [...zones][0];
          if (zone) {
            return `${zone.root}/[name]-[hash].js`;
          }
        }
        return '[name]-[hash].js';
      };
      config.build = config.build ?? {};
      config.build.rollupOptions = {
        ...(config.build.rollupOptions ?? {}),
        output,
      };
    },
    generateBundle(_opts, bundle) {
      if (!subSrcDirs.length) {
        return;
      }
      interface Chunk {
        type: 'chunk';
        fileName: string;
        moduleIds: string[];
        imports: string[];
      }
      const chunks = Object.values(bundle).filter(
        (i) => i.type === 'chunk'
      ) as unknown as Chunk[];
      const zoneOfChunk = (chunk: Chunk) => {
        const zones = new Set(
          (chunk.moduleIds ?? [])
            .filter((id) => SOURCE_EXT.test(id))
            .map((id) => zoneOfModule(id))
        );
        // 只返回「纯属于某分包」的 zone；混包/主包返回 undefined
        if (zones.size === 1) {
          return [...zones][0];
        }
        return undefined;
      };
      const byFile = new Map(chunks.map((c) => [c.fileName, c]));
      const errors: string[] = [];

      for (const chunk of chunks) {
        const fromZone = zoneOfChunk(chunk);
        if (!fromZone) {
          continue;
        }
        for (const imp of chunk.imports) {
          const toChunk = byFile.get(imp);
          if (!toChunk) {
            continue;
          }
          const toZone = zoneOfChunk(toChunk);
          if (toZone && toZone.root !== fromZone.root) {
            errors.push(
              `跨分包静态依赖：分包 "${fromZone.root}" 的 chunk ` +
                `"${chunk.fileName}" 依赖了分包 "${toZone.root}" 的 ` +
                `"${toChunk.fileName}"（小程序不允许跨分包 require）`
            );
          }
          // 独立分包不得依赖主包 chunk
          if (fromZone.independent && !toZone) {
            errors.push(
              `独立分包 "${fromZone.root}" 依赖了主包 chunk ` +
                `"${toChunk.fileName}"（独立分包不得依赖主包，需自带依赖）`
            );
          }
        }
      }

      if (errors.length) {
        this.error(
          `分包校验失败：\n  - ${[...new Set(errors)].join('\n  - ')}`
        );
      }
    },
  };
}

/** 从 appJson 文件路径读取并解析配置（供 vite/index.ts 复用） */
export function readAppConfig(appJsonPath: string): MpAppConfig {
  return JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as MpAppConfig;
}
