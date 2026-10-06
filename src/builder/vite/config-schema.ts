/**
 * 小程序配置文件的形状定义。一份定义两个用途：
 *   1. 构建期形状校验（字段类型、必填、字面量），能给出 `tabBar.list[0].pagePath` 这种路径；
 *   2. 生成 JSON Schema 给编辑器做补全 / 悬浮文档（`script/gen-config-schema.ts`）。
 *
 * 全部用 `looseObject`：各家小程序的字段一直在加（`darkmode` / `resizable` / `renderer`…），
 * 一旦禁了未知字段，用户升级构建器就会突然一堆红波浪线，产物里还丢字段。
 *
 * 校验只管形状，语义判断在 `app-config.ts`，顺序是先形状后语义。
 * 字段说明统一写 `v.pipe(schema, v.description(...))`，转换器才会把它变成 JSON Schema 的 description。
 */

import * as v from 'valibot';
import { PlatformType } from '../platform/platform';

/** 页面条目：字符串，或带 path 的对象（各家小程序均支持） */
const pageSchema = v.union([v.string(), v.looseObject({ path: v.string() })]);

/** 分包：`root` 同时是源码目录与产物目录，必须是非空字符串 */
export const mpSubPackageSchema = v.looseObject({
  root: v.pipe(
    v.string(),
    v.description('分包根目录，相对产物根；不得以 / 开头、不得包含 ..'),
  ),
  pages: v.optional(
    v.pipe(v.array(pageSchema), v.description('分包内页面路径，相对 root')),
  ),
  independent: v.optional(
    v.pipe(v.boolean(), v.description('独立分包：不依赖主包即可运行')),
  ),
});

/**
 * 按平台分段：`{ wx: { ... }, zfb: { ... } }`。
 * key 必须是平台名，拼错会静默失效，所以平台名单独校验（`checkPlatformSection`）。
 */
const platformSectionSchema = v.record(v.string(), v.looseObject({}));

/** app.json 的已知字段；其余由 looseObject 原样放行 */
export const mpAppConfigSchema = v.looseObject({
  pages: v.optional(
    v.pipe(
      v.array(pageSchema),
      v.description('主包页面路径（不含扩展名）；pages[0] 是默认启动页'),
    ),
  ),
  entryPagePath: v.optional(
    v.pipe(
      v.string(),
      v.description('启动页；不填用 pages[0]，可以是主包页也可以是分包页'),
    ),
  ),
  window: v.optional(v.pipe(v.looseObject({}), v.description('全局窗口表现'))),
  tabBar: v.optional(
    v.pipe(
      v.looseObject({
        custom: v.optional(
          v.pipe(v.boolean(), v.description('自定义 tabBar（微信系）')),
        ),
        customize: v.optional(
          v.pipe(v.boolean(), v.description('自定义 tabBar（支付宝）')),
        ),
        list: v.optional(
          v.pipe(
            v.array(v.looseObject({ pagePath: v.string() })),
            v.description('tab 列表，pagePath 必须是主包页面'),
          ),
        ),
      }),
      v.description('底部 tab 配置'),
    ),
  ),
  subpackages: v.optional(
    v.pipe(v.array(mpSubPackageSchema), v.description('分包列表（微信写法）')),
  ),
  subPackages: v.optional(
    v.pipe(
      v.array(mpSubPackageSchema),
      v.description('分包列表（支付宝 / 百度写法）'),
    ),
  ),
  preloadRule: v.optional(
    v.pipe(
      v.record(
        v.string(),
        v.looseObject({
          network: v.optional(v.string()),
          packages: v.optional(
            v.union([v.array(v.string()), v.looseObject({})]),
          ),
        }),
      ),
      v.description('分包预下载规则，key 是页面路径，packages 是分包 root'),
    ),
  ),
  lazyCodeLoading: v.optional(
    v.pipe(
      v.string(),
      v.description('按需注入：requiredComponents / requiredPages'),
    ),
  ),
  _platform: v.optional(
    v.pipe(
      platformSectionSchema,
      v.description('按平台分段补字段，key 用平台名（wx / zfb / …）'),
    ),
  ),
});

/** project.config.json 的已知字段（各家文件名与字段差异由平台声明） */
export const mpProjectConfigSchema = v.looseObject({
  appid: v.optional(
    v.pipe(
      v.string(),
      v.description('小程序 appid；没填时构建器补 touristappid'),
    ),
  ),
  projectname: v.optional(v.pipe(v.string(), v.description('项目名'))),
  compileType: v.optional(
    v.pipe(v.string(), v.description('miniprogram / plugin')),
  ),
  libVersion: v.optional(v.pipe(v.string(), v.description('调试基础库版本'))),
  miniprogramRoot: v.optional(
    v.pipe(v.string(), v.description('小程序代码根目录')),
  ),
  cloudfunctionRoot: v.optional(
    v.pipe(v.string(), v.description('云函数根目录')),
  ),
  pluginRoot: v.optional(v.pipe(v.string(), v.description('插件根目录'))),
  setting: v.optional(
    v.pipe(v.looseObject({}), v.description('开发者工具设置')),
  ),
  packOptions: v.optional(v.pipe(v.looseObject({}), v.description('打包选项'))),
  scripts: v.optional(
    v.pipe(v.looseObject({}), v.description('自定义编译命令')),
  ),
  watchOptions: v.optional(
    v.pipe(v.looseObject({}), v.description('监听选项')),
  ),
  condition: v.optional(
    v.pipe(
      v.looseObject({}),
      v.description('调试启动项；支付宝会改写成 compileModeJson'),
    ),
  ),
  _platform: v.optional(
    v.pipe(
      platformSectionSchema,
      v.description('按平台分段补字段，key 用平台名（wx / zfb / …）'),
    ),
  ),
});

/** 任意一份配置（以及其中任意一层子对象）的基型 */
const mpLooseObjectSchema = v.looseObject({});

export type MpConfigObject = v.InferInput<typeof mpLooseObjectSchema>;
export type MpAppConfig = v.InferInput<typeof mpAppConfigSchema>;
export type MpProjectConfig = v.InferInput<typeof mpProjectConfigSchema>;
export type MpSubPackage = v.InferOutput<typeof mpSubPackageSchema>;
export type MpSubPackagePage = v.InferOutput<typeof pageSchema>;
export type MpPreloadRuleEntry = NonNullable<
  NonNullable<MpAppConfig['preloadRule']>[string]
>;

/** 平台名的合法取值（`library` 是构建器内部伪平台，用户配不到） */
const PLATFORM_NAMES: string[] = Object.values(PlatformType).filter(
  (value) => value !== PlatformType.library,
);

/** 校验器报的路径转成 `tabBar.list[0].pagePath` 这种可读形式 */
function formatIssuePath(path: readonly unknown[] | undefined): string {
  let result = '';
  for (const raw of path ?? []) {
    const part = raw as { type: string; key?: unknown; index?: number };
    const key = part.key ?? part.index;
    if (typeof key === 'number') {
      result += `[${key}]`;
    } else {
      result += `${result ? '.' : ''}${typeof key === 'string' ? key : '?'}`;
    }
  }
  return result;
}

function shapeErrors(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  config: unknown,
  label: string,
): string[] {
  const result = v.safeParse(schema, config);
  if (result.success) {
    return [];
  }
  return result.issues.map((issue) => {
    const where = formatIssuePath(issue.path) || '(根)';
    const expected = issue.expected ? `，期望 ${issue.expected}` : '';
    return `${label} ${where}: ${issue.message}${expected}`;
  });
}

/** app.json 形状校验（对合并后的最终对象跑） */
export function validateAppConfigShape(config: unknown): string[] {
  return shapeErrors(mpAppConfigSchema, config, 'app 配置');
}

/** project.config.json 形状校验 */
export function validateProjectConfigShape(config: unknown): string[] {
  return shapeErrors(mpProjectConfigSchema, config, 'project 配置');
}

/**
 * `_platform` 里出现不是平台名的 key → 报错。平台名拼错只会让那一段静默失效，
 * 「我明明配了却没生效」是最难查的一类问题，必须在这里拦住。
 */
export function checkPlatformSection(
  config: MpConfigObject,
  label: string,
): string[] {
  const section = config['_platform'];
  if (section === undefined) {
    return [];
  }
  if (
    typeof section !== 'object' ||
    section === null ||
    Array.isArray(section)
  ) {
    return [`${label} 的 _platform 必须是对象（{ 平台名: { 字段: 值 } }）`];
  }
  const unknown = Object.keys(section).filter(
    (key) => !PLATFORM_NAMES.includes(key),
  );
  if (!unknown.length) {
    return [];
  }
  return [
    `${label} 的 _platform 里有未知平台名: ${unknown.join(', ')}（可用平台：${PLATFORM_NAMES.join(
      ', ',
    )}）`,
  ];
}

/** 取出当前平台那一段（没有就是空对象） */
export function pickPlatformSection(
  config: MpConfigObject,
  platform: string,
): MpConfigObject {
  const section = config['_platform'];
  if (typeof section !== 'object' || section === null) {
    return {};
  }
  const value = (section as MpConfigObject)[platform];
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as MpConfigObject)
    : {};
}
