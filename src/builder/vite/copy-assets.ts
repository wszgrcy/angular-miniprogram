import { type Path, normalize } from '@angular-devkit/core';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import type { AssetPattern } from '../shared/asset-pattern';
import { normalizeAssetPatternsSafe } from '../util/asset-path';

function globAsync(pattern: string, options: glob.IOptions) {
  return new Promise<string[]>((resolvePromise, reject) =>
    glob.default(pattern, options, (e, m) =>
      e ? reject(e) : resolvePromise(m)
    )
  );
}

export interface CopiedAsset {
  /** 相对输出目录的路径 */
  outputRelPath: string;
  /** 源文件绝对路径 */
  sourcePath: string;
}

/**
 * 把 builder 配置里的 assets 展开成「输出相对路径 -> 源文件」列表。
 *
 * webpack 侧由 copy-webpack-plugin 处理，Vite 侧没有对应物，
 * 但 normalizeAssetPatterns 这套 devkit 逻辑跟 webpack 无关，可以直接复用。
 *
 * app.json / project.config.json 就是通过这里进产物的。
 */
export async function collectAssets(
  assets: AssetPattern[] | undefined,
  options: {
    workspaceRoot: string;
    absoluteProjectRoot: Path;
    absoluteProjectSourceRoot: Path;
  }
): Promise<CopiedAsset[]> {
  if (!assets?.length) {
    return [];
  }
  const patternList = normalizeAssetPatternsSafe(
    assets,
    options.workspaceRoot,
    options.absoluteProjectRoot,
    options.absoluteProjectSourceRoot
  );
  const result: CopiedAsset[] = [];
  for (const pattern of patternList) {
    const cwd = path.resolve(options.workspaceRoot, pattern.input);
    const files = await globAsync(pattern.glob, {
      cwd,
      dot: true,
      ignore: pattern.ignore || [],
      follow: pattern.followSymlinks,
    });
    for (const file of files) {
      const sourcePath = path.join(cwd, file);
      if (!fs.statSync(sourcePath).isFile()) {
        continue;
      }
      // glob 匹配到目录时（如 `assets/**` 里的目录项）跳过
      result.push({
        outputRelPath: path
          .join(pattern.output, file)
          .split(path.sep)
          .join('/'),
        sourcePath,
      });
    }
  }
  return result;
}
