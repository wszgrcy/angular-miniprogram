/**
 * app.json 的语义校验与产物生成。
 *
 * 之前 app.json 是静态 asset 直接拷进产物，构建器对内容零感知：页面不存在、
 * tabBar 指向野路径、分包 root 冲突，全部要等到开发者工具打开才炸。这一层把
 * app 配置升级为「编译期校验」，形状校验在 `config-schema.ts`，合并规则在
 * `merge-config.ts`。
 *
 * 校验对象是**合并后的最终对象**：用户手写的、结构化配置补的、构建器算出来的，
 * 到这一步已经是一份内容，没必要按来源分别校验。
 */

import type {
  MpAppConfig,
  MpPreloadRuleEntry,
  MpSubPackage,
  MpSubPackagePage,
} from './config-schema';

export type {
  MpAppConfig,
  MpSubPackage,
  MpSubPackagePage,
} from './config-schema';

/** 取分包列表：兼容 subpackages / subPackages 两种写法 */
export function getSubPackages(config: MpAppConfig): MpSubPackage[] {
  return (config.subpackages ?? config.subPackages ?? []) as MpSubPackage[];
}

/** 页面条目归一化为路径字符串 */
function pagePathOf(page: MpSubPackagePage): string {
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
function preloadPackagesOf(packages: MpPreloadRuleEntry['packages']): string[] {
  if (Array.isArray(packages)) {
    return packages;
  }
  if (packages && typeof packages === 'object') {
    return Object.keys(packages);
  }
  return [];
}

/**
 * 编译期语义校验。返回错误列表（空数组 = 通过）。
 *
 * 只查「形状对但内容不对」的东西：页面本次真的产出了吗、tabBar 的页面在主包吗、
 * preloadRule 引用的分包存在吗。类型错误在这之前就该被形状校验拦掉。
 *
 * @param config 合并后的 app 配置
 * @param builtPagePaths 本次构建实际产出的页面路径（不含扩展名，分包页为
 *   已拼上 root 的全路径），来自 PagePattern.outputFiles.path
 */
export function validateAppConfig(
  config: MpAppConfig,
  builtPagePaths: string[],
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
          sub.root,
        )}`,
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
          `分包页面与主包 pages 冲突: ${full}（主包已声明同路径页面）`,
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
        `tabBar.pagePath "${pagePath}" 不在主包 pages 中（tabBar 页面必须在主包）`,
      );
    }
  }

  // 已知页面全集：主包 pages + 分包页面全路径
  const allPages = new Set([...seen, ...fullSubPages]);

  // 启动页必须是已声明的页面，否则冷启动直接白屏
  if (config.entryPagePath !== undefined) {
    if (!config.entryPagePath) {
      errors.push('entryPagePath 不能为空字符串（不想要就删掉这个字段）');
    } else if (!allPages.has(config.entryPagePath)) {
      errors.push(
        `entryPagePath "${config.entryPagePath}" 不是已声明的页面` +
          `（主包 pages 与分包页面里都没有）`,
      );
    }
  }

  // 声明了但本次构建没产出入口：漏写 *.entry.ts，或源文件所在目录不在
  // angular.json 的 pages pattern 覆盖范围内。这类错落到开发者工具里只剩
  // 一句「页面不存在」，最难查，所以在构建期按页面逐条点名。
  if (builtPagePaths.length) {
    const built = new Set(builtPagePaths);
    for (const page of [...mainPages, ...fullSubPages]) {
      if (page && !built.has(page)) {
        errors.push(
          `页面 "${page}" 声明了但本次构建没有产出入口` +
            `（检查是否有对应的 *.entry.ts，以及它所在目录是否被 ` +
            `angular.json 的 pages pattern 覆盖）`,
        );
      }
    }
  }

  // preloadRule：key 必须是已知页面，packages 必须是已声明的分包 root
  for (const [page, rule] of Object.entries(config.preloadRule ?? {})) {
    if (!allPages.has(page)) {
      errors.push(`preloadRule 的页面 "${page}" 不存在（pages/分包均无）`);
    }
    for (const pkg of preloadPackagesOf(rule.packages)) {
      if (!subRoots.has(pkg)) {
        errors.push(
          `preloadRule["${page}"].packages 引用了未声明的分包 "${pkg}"`,
        );
      }
    }
  }

  return errors;
}

/**
 * 生成 app.json 文本。
 *
 * 输出保留用户写法（分包 key 已由平台归一），只做格式化，不做平台方言转换。
 */
export function generateAppJson(config: MpAppConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

/** 归一化后的分包描述 */
export interface ResolvedSubPackage {
  /** 分包根目录（产物相对路径，如 `packageA`） */
  root: string;
  /** 是否独立分包 */
  independent: boolean;
  /** 分包内页面路径（相对产物根，已拼上 root，不含扩展名） */
  fullPages: string[];
}

/**
 * 从 app 配置解析出分包列表（归一化 subpackages/subPackages + 拼全路径）。
 *
 * 供分包产物改写插件消费：判断某个产物路径属于哪个分包、是否独立分包。
 */
export function resolveSubPackages(config: MpAppConfig): ResolvedSubPackage[] {
  return getSubPackages(config).map((sub) => {
    const root = String(sub.root ?? '').replace(/\/+$/, '');
    const fullPages = (sub.pages ?? []).map((page) => {
      const p = typeof page === 'string' ? page : page.path;
      return `${root}/${p}`;
    });
    return {
      root,
      independent: !!sub.independent,
      fullPages,
    };
  });
}

/**
 * 判断一个产物路径（不含扩展名，posix）属于哪个分包。
 * 返回 undefined 表示属于主包。
 */
export function findSubPackageByPath(
  subPackages: ResolvedSubPackage[],
  posixPath: string,
): ResolvedSubPackage | undefined {
  return subPackages.find(
    (sp) => posixPath === sp.root || posixPath.startsWith(`${sp.root}/`),
  );
}
