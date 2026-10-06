/* eslint-disable no-console */
import fs from 'fs-extra';
import { COMPILE_NGC_TRANSFORM } from 'ng-packagr/src/lib/ng-package/entry-point/compile-ngc.di';
import type { NgPackagrOptions } from 'ng-packagr/src/lib/ng-package/options.di';
import { STYLESHEET_PROCESSOR } from 'ng-packagr/src/lib/styles/stylesheet-processor.di';
import path from 'path';
import { myCompileNgcTransformFactory } from './compile-ngc.transform';
import { writeLibraryMetaFile } from './library-meta-store';
import { hookWritePackage } from './remove-publish-only';
import { CustomStyleSheetProcessor } from './stylesheet-processor';

/**
 * 从 ng-package.json 解析库产物根目录（`dest`）。
 *
 * 传进来的可能是 ng-package.json 本身，也可能是包含它的目录，两种都接。
 */
export function resolveLibraryDistRoot(
  ngPackagePath: string,
): string | undefined {
  const candidates = [
    ngPackagePath,
    path.join(ngPackagePath, 'ng-package.json'),
  ].filter((p) => fs.existsSync(p) && fs.statSync(p).isFile());

  for (const cfgPath of candidates) {
    try {
      const dest = JSON.parse(fs.readFileSync(cfgPath, 'utf8')).dest;
      if (typeof dest === 'string') {
        return path.resolve(path.dirname(cfgPath), dest);
      }
    } catch {
      // 解析不了就试下一个候选
    }
  }
  return undefined;
}

/**
 * 构建收尾时的兵底刷盘。
 *
 * 正常情况下 `compile-ngc.transform` 已经在每个 entry 编译完后落过盘，
 * 这里只是再确认一次：万一某个 entry 走了缓存、没进 transform，
 * 至少 build 路径上还能补一次。
 *
 * 旧实现是「把被扁平化抖掉的标记补写回 d.ts」，那个问题现在不存在了：
 * 元数据不在 d.ts 里，扁平化碰不到它。详见 `library-meta-schema.ts`。
 */
function flushLibraryMetaSidecar(ngPackagePath: string): void {
  const distRoot = resolveLibraryDistRoot(ngPackagePath);
  if (!distRoot) {
    console.warn(
      '⚠ 未能从 ng-package.json 解析出 dest，跳过库元数据 sidecar 刷盘；' +
        '依赖 host listeners 的指令（表单等）将不会生成事件绑定。',
    );
    return;
  }
  writeLibraryMetaFile(distRoot);
}

export async function ngPackagrFactory(
  project: string,
  tsConfig: string | undefined,
) {
  const packager = (await import('ng-packagr')).ngPackagr();

  packager.forProject(project);

  if (tsConfig) {
    packager.withTsConfig(tsConfig);
  }

  COMPILE_NGC_TRANSFORM.useFactory = myCompileNgcTransformFactory;
  STYLESHEET_PROCESSOR.useFactory = () => CustomStyleSheetProcessor;
  packager.withProviders([COMPILE_NGC_TRANSFORM, hookWritePackage()]);

  /**
   * 包一层 `build` / `watch`，在原有流程走完后补写标记。
   *
   * 放在这里而不是 `builder.ts`，是因为 `npm run build:library` 直接调本工厂，
   * 不经过 architect builder；在这里包一次两条路径都能覆盖。
   */
  const rawBuild = packager.build.bind(packager);
  packager.build = ((options?: NgPackagrOptions) => {
    return Promise.resolve(rawBuild(options)).then((r) => {
      flushLibraryMetaSidecar(project);
      return r;
    });
  }) as typeof packager.build;

  const rawWatch = packager.watch.bind(packager);
  packager.watch = ((options?: NgPackagrOptions) => {
    flushLibraryMetaSidecar(project);
    return rawWatch(options);
  }) as typeof packager.watch;

  return packager;
}
