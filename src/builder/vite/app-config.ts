/**
 * app.json 编译生成层。
 *
 * 之前 app.json 是静态 asset 直接拷进产物（copy-assets），构建器对内容
 * 零感知：页面不存在、tabBar 指向野路径、分包 root 冲突，全部要等到
 * 开发者工具打开才炸。本模块把 app 配置升级为「结构化输入 + 编译期
 * 校验 + 生成产物」，对应 uni-app 的 uni-cli-shared/src/json/mp/pages.ts
 * 这一层，也是分包（#2）、tabBar i18n（#8）、preloadRule 透传的公共前置。
 *
 * 逃生舱：不配置 appJson 时维持旧行为（assets 里静态提供 app.json）。
 * 两者同时出现视为配置冲突，直接报错，避免「改了没效果」的玄学。
 */

/** 分包内的页面条目：字符串或带 path 的对象（各家小程序均支持） */
export type MpSubPackagePage = string | { path: string; [key: string]: unknown };

export interface MpSubPackage {
  /** 分包根目录，相对产物根。不得以 / 开头、不得包含 .. */
  root: string;
  pages: MpSubPackagePage[];
  /** 独立分包：不依赖主包即可运行 */
  independent?: boolean;
  [key: string]: unknown;
}

/**
 * 结构化 app 配置。
 *
 * 已知字段（pages/window/tabBar/subpackages/preloadRule/lazyCodeLoading）
 * 参与校验；其余字段（sitemapLocation、darkmode、plugins……）原样透传，
 * 保证对各家 app.json 方言的开放性。
 */
export interface MpAppConfig {
  pages?: Array<string | { path: string; [key: string]: unknown }>;
  window?: Record<string, unknown>;
  tabBar?: {
    list?: Array<{ pagePath?: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  /** 微信风格 key */
  subpackages?: MpSubPackage[];
  /** 支付宝/百度风格 key（输入等价，输出保留用户写法） */
  subPackages?: MpSubPackage[];
  preloadRule?: Record<
    string,
    {
      network?: string;
      packages?: string[] | Record<string, unknown>;
      [key: string]: unknown;
    }
  >;
  lazyCodeLoading?: string;
  [key: string]: unknown;
}

/** 取分包列表：兼容 subpackages / subPackages 两种写法 */
export function getSubPackages(config: MpAppConfig): MpSubPackage[] {
  return config.subpackages ?? config.subPackages ?? [];
}

/** 页面条目归一化为路径字符串 */
function pagePathOf(
  page: string | { path: string; [key: string]: unknown }
): string {
  return typeof page === 'string' ? page : page.path;
}

/** 分包 root 的合法性：相对路径、无 .. */
function isValidSubPackageRoot(root: unknown): root is string {
  return (
    typeof root === 'string' &&
    root.length > 0 &&
    !root.startsWith('/') &&
    !root.split('/').includes('..')
  );
}

/** preloadRule 的 packages 值归一化为 string[]（对象形态取 keys） */
function preloadPackagesOf(
  packages: string[] | Record<string, unknown> | undefined
): string[] {
  if (Array.isArray(packages)) {
    return packages;
  }
  if (packages && typeof packages === 'object') {
    return Object.keys(packages);
  }
  return [];
}

/**
 * 编译期校验。返回错误列表（空数组 = 通过）。
 *
 * @param config 结构化 app 配置
 * @param builtPagePaths 本次构建实际产出的主包页面路径（不含扩展名），
 *   来自 PagePattern.outputFiles.path
 */
export function validateAppConfig(
  config: MpAppConfig,
  builtPagePaths: string[]
): string[] {
  const errors: string[] = [];
  const mainPages = (config.pages ?? []).map(pagePathOf);
  const subPackages = getSubPackages(config);

  if (!mainPages.length && !subPackages.length) {
    errors.push('app 配置必须包含 pages 或 subpackages（至少一个页面）');
  }

  // 主包页面去重
  const seen = new Set<string>();
  for (const page of mainPages) {
    if (!page) {
      errors.push('pages 中存在空路径');
      continue;
    }
    if (seen.has(page)) {
      errors.push(`pages 存在重复页面: ${page}`);
    }
    seen.add(page);
  }

  // 分包 root 与页面路径校验
  const subRoots = new Set<string>();
  const fullSubPages = new Set<string>();
  subPackages.forEach((sub, index) => {
    if (!isValidSubPackageRoot(sub.root)) {
      errors.push(
        `subpackages[${index}].root 非法（必须为相对路径且不含 ..）: ${String(
          sub.root
        )}`
      );
      return;
    }
    if (subRoots.has(sub.root)) {
      errors.push(`subpackages 存在重复的 root: ${sub.root}`);
    }
    subRoots.add(sub.root);
    if (!sub.pages?.length) {
      errors.push(`subpackages[${index}]（root=${sub.root}）没有页面`);
    }
    (sub.pages ?? []).forEach((page) => {
      const p = pagePathOf(page);
      const full = `${sub.root}/${p}`;
      if (!p) {
        errors.push(`subpackages[${index}] 存在空页面路径`);
        return;
      }
      if (seen.has(full)) {
        errors.push(
          `分包页面与主包 pages 冲突: ${full}（主包已声明同路径页面）`
        );
      }
      if (fullSubPages.has(full)) {
        errors.push(`分包页面跨分包重复: ${full}`);
      }
      fullSubPages.add(full);
    });
  });

  // tabBar 的 pagePath 必须在主包页面里（小程序限制：tabBar 不能用分包页）
  const tabBarList = config.tabBar?.list ?? [];
  for (const item of tabBarList) {
    const pagePath = item.pagePath;
    if (!pagePath) {
      errors.push('tabBar.list 存在缺少 pagePath 的条目');
      continue;
    }
    if (!seen.has(pagePath)) {
      errors.push(
        `tabBar.pagePath "${pagePath}" 不在主包 pages 中（tabBar 页面必须在主包）`
      );
    }
  }

  // preloadRule：key 必须是已知页面，packages 必须是已声明的分包 root
  const allPages = new Set([...seen, ...fullSubPages]);
  for (const [page, rule] of Object.entries(config.preloadRule ?? {})) {
    if (!allPages.has(page)) {
      errors.push(`preloadRule 的页面 "${page}" 不存在（pages/分包均无）`);
    }
    for (const pkg of preloadPackagesOf(rule.packages)) {
      if (!subRoots.has(pkg)) {
        errors.push(
          `preloadRule["${page}"].packages 引用了未声明的分包 "${pkg}"`
        );
      }
    }
  }

  return errors;
}

/**
 * 生成 app.json 文本。
 *
 * 输出保留用户写法（subpackages/subPackages key 原样），只做格式化，
 * 不做平台方言转换——配置者明确知道目标平台，隐式改写反而难排查。
 */
export function generateAppJson(config: MpAppConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}
