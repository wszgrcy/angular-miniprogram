import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'vite';
import type { PlatformFileExtname } from '../../platform/type';

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

export interface NativeComponentMeta {
  /** wxml 里的标签名 */
  tag: string;
  /** 原生组件主文件相对产物根的路径（不含扩展名），如 wxcomponents/custom/custom */
  outputPathNoExt: string;
}

export interface NativeComponentsPluginOptions {
  /** 原生组件目录（相对 workspaceRoot），如 wxcomponents */
  nativeComponentsDir: string;
  workspaceRoot: string;
  fileExtname: PlatformFileExtname;
  /** 自定义标签名映射：{ 目录名: 标签名 }，不配则标签名=目录名 */
  tagMap?: Record<string, string>;
}

/**
 * 原生小程序自定义组件接入（对应 uni-app 的 wxcomponents 能力）。
 *
 * 目录约定：`<nativeComponentsDir>/<dirName>/` 内含一个与目录同名的
 * `.json`（组件配置）即视为一个原生自定义组件，标签名默认取目录名。
 *
 * 两件事：
 *  1. 把整个原生组件目录原样拷进产物（路径不变，供 usingComponents 指过去）。
 *  2. generateBundle（post，晚于 assets 插件）扫描已产出的 wxml，命中
 *     原生标签时，往同级 `.json` 注入 usingComponents 指向原生组件主文件。
 *
 * 这样 Angular 组件模板里直接写 `<van-button>`（配 NO_ERRORS_SCHEMA 规避
 * Angular 校验），构建后自动接上原生组件，无需手写相对路径。
 */
export function nativeComponentsPlugin(
  options: NativeComponentsPluginOptions
): Plugin {
  const absDir = path.resolve(
    options.workspaceRoot,
    options.nativeComponentsDir
  );
  // 产物里的基路径取目录基名：src/wxcomponents -> wxcomponents，
  // 避免把源码 src/ 前缀带进产物（对齐 uni-app wxcomponents 落产物根）
  const outputBase = toPosix(
    path.basename(options.nativeComponentsDir)
  );
  const contentExt = options.fileExtname.content; // .wxml
  const configExt = options.fileExtname.config; // .json

  /** 发现原生组件：目录下存在同名 .json 即认定 */
  const discover = (): NativeComponentMeta[] => {
    if (!fs.existsSync(absDir)) {
      return [];
    }
    const metas: NativeComponentMeta[] = [];
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const dirName = entry.name;
      const mainJson = path.join(absDir, dirName, `${dirName}${configExt}`);
      if (fs.existsSync(mainJson)) {
        metas.push({
          tag: options.tagMap?.[dirName] ?? dirName,
          outputPathNoExt: toPosix(
            path.join(outputBase, dirName, dirName)
          ),
        });
      }
    }
    return metas;
  };

  return {
    name: 'mini-program:native-components',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      const metas = discover();
      if (!metas.length) {
        return;
      }

      // 1. 拷贝整个原生组件目录进产物（保持相对路径）
      const copyDir = (relDir: string) => {
        const absCur = path.join(absDir, relDir);
        for (const entry of fs.readdirSync(absCur, { withFileTypes: true })) {
          const relChild = relDir ? path.join(relDir, entry.name) : entry.name;
          if (entry.isDirectory()) {
            copyDir(relChild);
          } else {
            const fileName = toPosix(
              path.join(outputBase, relChild)
            );
            this.emitFile({
              type: 'asset',
              fileName,
              source: fs.readFileSync(path.join(absCur, entry.name)),
            });
          }
        }
      };
      copyDir('');

      // 2. 扫 wxml，命中原生标签则往同级 json 注入 usingComponents
      const wxmlAssets = Object.entries(bundle).filter(([name]) =>
        name.endsWith(contentExt)
      );
      for (const [wxmlName] of wxmlAssets) {
        const wxml = String(
          (bundle[wxmlName] as { source?: unknown }).source ?? ''
        );
        const hits = metas.filter((m) =>
          new RegExp(`<${m.tag}[\\s/>]`).test(wxml)
        );
        if (!hits.length) {
          continue;
        }
        const jsonName =
          wxmlName.slice(0, -contentExt.length) + configExt;
        const jsonAsset = bundle[jsonName] as
          | { type: 'asset'; source: string | Uint8Array }
          | undefined;
        if (!jsonAsset) {
          continue;
        }
        let config: {
          usingComponents?: Record<string, string>;
          [k: string]: unknown;
        };
        try {
          config = JSON.parse(String(jsonAsset.source)) as typeof config;
        } catch {
          continue;
        }
        config.usingComponents = config.usingComponents ?? {};
        for (const hit of hits) {
          // 相对路径：从该 wxml 所在目录到原生组件主文件
          const rel = toPosix(
            path.posix.relative(
              path.posix.dirname(wxmlName),
              hit.outputPathNoExt
            )
          );
          config.usingComponents[hit.tag] = rel.startsWith('.')
            ? rel
            : `./${rel}`;
        }
        jsonAsset.source = JSON.stringify(config);
      }
    },
  };
}
