import type { BuilderContext } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import {
  type Path,
  getSystemPath,
  normalize,
  resolve,
} from '@angular-devkit/core';
import * as glob from 'glob';
import * as path from 'path';
import ts from 'typescript';
import type { BuildPlatform } from '../platform/platform';
import {
  type MpEntryType,
  findComponentClassNamesFromFile,
  isCustomTabbarOutput,
  resolveEntryComponentBindingFromFile,
} from '../shared/entry-component';
import type { MpSubPackagePattern, PagePattern } from '../shared/type';
import {
  isPathIn,
  pathKey,
  relativePosix,
  toNativePath,
  toPosixPath,
} from '../util/path';
import { normalizeAssetPatternsSafe } from './asset-patterns';
import { mpEntryVirtualId } from './plugins/entry-bootstrap.plugin';

function globAsync(pattern: string, options: glob.IOptions) {
  return new Promise<string[]>((resolvePromise, reject) =>
    glob.default(pattern, options, (e, m) =>
      e ? reject(e) : resolvePromise(m),
    ),
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
        normalize((projectMetadata.root as string) || ''),
      ),
    ),
  );
  const relativeSourceRoot = projectMetadata.sourceRoot as string | undefined;
  if (typeof relativeSourceRoot !== 'string') {
    throw new Error('项目缺少 sourceRoot');
  }
  const absoluteProjectSourceRoot = normalize(
    getSystemPath(
      resolve(normalize(options.workspaceRoot), normalize(relativeSourceRoot)),
    ),
  );
  return { absoluteProjectRoot, absoluteProjectSourceRoot };
}

/**
 * 入口源文件名 → 产物文件名（还带着占位的 `.ts`，由调用方换成平台后缀）。
 *
 * 常规入口：`foo.entry.ts` → `foo-entry.ts`（和 webpack 时代保持一致）。
 * 自定义 tabBar：平台把产物文件名写死成 `index`（微信 `custom-tab-bar/index`、
 * 支付宝 `customize-tab-bar/index`），所以下面的 `.entry` 后缀在这里让位：
 * `index.entry.ts` → `index.ts`。
 */
function toOutputFileName(fileName: string, type: MpEntryType): string {
  const base =
    type === 'tabbar' ? fileName.replace(/\.entry(?=\.ts$)/, '') : fileName;
  return base.replace(/\.ts$/, '').replace(/\./g, '-') + '.ts';
}

/**
 * 把一个来源（pages / customTabbar / 组件兜底）的 AssetPattern 展开成 PagePattern 列表。
 *
 * 每个 PagePattern 带 entryName 和 outputFiles（logic / style / content / config），
 * Vite 侧直接用它拼 rollupOptions.input 和产物路径。
 *
 * 入口类型以配置来源为准，但产物落在平台的 tabBar 目录里的一律改判 tabbar：
 * 那个路径是平台写死的（`BuildPlatform.customTabbar.dir`），产物位置就是身份。
 */
export async function generateModuleInfo(
  list: AssetPattern[],
  type: MpEntryType,
  options: {
    workspaceRoot: string;
    absoluteProjectRoot: Path;
    absoluteProjectSourceRoot: Path;
  },
  buildPlatform: BuildPlatform,
  /**
   * 覆盖 pattern 里的 output。
   *
   * tabBar 的产物目录是平台写死的，让用户说了算只会把入口产到平台不读的位置，
   * 所以这个字段只用来指定「源文件在哪」，产物目录在这里强制。
   */
  forceOutput?: string,
): Promise<PagePattern[]> {
  if (!list?.length) {
    return [];
  }
  const patternList = normalizeAssetPatternsSafe(
    list,
    options.workspaceRoot,
    options.absoluteProjectRoot,
    options.absoluteProjectSourceRoot,
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
          buildPlatform.fileExtname.config!,
        );
        // 产物落在平台约定的 tabBar 目录里就一律按 tabBar 处理：这个路径是
        // 平台写死的，产物位置就是身份，不需要用户再声明一次入口类型
        const output = forceOutput ?? pattern.output;
        const entryType: MpEntryType = isCustomTabbarOutput(
          output,
          buildPlatform.customTabbar?.dir,
        )
          ? 'tabbar'
          : type;
        const outputFileName = toOutputFileName(object.fileName!, entryType);
        object.outputFiles!.path = path
          .join(output, outputFileName)
          .replace(/\.ts$/, '');
        object.outputFiles!.logic =
          object.outputFiles!.path + buildPlatform.fileExtname.logic;
        object.outputFiles!.style =
          object.outputFiles!.path + buildPlatform.fileExtname.style;
        object.outputFiles!.content =
          object.outputFiles!.path + buildPlatform.fileExtname.content;
        object.outputFiles!.config =
          object.outputFiles!.path + buildPlatform.fileExtname.config;
        object.type = entryType;
        return object as PagePattern;
      }),
    );
  }
  return moduleList;
}

export interface EntryPatternResult {
  pageList: PagePattern[];
  /** 分包页面入口（身份仍是页面，只是产物落在分包目录） */
  subPackageList: PagePattern[];
  componentList: PagePattern[];
  tabbarList: PagePattern[];
}

/** sourceRoot 相对 workspaceRoot 的 posix 路径 */
function relativeSourceRoot(
  workspaceRoot: string,
  absoluteProjectSourceRoot: Path,
): string {
  return relativePosix(workspaceRoot, getSystemPath(absoluteProjectSourceRoot));
}

/**
 * `customTabbar` 不配时的默认 pattern：源文件取 `<sourceRoot>/custom-tab-bar`。
 *
 * 源目录名故意不用平台的产物目录名：用户书写习惯统一在 `src/custom-tab-bar/`，
 * 产物落哪个目录（微信系 `custom-tab-bar`、支付宝 `customize-tab-bar`）
 * 是构建器按平台决定的，不该让用户改目录名去适配平台。
 */
export function defaultCustomTabbarPatterns(
  workspaceRoot: string,
  absoluteProjectSourceRoot: Path,
  outputDir: string,
): AssetPattern[] {
  return [
    {
      glob: '**/*.entry.ts',
      input: `${relativeSourceRoot(workspaceRoot, absoluteProjectSourceRoot)}/custom-tab-bar`,
      output: outputDir,
    },
  ];
}

/**
 * 组件入口的 glob：sourceRoot 下所有 `*.entry.ts`，产物路径按 sourceRoot 镜像。
 *
 * 小程序里只有两种身份：页面（在 app 配置的 pages 里）和组件，所以被
 * pages / customTabbar 认领掉的文件除外，剩下的入口全部按组件处理，
 * 不需要再声明一个 `components` 范围——uni-app 就是这么做的（pages.json
 * 是页面名单，组件产物路径 = 源文件相对 inputDir 的路径）。
 */
export function componentEntryPatterns(
  workspaceRoot: string,
  absoluteProjectSourceRoot: Path,
): AssetPattern[] {
  return [
    {
      glob: '**/*.entry.ts',
      input: relativeSourceRoot(workspaceRoot, absoluteProjectSourceRoot),
      output: '.',
    },
  ];
}

/**
 * tsconfig 真正编译的文件集。
 *
 * 组件入口没有配置范围，就靠这个集合判定「哪些文件算数」：入口必须在这个
 * 集合里（分析层要拿它做组件元数据），不在就说明这个文件不属于本次构建——
 * 同目录下其他工程的 `*.entry.ts`（测试工程的 spec 入口等）就是这样挡掉的。
 * 走 `getParsedCommandLineOfConfigFile` 而不是自己拼 glob，extends 才能被解析。
 */
export function tsConfigFileNames(tsconfigPath: string): Set<string> {
  const host: ts.ParseConfigFileHost = {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile,
    fileExists: ts.sys.fileExists,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    onUnRecoverableConfigFileDiagnostic: () => undefined,
  };
  const parsed = ts.getParsedCommandLineOfConfigFile(
    path.resolve(tsconfigPath),
    {},
    host,
  );
  return new Set((parsed?.fileNames ?? []).map((f) => pathKey(f)));
}

/**
 * 自动组件：没有 `*.entry.ts` 的普通 `@Component`。
 *
 * 入口要 `export default` 的理由是「路径是对外契约」：页面路径写进 app.json、
 * 写进 navigateTo 的 url，必须固定解析。组件没有这个约束：它只被父级 json 里
 * 的 `usingComponents` 引用，而那个路径是构建器自己写进去的，自洽就行。
 * 所以普通组件不需要入口文件，产物路径直接按「源目录 = 产物目录」从源文件镜像。
 *
 * 已经被入口认领的组件类不在这里（页面自己的组件、写了入口的组件），认领
 * 关系见 `resolveEntryComponentBinding`。
 *
 * 只能做语法级发现：产物路径要进 rollup input，而那时还没有 Angular program，
 * 等 program 建好了再发现就晚了。
 */
function discoverAutoComponents(options: {
  /** tsconfig 真正编译的文件集（pathKey 形态） */
  program: Set<string>;
  /** 项目 sourceRoot（原生绝对路径） */
  sourceRoot: string;
  workspaceRoot: string;
  /** 已经声明出来的入口，用来剔掉它们认领的组件 */
  declared: PagePattern[];
  buildPlatform: BuildPlatform;
}): PagePattern[] {
  const { buildPlatform } = options;

  /** `文件#类名`，类名为 `*` 表示整个文件被认领 */
  const claimed = new Set<string>();
  for (const entry of options.declared) {
    const binding = resolveEntryComponentBindingFromFile(entry.src);
    if (binding) {
      claimed.add(`${pathKey(binding.file)}#${binding.className ?? '*'}`);
    }
  }
  const isClaimed = (file: string, className: string) =>
    claimed.has(`${pathKey(file)}#*`) ||
    claimed.has(`${pathKey(file)}#${className}`);

  const groups = new Map<string, string[]>();
  for (const key of options.program) {
    const file = toNativePath(key);
    if (
      !file.endsWith('.ts') ||
      // 入口文件自己走声明式那条路，spec 不进产物
      file.endsWith('.entry.ts') ||
      file.endsWith('.spec.ts') ||
      !isPathIn(options.sourceRoot, file)
    ) {
      continue;
    }
    const names = findComponentClassNamesFromFile(file).filter(
      (name) => !isClaimed(file, name),
    );
    if (names.length) {
      groups.set(file, names);
    }
  }

  const list: PagePattern[] = [];
  for (const [file, names] of groups) {
    const base = relativePosix(options.sourceRoot, file).replace(/\.ts$/, '');
    for (const className of names) {
      // 一个文件贡献多个组件时才把类名拼进产物名，单组件与源文件同名
      const output = names.length > 1 ? `${base}-${className}` : base;
      list.push({
        glob: '**/*.ts',
        input: relativePosix(options.workspaceRoot, options.sourceRoot),
        output: '.',
        entryName: path.basename(output),
        fileName: relativePosix(options.sourceRoot, file),
        src: file,
        outputFiles: {
          path: output,
          logic: output + buildPlatform.fileExtname.logic,
          style: output + buildPlatform.fileExtname.style,
          content: output + buildPlatform.fileExtname.content,
          config: output + buildPlatform.fileExtname.config,
        },
        inputFiles: {
          config: file.replace(/\.ts$/, buildPlatform.fileExtname.config!),
        },
        type: 'component',
        componentClassName: className,
      });
    }
  }
  return list;
}

export async function generateEntryPatterns(options: {
  pages: AssetPattern[];
  /** 分包入口：pattern 的 output 就是分包 root */
  subpackages?: MpSubPackagePattern[];
  customTabbar?: AssetPattern[];
  workspaceRoot: string;
  context: BuilderContext;
  buildPlatform: BuildPlatform;
  /** 组件入口的范围：只保留在这个 tsconfig 的编译单元里的入口 */
  tsConfig: string;
}): Promise<EntryPatternResult> {
  const { absoluteProjectRoot, absoluteProjectSourceRoot } =
    await resolveProjectRoots(options);
  const roots = {
    workspaceRoot: options.workspaceRoot,
    absoluteProjectRoot,
    absoluteProjectSourceRoot,
  };
  const pageList = await generateModuleInfo(
    options.pages || [],
    'page',
    roots,
    options.buildPlatform,
  );
  // 分包入口身份就是页面，只是产物落在分包目录；root 由 pattern 的 output 决定
  const subPackageList = await generateModuleInfo(
    options.subpackages || [],
    'page',
    roots,
    options.buildPlatform,
  );
  if (
    subPackageList.length &&
    options.buildPlatform.mpConfig?.capabilities?.subpackages === false
  ) {
    throw new Error(
      `${options.buildPlatform.packageName} 平台不支持分包，` +
        `但 subpackages 配了 ${subPackageList.length} 个入口：` +
        '请删掉 subpackages 配置，或把这些入口改回 pages',
    );
  }
  const tabbarDir = options.buildPlatform.customTabbar?.dir;
  const tabbarList = await generateModuleInfo(
    options.customTabbar?.length
      ? options.customTabbar
      : defaultCustomTabbarPatterns(
          options.workspaceRoot,
          absoluteProjectSourceRoot,
          // 源目录名固定 custom-tab-bar（用户书写习惯），产物目录才跟平台走
          tabbarDir ?? 'custom-tab-bar',
        ),
    'tabbar',
    roots,
    options.buildPlatform,
    tabbarDir,
  );
  // 不支持自定义 tabBar 的平台，配了（或碰巧把入口放进了默认目录）就是配错了：
  // 产出一个没人加载的目录比直接报错难查得多
  if (tabbarList.length && !tabbarDir) {
    throw new Error(
      `${options.buildPlatform.packageName} 平台没有自定义 tabBar，` +
        `但本次构建扫到 ${tabbarList.length} 个 tabBar 入口：\n  - ` +
        tabbarList.map((item) => item.src).join('\n  - ') +
        '\n请删掉 customTabbar 配置，或把入口改成普通组件入口',
    );
  }
  // 组件 glob 是「整个 sourceRoot」，pages / 分包页 / tabBar 已经认领的入口必须剔掉，
  // 否则同一个文件会被两个 pattern 各产一份产物
  const claimed = new Set(
    [...pageList, ...subPackageList, ...tabbarList].map((item) =>
      pathKey(item.src),
    ),
  );
  const program = tsConfigFileNames(
    path.resolve(options.workspaceRoot, options.tsConfig),
  );
  const componentList = (
    await generateModuleInfo(
      componentEntryPatterns(options.workspaceRoot, absoluteProjectSourceRoot),
      'component',
      roots,
      options.buildPlatform,
    )
  ).filter(
    (item) =>
      !claimed.has(pathKey(item.src)) &&
      // tsconfig 一个文件都没编（空工程、或路径写错）时不过滤，
      // 免得把「tsconfig 配错了」伪装成「没有组件」
      (!program.size || program.has(pathKey(item.src))),
  );

  const autoComponentList = discoverAutoComponents({
    program,
    sourceRoot: getSystemPath(absoluteProjectSourceRoot),
    workspaceRoot: options.workspaceRoot,
    declared: [...pageList, ...subPackageList, ...tabbarList, ...componentList],
    buildPlatform: options.buildPlatform,
  });

  return {
    pageList,
    subPackageList,
    // 自动组件和声明式组件入口在下游完全同构（都是 type: component 的
    // PagePattern），并进同一个列表才能让 rollup input / watch 目录 /
    // 分析层不用各自认两套
    componentList: [...componentList, ...autoComponentList],
    tabbarList,
  };
}

/**
 * 把 PagePattern 列表转成 Vite/Rollup 的多入口 input。
 *
 * key 用 outputFiles.path（含目录），Rollup 的 `[name]` 会把整个 key 展开进去，
 * 所以 entryFileNames: '[name].js' 就能产出 `pages/index/index-entry.js`
 * 这种带目录的路径，和 webpack 时代的 outputFiles.logic 对齐。
 *
 * value 是虚拟入口模块（见 `entry-bootstrap.plugin`）：用户入口只需
 * `export default Component`，`bootstrapPage` / `componentRegistry` /
 * `bootstrapCustomTabbar` 全部由构建器在这一层注入。
 */
export function toRollupInput(
  patternList: PagePattern[],
): Record<string, string> {
  const input: Record<string, string> = {};
  for (const item of patternList) {
    // key 必须正斜杠：Windows 下 outputFiles.path 是 path.join 出来的
    // 反斜杠形式，会一路带进 chunk fileName 和 app.js 的 require 字面量
    input[toPosixPath(item.outputFiles.path)] = mpEntryVirtualId(
      item.src,
      item.componentClassName,
    );
  }
  return input;
}
