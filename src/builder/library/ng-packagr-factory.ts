/* eslint-disable no-console */
import fs from 'fs-extra';
import { COMPILE_NGC_TRANSFORM } from 'ng-packagr/src/lib/ng-package/entry-point/compile-ngc.di';
import type { NgPackagrOptions } from 'ng-packagr/src/lib/ng-package/options.di';
import { STYLESHEET_PROCESSOR } from 'ng-packagr/src/lib/styles/stylesheet-processor.di';
import path from 'path';
import { myCompileNgcTransformFactory } from './compile-ngc.transform';
import { flushLibraryMetaMarkers } from './library-meta-marker';
import { hookWritePackage } from './remove-publish-only';
import { CustomStyleSheetProcessor } from './stylesheet-processor';

/**
 * 从 ng-package.json 解析库产物根目录（`dest`）。
 *
 * 传进来的可能是 ng-package.json 本身，也可能是包含它的目录，两种都接。
 */
export function resolveLibraryDistRoot(
  ngPackagePath: string
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
 * 构建结束后把库元信息标记补写回最终的 `dist/types/*.d.ts`。
 *
 * ng-packagr 22 的 d.ts 扁平化会把 `X_Listeners` / `X_Properties` 这些
 * 不在导出引用图里的 `declare const` tree-shake 掉。标记一丢，应用侧
 * `getLibraryDirectiveMeta()` 拿到空数组，并**覆盖掉** `host.listeners`，
 * 生成的 wxml 里一个事件绑定都没有 —— 表单输入、勾选、picker 全部
 * 不响应，而且**没有任何报错**。
 *
 * 详见 `library-meta-marker.ts`。
 */
function flushMarkersOrWarn(ngPackagePath: string): void {
  const distRoot = resolveLibraryDistRoot(ngPackagePath);
  if (!distRoot) {
    console.warn(
      '⚠ 未能从 ng-package.json 解析出 dest，跳过库元信息标记补写；' +
        '依赖 host listeners 的指令（表单等）将不会生成事件绑定。'
    );
    return;
  }
  const written = flushLibraryMetaMarkers(distRoot);
  if (written.length === 0) {
    console.warn(
      '⚠ 没有可补写的库元信息标记（本次构建未产出任何指令元数据）；' +
        '依赖 host listeners 的指令（表单等）将不会生成事件绑定。'
    );
  }
}

export async function ngPackagrFactory(
  project: string,
  tsConfig: string | undefined
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
      flushMarkersOrWarn(project);
      return r;
    });
  }) as typeof packager.build;

  const rawWatch = packager.watch.bind(packager);
  packager.watch = ((options?: NgPackagrOptions) => {
    flushMarkersOrWarn(project);
    return rawWatch(options);
  }) as typeof packager.watch;

  return packager;
}
