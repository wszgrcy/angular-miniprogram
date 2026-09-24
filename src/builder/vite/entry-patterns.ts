import type { BuilderContext } from '@angular-devkit/architect';
import {
  type Path,
  getSystemPath,
  normalize,
  resolve,
} from '@angular-devkit/core';
import * as glob from 'glob';
import * as path from 'path';
import type { BuildPlatform } from '../platform/platform';
import type { AssetPattern } from '../shared/asset-pattern';
import type { PagePattern } from '../shared/type';
import { normalizeAssetPatternsSafe , toPosixPath } from '../util/asset-path';

function globAsync(pattern: string, options: glob.IOptions) {
  return new Promise<string[]>((resolvePromise, reject) =>
    glob.default(pattern, options, (e, m) =>
      e ? reject(e) : resolvePromise(m)
    )
  );
}

export interface ResolvedProjectRoots {
  absoluteProjectRoot: Path;
  absoluteProjectSourceRoot: Path;
}

/**
 * 解析项目根目录 / 源码根目录。
 *
 * 从 DynamicWatchEntryPlugin 里抽出来的，逻辑没变，只是不再依赖 webpack 的
 * Compiler，Vite 侧和 webpack 侧共用一份。
 */
export async function resolveProjectRoots(options: {
  workspaceRoot: string;
  context: BuilderContext;
}): Promise<ResolvedProjectRoots> {
  const projectName = options.context.target?.project;
  if (!projectName) {
    throw new Error('The builder requires a target.');
  }
  const projectMetadata = await options.context.getProjectMetadata(projectName);
  const absoluteProjectRoot = normalize(
    getSystemPath(
      resolve(
        normalize(options.workspaceRoot),
        normalize((projectMetadata.root as string) || '')
      )
    )
  );
  const relativeSourceRoot = projectMetadata.sourceRoot as string | undefined;
  if (typeof relativeSourceRoot !== 'string') {
    throw new Error('项目缺少 sourceRoot');
  }
  const absoluteProjectSourceRoot = normalize(
    getSystemPath(
      resolve(normalize(options.workspaceRoot), normalize(relativeSourceRoot))
    )
  );
  return { absoluteProjectRoot, absoluteProjectSourceRoot };
}

/**
 * 把 pages / components 的 AssetPattern 展开成 PagePattern 列表。
 *
 * 每个 PagePattern 带 entryName 和 outputFiles（logic / style / content / config），
 * Vite 侧直接用它拼 rollupOptions.input 和产物路径。
 */
export async function generateModuleInfo(
  list: AssetPattern[],
  type: 'page' | 'component',
  options: {
    workspaceRoot: string;
    absoluteProjectRoot: Path;
    absoluteProjectSourceRoot: Path;
  },
  buildPlatform: BuildPlatform
): Promise<PagePattern[]> {
  if (!list?.length) {
    return [];
  }
  const patternList = normalizeAssetPatternsSafe(
    list,
    options.workspaceRoot,
    options.absoluteProjectRoot,
    options.absoluteProjectSourceRoot
  );
  const moduleList: PagePattern[] = [];
  for (const pattern of patternList) {
    const cwd = path.resolve(options.workspaceRoot, pattern.input);
    const files = await globAsync(pattern.glob, {
      cwd,
      dot: true,
      nodir: true,
      ignore: pattern.ignore || [],
      follow: pattern.followSymlinks,
    });

    moduleList.push(
      ...files.map((file) => {
        const object: Partial<PagePattern> = {
          entryName: path.basename(file, '.ts').replace(/\./g, '-'),
          fileName: file,
          src: path.join(cwd, file),
          ...pattern,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          outputFiles: {} as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputFiles: {} as any,
        };
        object.inputFiles!.config = object.src!.replace(
          /\.ts$/,
          buildPlatform.fileExtname.config!
        );
        const outputFileName =
          object.fileName!.replace(/\.ts$/, '').replace(/\./g, '-') + '.ts';
        object.outputFiles!.path = path
          .join(pattern.output, outputFileName)
          .replace(/\.ts$/, '');
        object.outputFiles!.logic =
          object.outputFiles!.path + buildPlatform.fileExtname.logic;
        object.outputFiles!.style =
          object.outputFiles!.path + buildPlatform.fileExtname.style;
        object.outputFiles!.content =
          object.outputFiles!.path + buildPlatform.fileExtname.content;
        object.outputFiles!.config =
          object.outputFiles!.path + buildPlatform.fileExtname.config;
        object.type = type;
        return object as PagePattern;
      })
    );
  }
  return moduleList;
}

export interface EntryPatternResult {
  pageList: PagePattern[];
  componentList: PagePattern[];
}

export async function generateEntryPatterns(options: {
  pages: AssetPattern[];
  components: AssetPattern[];
  workspaceRoot: string;
  context: BuilderContext;
  buildPlatform: BuildPlatform;
}): Promise<EntryPatternResult> {
  const { absoluteProjectRoot, absoluteProjectSourceRoot } =
    await resolveProjectRoots(options);
  const roots = {
    workspaceRoot: options.workspaceRoot,
    absoluteProjectRoot,
    absoluteProjectSourceRoot,
  };
  return {
    pageList: await generateModuleInfo(
      options.pages || [],
      'page',
      roots,
      options.buildPlatform
    ),
    componentList: await generateModuleInfo(
      options.components || [],
      'component',
      roots,
      options.buildPlatform
    ),
  };
}

/**
 * 把 PagePattern 列表转成 Vite/Rollup 的多入口 input。
 *
 * key 用 outputFiles.path（含目录），Rollup 的 `[name]` 会把整个 key 展开进去，
 * 所以 entryFileNames: '[name].js' 就能产出 `pages/index/index-entry.js`
 * 这种带目录的路径，和 webpack 时代的 outputFiles.logic 对齐。
 */
export function toRollupInput(
  patternList: PagePattern[]
): Record<string, string> {
  const input: Record<string, string> = {};
  for (const item of patternList) {
    // key 必须正斜杠：Windows 下 outputFiles.path 是 path.join 出来的
    // 反斜杠形式，会一路带进 chunk fileName 和 app.js 的 require 字面量
    input[toPosixPath(item.outputFiles.path)] = item.src;
  }
  return input;
}
