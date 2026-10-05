/**
 * 配置文件清单与解析。
 *
 * 每个输出文件登记一条：叫什么（各平台不同）、能不能合并、用户手写那份从哪来、
 * 构建器允许补哪些字段、输出前怎么按平台改写。生成逻辑只能往登记过的字段写，
 * 没登记就没有写入入口 —— 从代码结构上堵住构建器随手往用户配置里塞东西。
 *
 * 合并顺序（前面写过的后面都不动）：
 *   静态文件 → 静态文件的 _platform 段 → 结构化配置 → 它的 _platform 段
 *   → 内置默认值 → 构建器补的 → 当前平台的写法要求
 */

import type { AssetPattern } from '@angular-devkit/build-angular';
import type { Path } from '@angular-devkit/core';
import * as fs from 'fs';
import * as path from 'path';
import {
  BuildPlatform,
  PlatformType,
  findUnsupportedCapabilities,
} from '../platform/platform';
import { isPathIn, stripPathPrefix, toPosixPath } from '../util/path';
import {
  type MpAppConfig,
  type MpSubPackagePage,
  findSubPackageByPath,
  resolveSubPackages,
  validateAppConfig,
} from './app-config';
import {
  type MpSubPackage,
  checkPlatformSection,
  pickPlatformSection,
  validateAppConfigShape,
  validateProjectConfigShape,
} from './config-schema';
import { type CopiedAsset, collectAssets } from './copy-assets';
import {
  APP_CONFIG_KEYS,
  type MpConfigObject,
  PROJECT_CONFIG_KEYS,
  findMisplacedKeys,
  mergeChanged,
  mergeConfig,
  mergeDerived,
  stripInternalKeys,
  unifySubPackageKey,
} from './merge-config';

/** 校验严格度：`off` 用于「先绕过校验把工程跑起来」 */
export type MpConfigValidateLevel = 'error' | 'warn' | 'off';

/** 构建器补字段时能拿到的上下文 */
export interface MpDeriveContext {
  platform: BuildPlatform;
  platformType: PlatformType;
  /** 本次构建产出的页面路径（不含扩展名，分包页已拼上 root） */
  builtPagePaths: string[];
  /** 本次构建产出的自定义 tabBar 入口路径 */
  builtTabbarPaths: string[];
  /** 由 `subpackages` pattern 扫出来的入口归出的分包声明 */
  derivedSubPackages: MpSubPackage[];
  /** 是否生成调试启动项（只是方便一下，默认关） */
  deriveCondition: boolean;
  /** 已合并的 app 配置，project 的派生字段要用 */
  appConfig: MpConfigObject;
}

/**
 * 构建器补字段的一条登记。
 *
 * `deep` 是「只补空」的唯一例外通道：默认整个 key 写过了就不动，
 * 只有自定义 tabBar 开关需要往用户已写的 `tabBar` 里补一个子字段。
 * 没登记的字段就没有写入入口。
 */
export interface MpDeriveEntry {
  /** 要补的内容；返回 undefined 表示本次不补 */
  patch: (ctx: MpDeriveContext) => MpConfigObject | undefined;
  /** 允许往用户已写的同名对象里补缺失的子字段 */
  deep?: boolean;
}

export interface MpConfigSpec {
  name: 'app' | 'project';
  /** 输出文件名（各平台不同） */
  filename: (p: BuildPlatform) => string;
  /** 用户手写那份在产物里叫什么（按顺序优先，先命中先用） */
  staticNames: (p: BuildPlatform) => string[];
  /** 用户结构化配置的选项名 */
  patchOption?: 'appJson' | 'projectConfig';
  /** 内置默认值（只补用户文件里没写的字段） */
  defaults?: (p: BuildPlatform) => MpConfigObject;
  /** 允许构建器补的字段名单 */
  derive?: Record<string, MpDeriveEntry>;
  /** 形状校验（对合并完的最终对象跑） */
  shape?: (merged: MpConfigObject) => string[];
  /** 语义校验 */
  validate?: (merged: MpConfigObject, ctx: MpDeriveContext) => string[];
  /** 输出前按当前平台改写 */
  normalize?: (merged: MpConfigObject, p: BuildPlatform) => MpConfigObject;
}

/**
 * 永远原样拷贝、绝不参与合并的文件。
 *
 * `project.private.config.json` 是本地私有文件（一般不进 git），合并它等于
 * 把别人机器上的配置写进用户产物；`sitemap.json` / `theme.json` / `ext.json`
 * 是平台原样读取的文件，动它没有任何收益。
 */
export const COPY_ONLY_CONFIG_FILES = [
  'project.private.config.json',
  'sitemap.json',
  'theme.json',
  'ext.json',
];

/** 入口 → 分包声明的输入 */
export interface MpSubPackageEntry {
  /** 产物路径（不含扩展名，已含 root 前缀） */
  path: string;
  /** 入口来自哪个 pattern 的 output，就是分包 root */
  root: string;
  /** pattern 上声明的独立分包 */
  independent?: boolean;
}

/**
 * 按入口目录归出分包声明。
 *
 * root 就是 pattern 的 output（约定：root 同时是源码目录与产物目录），
 * pages 是剔掉 root 前缀的入口路径——app.json 里分包页本来就是相对 root 的。
 */
export function groupSubPackages(entries: MpSubPackageEntry[]): MpSubPackage[] {
  const byRoot = new Map<string, MpSubPackage>();
  for (const entry of entries) {
    const root = toPosixPath(entry.root).replace(/\/+$/, '');
    if (!root) {
      continue;
    }
    const full = toPosixPath(entry.path);
    const page = stripPathPrefix(root, full) ?? full;
    const current = byRoot.get(root);
    if (current) {
      (current.pages ??= []).push(page);
      // 不凭空造字段：没声明独立分包就根本不写这个 key
      if (entry.independent) {
        current.independent = true;
      }
      continue;
    }
    byRoot.set(root, {
      root,
      pages: [page],
      ...(entry.independent ? { independent: true } : {}),
    });
  }
  return [...byRoot.values()];
}

/**
 * 分包声明：`subpackages` pattern 扫出来的入口直接产声明。
 *
 * 用户已经写过的 root 以他那份为准：他的页在前，扫出来的追加在后面；
 * 只写了 root 没写 pages 时由这里填上。
 */
function deriveSubPackages(ctx: MpDeriveContext): MpConfigObject | undefined {
  if (!ctx.derivedSubPackages.length) {
    return undefined;
  }
  const key = ctx.platform.mpConfig?.subPackageKey ?? 'subpackages';
  return { [key]: ctx.derivedSubPackages };
}

/** 从 pages 生成开发者工具的调试启动项 */
function deriveCondition(ctx: MpDeriveContext): MpConfigObject | undefined {
  const pages = (ctx.appConfig.pages ?? []) as MpSubPackagePage[];
  const list = pages
    .map((page) => (typeof page === 'string' ? page : page.path))
    .filter(Boolean)
    .map((pathName, index) => ({
      id: index,
      name: pathName,
      pathName,
      query: '',
    }));
  if (!list.length) {
    return undefined;
  }
  return { condition: { miniprogram: { current: 0, list } } };
}

/**
 * 自定义 tabBar 的开关：本次有没有产出这个入口只有构建器知道。
 *
 * 用户没写开关且本次有产出 → 补 true；显式写了 false → 不补不改（入口当普通
 * 组件）；写了 true 但没产出 → 也不动、不报错，用户写什么就输出什么。
 */
function deriveCustomTabbarFlag(
  ctx: MpDeriveContext,
): MpConfigObject | undefined {
  const spec = ctx.platform.customTabbar;
  if (!spec) {
    return undefined;
  }
  if (!ctx.builtTabbarPaths.includes(`${spec.dir}/index`)) {
    return undefined;
  }
  return { tabBar: { [spec.flag]: true } };
}

export const MP_CONFIG_SPECS: Record<'app' | 'project', MpConfigSpec> = {
  app: {
    name: 'app',
    filename: (p) => `app${p.fileExtname.config ?? '.json'}`,
    staticNames: (p) => [`app${p.fileExtname.config ?? '.json'}`],
    patchOption: 'appJson',
    derive: {
      // 分包排在 pages 前面：pages 派生要靠它把分包页从主包里剔出去
      subpackages: { patch: deriveSubPackages, deep: true },
      // pages 是追加：用户写的在前，构建器扫出来的追加在后面，去重、不改顺序。
      // 落在分包 root 下的入口算分包页，不能进主包 pages
      pages: {
        patch: (ctx) => {
          const subs = resolveSubPackages(ctx.appConfig as MpAppConfig);
          const pages = ctx.builtPagePaths.filter(
            (page) => !findSubPackageByPath(subs, page),
          );
          return pages.length ? { pages } : undefined;
        },
      },
      customTabbarFlag: { patch: deriveCustomTabbarFlag, deep: true },
    },
    shape: (merged) => validateAppConfigShape(merged),
    validate: (merged, ctx) => [
      ...validateAppConfig(merged, ctx.builtPagePaths),
      ...findUnsupportedCapabilities(merged, ctx.platform),
    ],
    normalize: (merged, p) => {
      let result = unifySubPackageKey(
        merged,
        p.mpConfig?.subPackageKey ?? 'subpackages',
      );
      if (p.mpConfig?.normalizeAppJson) {
        result = p.mpConfig.normalizeAppJson(result);
      }
      return result;
    },
  },
  project: {
    name: 'project',
    filename: (p) => p.mpConfig?.projectFilename ?? 'project.config.json',
    staticNames: (p) => [
      ...(p.mpConfig?.projectOverrides ?? []),
      p.mpConfig?.projectFilename ?? 'project.config.json',
    ],
    patchOption: 'projectConfig',
    defaults: (p) => p.mpConfig?.projectDefaults?.() ?? {},
    derive: {
      appid: { patch: () => ({ appid: 'touristappid' }) },
      condition: {
        patch: (ctx) =>
          ctx.deriveCondition ? deriveCondition(ctx) : undefined,
      },
    },
    shape: (merged) => validateProjectConfigShape(merged),
    normalize: (merged, p) =>
      p.mpConfig?.normalizeProjectJson
        ? p.mpConfig.normalizeProjectJson(merged)
        : merged,
  },
};

export interface MpConfigResolveInput {
  workspaceRoot: string;
  platform: BuildPlatform;
  platformType: PlatformType;
  /** 已展开的 assets（静态那份配置文件从这里找） */
  assets: CopiedAsset[];
  appJson?: string;
  projectConfig?: string;
  appJsonValidate?: MpConfigValidateLevel;
  deriveCondition?: boolean;
  /** 由 `subpackages` pattern 扫出来的入口归出的分包声明 */
  derivedSubPackages?: MpSubPackage[];
  builtPagePaths: string[];
  builtTabbarPaths: string[];
}

export interface ResolvedMpConfig {
  spec: MpConfigSpec;
  /** 输出文件名 */
  filename: string;
  /** 合并完的最终对象（已按平台改写） */
  config: MpConfigObject;
  /** 有值表示没有任何可合并内容，逐字节输出这份原文 */
  verbatimText?: string;
  /** 参与本次解析的源文件（watch 要盯的就是这几个） */
  sources: string[];
  /** 本次校验的强度，下游补检查（引用文件存在性等）跟着它走 */
  level: MpConfigValidateLevel;
  errors: string[];
  warnings: string[];
  /** 被合并流程接管的 asset 源路径，原样拷贝时要跳过 */
  consumedAssets: string[];
}

interface ReadJsonResult {
  text: string;
  data?: MpConfigObject;
  error?: string;
}

function readJsonFile(absPath: string, label: string): ReadJsonResult {
  let text: string;
  try {
    text = fs.readFileSync(absPath, 'utf8');
  } catch (e) {
    return {
      text: '',
      error: `${label} 读取失败 ${absPath}: ${String(
        (e as Error)?.message ?? e,
      )}`,
    };
  }
  try {
    const parsed = JSON.parse(text) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return { text, error: `${label} 必须是一个 JSON 对象: ${absPath}` };
    }
    return { text, data: parsed as MpConfigObject };
  } catch (e) {
    return {
      text,
      error: `${label} JSON 解析失败 ${absPath}: ${String(
        (e as Error)?.message ?? e,
      )}`,
    };
  }
}

function resolveOne(
  spec: MpConfigSpec,
  input: MpConfigResolveInput,
  appConfig: MpConfigObject,
): ResolvedMpConfig {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sources: string[] = [];
  const consumedAssets: string[] = [];
  const filename = spec.filename(input.platform);
  const label = filename;

  // 1. 静态那份（assets 里命中的第一个候选名）
  let staticText: string | undefined;
  let staticData: MpConfigObject | undefined;
  for (const name of spec.staticNames(input.platform)) {
    const hit = input.assets.find(
      (asset) => path.posix.basename(asset.outputRelPath) === name,
    );
    if (!hit) {
      continue;
    }
    const read = readJsonFile(hit.sourcePath, label);
    sources.push(hit.sourcePath);
    if (read.error) {
      errors.push(read.error);
      continue;
    }
    staticText = read.text;
    staticData = read.data;
    consumedAssets.push(hit.sourcePath);
    break;
  }

  // 2. 结构化配置选项指向的文件
  const optionValue = spec.patchOption ? input[spec.patchOption] : undefined;
  let patchData: MpConfigObject | undefined;
  if (optionValue) {
    const abs = path.resolve(input.workspaceRoot, optionValue);
    sources.push(abs);
    if (!fs.existsSync(abs)) {
      errors.push(`${spec.patchOption} 配置文件不存在: ${optionValue}`);
    } else {
      const read = readJsonFile(abs, label);
      if (read.error) {
        errors.push(read.error);
      } else {
        const patch = read.data as MpConfigObject;
        patchData = patch;
        errors.push(...checkPlatformSection(patch, `${spec.patchOption} 文件`));
      }
    }
  }

  // 3. 逐层补空：静态段 → 它的平台段 → 结构化段 → 它的平台段 → 默认值 → 派生
  const subPackageKey = input.platform.mpConfig?.subPackageKey ?? 'subpackages';
  /**
   * 一份来源先收敛分包写法。
   *
   * 同一个文件里两种写法都写属于写错了：不收敛的话后一种会被当成「已写过」
   * 静默丢掉，收敛后两份合在一起并说一声。
   */
  const unifySource = (
    data: MpConfigObject | undefined,
    where: string,
  ): MpConfigObject | undefined => {
    if (!data) {
      return data;
    }
    const both =
      Array.isArray(data.subpackages) && Array.isArray(data.subPackages);
    const unified = unifySubPackageKey(data, subPackageKey);
    if (both) {
      warnings.push(
        `${where} 里 subpackages 与 subPackages 同时写了，已合并为 ${subPackageKey}（保留一份就够）`,
      );
    }
    return unified;
  };
  staticData = unifySource(staticData, filename);
  const patched = unifySource(patchData, `${spec.patchOption} 文件`);
  let merged: MpConfigObject = stripInternalKeys(staticData ?? {});
  let mutated = false;
  const apply = (patch: MpConfigObject | undefined, derived = false): void => {
    if (!patch) {
      return;
    }
    const before = merged;
    merged = derived
      ? mergeDerived(merged, stripInternalKeys(patch))
      : mergeConfig(merged, stripInternalKeys(patch));
    mutated ||= mergeChanged(before, merged);
  };
  const applySection = (source: MpConfigObject | undefined) => {
    if (!source) {
      return;
    }
    apply(pickPlatformSection(source, input.platformType));
  };

  applySection(staticData);
  apply(patched);
  applySection(patched);
  apply(spec.defaults ? spec.defaults(input.platform) : undefined);

  const ctx: MpDeriveContext = {
    platform: input.platform,
    platformType: input.platformType,
    builtPagePaths: input.builtPagePaths,
    builtTabbarPaths: input.builtTabbarPaths,
    derivedSubPackages: input.derivedSubPackages ?? [],
    deriveCondition: !!input.deriveCondition,
    // app 自己的派生要看得见已经合进来的内容（分包信息决定哪些入口算分包页），
    // project 的派生用的才是 app 的成品
    get appConfig() {
      return spec.name === 'app' ? merged : appConfig;
    },
  };
  for (const entry of Object.values(spec.derive ?? {})) {
    apply(entry.patch(ctx), entry.deep);
  }

  // 4. 平台写法
  const beforeNormalize = merged;
  merged = spec.normalize ? spec.normalize(merged, input.platform) : merged;
  mutated ||= mergeChanged(beforeNormalize, merged);

  // 5. 校验：先形状后语义，形状不过就早退
  //    纯静态那份是用户从别的项目搬过来的，内容合规与否我们控制不了，固定 warn
  const level: MpConfigValidateLevel = optionValue
    ? spec.name === 'app'
      ? input.appJsonValidate ?? 'error'
      : 'error'
    : 'warn';
  if (level !== 'off') {
    const shapeErrors = spec.shape ? spec.shape(merged) : [];
    const semanticErrors = shapeErrors.length
      ? []
      : spec.validate
        ? spec.validate(merged, ctx)
        : [];
    const all = [...shapeErrors, ...semanticErrors];
    if (all.length) {
      const message = `${filename} 校验失败:\n  - ${all.join('\n  - ')}`;
      (level === 'error' ? errors : warnings).push(message);
    }
  }

  // 6. 写错文件的提醒：只提醒，不搬运也不丢
  const misplaced =
    spec.name === 'app'
      ? findMisplacedKeys(merged, PROJECT_CONFIG_KEYS)
      : findMisplacedKeys(merged, APP_CONFIG_KEYS);
  if (misplaced.length) {
    const target = spec.name === 'app' ? 'projectConfig' : 'appJson';
    warnings.push(
      `${filename} 里的 ${misplaced.join('、')} 属于${
        spec.name === 'app' ? ' project.config.json' : ' app.json'
      } 的字段，建议写到 ${target} 指向的文件里（现在仍按原样输出）`,
    );
  }

  return {
    spec,
    filename,
    config: merged,
    verbatimText: mutated ? undefined : staticText,
    sources,
    level,
    errors,
    warnings,
    consumedAssets,
  };
}

/**
 * 解析全部配置文件。在 vite 配置组装前跑一次，之后所有消费方读同一份结果。
 *
 * app 先算：project 的派生字段（调试启动项）要用 app 的 pages。
 */
export function resolveMpConfigs(
  input: MpConfigResolveInput,
): Record<'app' | 'project', ResolvedMpConfig> {
  const app = resolveOne(MP_CONFIG_SPECS.app, input, {});
  const project = resolveOne(MP_CONFIG_SPECS.project, input, app.config);
  return { app, project };
}

/**
 * `sitemapLocation` / `themeLocation` 指的文件必须真的在产物里，
 * 否则开发者工具会报「找不到文件」，而用户看的是 app.json，想不到是 assets 漏配。
 */
export function checkReferencedFiles(
  config: MpConfigObject,
  emittedPaths: Iterable<string>,
): string[] {
  const emitted = new Set(emittedPaths);
  const errors: string[] = [];
  for (const key of ['sitemapLocation', 'themeLocation']) {
    const value = config[key];
    if (typeof value !== 'string' || !value) {
      continue;
    }
    if (!emitted.has(path.posix.normalize(value))) {
      errors.push(
        `app 配置的 ${key} 指向 ${value}，但产物里没有这个文件（检查 assets 是否把它拷进来）`,
      );
    }
  }
  return errors;
}

/** 全部配置文件的解析结果 */
export interface MpConfigBundle {
  app: ResolvedMpConfig;
  project: ResolvedMpConfig;
  /** 展开后的 assets（静态配置文件也从这里来） */
  assets: CopiedAsset[];
  errors: string[];
  warnings: string[];
  /** 参与解析的源文件，watch 要盯这几个 */
  sources: string[];
  /** 被合并流程接管的 asset 源路径，原样拷贝时要跳过 */
  consumedAssets: Set<string>;
}

export interface MpConfigPrepareInput {
  workspaceRoot: string;
  platform: BuildPlatform;
  platformType: PlatformType;
  assetPatterns?: AssetPattern[];
  absoluteProjectRoot: Path;
  absoluteProjectSourceRoot: Path;
  appJson?: string;
  projectConfig?: string;
  appJsonValidate?: MpConfigValidateLevel;
  deriveCondition?: boolean;
  /** 由 `subpackages` pattern 扫出来的入口归出的分包声明 */
  derivedSubPackages?: MpSubPackage[];
  builtPagePaths: string[];
  builtTabbarPaths: string[];
}

/**
 * 展开 assets 并解析全部配置文件。在 vite 配置组装前跑一次，
 * 之后分包插件、assets 插件、以后的多语言插件读同一份结果。
 */
export async function prepareMpConfigs(
  input: MpConfigPrepareInput,
): Promise<MpConfigBundle> {
  const assets = await collectAssets(input.assetPatterns, {
    workspaceRoot: input.workspaceRoot,
    absoluteProjectRoot: input.absoluteProjectRoot,
    absoluteProjectSourceRoot: input.absoluteProjectSourceRoot,
  });
  const configs = resolveMpConfigs({
    workspaceRoot: input.workspaceRoot,
    platform: input.platform,
    platformType: input.platformType,
    assets,
    appJson: input.appJson,
    projectConfig: input.projectConfig,
    appJsonValidate: input.appJsonValidate,
    deriveCondition: input.deriveCondition,
    derivedSubPackages: input.derivedSubPackages,
    builtPagePaths: input.builtPagePaths,
    builtTabbarPaths: input.builtTabbarPaths,
  });
  return {
    ...configs,
    assets,
    errors: [...configs.app.errors, ...configs.project.errors],
    warnings: [...configs.app.warnings, ...configs.project.warnings],
    sources: [...configs.app.sources, ...configs.project.sources],
    consumedAssets: new Set([
      ...configs.app.consumedAssets,
      ...configs.project.consumedAssets,
    ]),
  };
}

/**
 * 把解析结果说出去：警告走日志，错误直接抛。
 *
 * 抛在 vite 构建开始前，而不是埋在插件的 generateBundle 里：配置错了跟
 * 「哪个组件编不出来」没关系，早退才能把上下文留全。
 */
export function reportMpConfigDiagnostics(
  bundle: MpConfigBundle,
  logger: { warn: (message: string) => void },
): void {
  for (const warning of bundle.warnings) {
    logger.warn(warning);
  }
  if (bundle.errors.length) {
    throw new Error(bundle.errors.join('\n'));
  }
}
