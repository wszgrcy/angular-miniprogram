import { dirname, join, normalize, strings } from '@angular-devkit/core';
import type { Plugin } from 'vite';
import { detectComponentNames } from '../../component-template-inject/change-component';
import { LIBRARY_OUTPUT_ROOTDIR } from '../../library';
import { readLibraryMetaForModule } from '../../library/library-meta-reader';
import {
  LIBRARY_META_FILE_NAME,
  LIBRARY_META_SCHEMA_VERSION,
  LibraryMetaEntry,
  assertLibraryTemplatePayload,
} from '../../library/library-meta-schema';
import {
  LibraryTemplateValues,
  createLibraryTemplateRenderer,
} from '../../library/mp-template';
import { BuildPlatform } from '../../platform/platform';
import type {
  LibraryTemplateScopeService,
  ExtraTemplateData as ScopeExtraTemplateData,
} from '../../shared/library-template-scope.service';
import { libraryTemplateScopeName, stripModuleQuery } from '../../util';
import { toPosixPath } from '../../util/asset-path';

/**
 * 产物路径归一：正斜杠 + 剥前导 `/`。
 *
 * devkit 的 join/normalize 会带前导斜杠，rollup 的 emitFile 不接受；
 * 而 Windows 下若混进反斜杠，会污染 app.js 的 require 字面量
 * （`\c` 之类无效转义被吃掉）。统一走 toPosixPath。
 */
function toRollupFileName(p: string) {
  return toPosixPath(normalize(p) as string);
}

export interface LibraryTemplatePluginOptions {
  buildPlatform: BuildPlatform;
  templateScope: LibraryTemplateScopeService;
}

/**
 * 虚拟 entry 模块前缀。
 *
 * 对应 webpack 的 `dynamic://__license/<id>.ts`。`\0` 是 rollup 约定的
 * 「虚拟模块」标记，防止和其他插件/文件系统路径撞车。
 */
const LIBRARY_ENTRY_VIRTUAL = '\0mp-library-entry:';

/** transform 里可用的两个 emit，绑好了 rollup 上下文。 */
interface EmitFns {
  asset: (fileName: string, source: string) => void;
  chunk: (fileName: string, moduleId: string) => void;
}

/**
 * library 组件的 JS entry。
 *
 * webpack 侧是 DynamicLibraryComponentEntryPlugin 用 finishMake + addEntry
 * 做的；Vite/Rollup 的等价物是 emitFile({ type: 'chunk' })：
 * 给一个模块 id，rollup 会把它当成一个独立 entry 打出来。
 *
 * 产物必须是 `library/<libraryPath>.js`，内容就是把组件注册进小程序侧：
 *
 *   import * as amp from 'angular-miniprogram';
 *   import * as lib from '<库 moduleId>';
 *   amp.componentRegistry(lib.<ClassName>);
 *
 * 小程序自定义组件必须在其路径下有 .js 才能被运行时加载，
 * 少了这个产物组件就是空的。
 *
 * `importPath` 用 **bare specifier**（`test-library` / `angular-miniprogram/forms`）
 * 而不是绝对路径：交给 rollup 按 `package.json#exports` 解析，
 * npm link / pnpm 的 realpath 布局都不用特殊适配。
 */
function libraryEntryModuleSource(meta: {
  className: string;
  importPath: string;
}): string {
  return (
    `import * as amp from 'angular-miniprogram';\n` +
    `import * as lib from ${JSON.stringify(meta.importPath)};\n` +
    `amp.componentRegistry(lib.${meta.className});\n`
  );
}

/**
 * sidecar 里有组件却一个 `content` 都没有 —— 说明这个库不是用当前工具链
 * 构建的（v1 的载荷在 JS 里，不在 sidecar 里）。
 *
 * 校验本身已提到 `library-meta-schema.ts` 的 `assertLibraryTemplatePayload`，
 * 这样不用跑一次真实构建也能测到「旧库必须显式报错」这条。
 */
const assertTemplatePayload = assertLibraryTemplatePayload;

/**
 * 从 sidecar 读库元数据，产出库组件的 wxml / wxss / entry chunk。
 *
 * 数据来源是 `<库根>/mp-library-meta.json`，**不再从库的 JS 产物里
 * CSS-selector 反解 `let X_ExtraData` / `$self_Global_Template` /
 * `library_Global_Template`**。库构建现在只登记元数据、不改写自己的产物，
 * 「把平台中立的模板文本填成目标平台 wxml」这件事完全在这里发生
 * （`createLibraryTemplateRenderer` + 本平台的 `LibraryTemplateValues`）。
 *
 * 触发时机仍然是 transform：它是「这个包真的进了模块图」的探测器。
 * 命中条件 = 该文件所属包根带合法 sidecar，所以第三方库
 * （`@angular/common` 那种也含 `ɵɵdefineComponent` 的）不会被误处理。
 */
export function libraryTemplatePlugin(
  options: LibraryTemplatePluginOptions,
): Plugin {
  const { buildPlatform, templateScope } = options;
  const fileExtname = buildPlatform.fileExtname;
  /**
   * 已发现的 library 组件，按 meta.id 去重。
   * transform 会被多次调用（同文件多组件 / 重复访问），靠 Map 保证
   * 每个组件只 emit 一个 entry chunk。
   */
  const libraryEntries = new Map<
    string,
    { className: string; importPath: string; libraryPath: string }
  >();
  /** 已 emit 的 asset 文件名，防止同一路径重复 emit 把 rollup 惹毛。 */
  const emittedFiles = new Set<string>();
  const convertOptions: LibraryTemplateValues = {
    directivePrefix: buildPlatform.templateTransform.getData().directivePrefix,
    eventListConvert: buildPlatform.templateTransform.eventListConvert,
    fileExtname,
  };
  /**
   * 本平台的渲染器。es-toolkit 编译 + 缓存只建一次，
   * 所有组件模板复用。
   */
  const render = createLibraryTemplateRenderer(convertOptions);

  /** 全局模板：自引用模板 emit 成文件，共享模板注册进 scope。 */
  const emitGlobalTemplates = (
    entry: LibraryMetaEntry,
    emit: EmitFns,
  ): void => {
    const self = entry.selfTemplate;
    if (self?.template) {
      emit.asset(
        toRollupFileName((self.outputPath ?? '') + fileExtname.contentTemplate),
        render(self.template),
      );
    }
    for (const [scopeKey, record] of Object.entries(
      entry.scopeTemplates ?? {},
    )) {
      templateScope.setScopeExtraUseComponents(scopeKey, {
        useComponents: record.useComponents ?? {},
        // **在这里就渲染完**。scope 服务里还会混进 app 自己的 wxml（带真实
        // `{{hasLoad}}` 插值），那些不能再过一遍模板渲染，否则会被当变量吃掉。
        // 所以渲染必须卡在「从 sidecar 取出」这个边界，不能拖到 emit 时。
        templateList: [render(record.template)],
      });
    }
  };

  /**
   * 组件：wxml + wxss + entry chunk。
   *
   * `classNames` 是**本文件里真的检测到的**组件名，不是 `entry.components`
   * 全部。按名字 emit 才能立住「emit 集合 == 本文件组件集合」；之前传整个
   * entry 会把本文件根本没包含的组件也凭空产出一份 wxml。
   */
  const emitComponents = (
    entry: LibraryMetaEntry,
    classNames: string[],
    emit: EmitFns,
  ): void => {
    const rootDir = normalize(LIBRARY_OUTPUT_ROOTDIR);
    const globalTemplatePath = join(
      normalize('/library-template'),
      strings.classify(entry.moduleId) + fileExtname.contentTemplate,
    );
    const LIBRARY_SCOPE_ID = libraryTemplateScopeName(entry.moduleId);
    const scopeArr: ScopeExtraTemplateData[] = [];

    for (const className of classNames) {
      const record = entry.components?.[className];
      // 调用方已经按名字筛过，这里查不到就是上游漏了，不是业务分支
      if (!record) {
        continue;
      }
      // 没模板的组件（`template: ''` 之类）不产 wxml，
      // 但元数据仍在 sidecar 里，主构建的 useComponents 照样查得到
      if (!record.content) {
        continue;
      }
      const libraryPath = record.outputPath;
      const id =
        record.id ??
        strings.classify(entry.moduleId) +
          strings.classify(
            strings.camelize(strings.dasherize(strings.camelize(className))),
          );

      scopeArr.push({
        configPath: join(rootDir, libraryPath + fileExtname.config),
        useComponents: record.useComponents ?? {},
        templateList: [],
        templatePath: globalTemplatePath,
      });

      emit.asset(
        toRollupFileName(join(rootDir, libraryPath + fileExtname.content)),
        `<import src="${globalTemplatePath}"/>` + render(record.content),
      );

      if (record.contentTemplate) {
        emit.asset(
          toRollupFileName(
            join(
              rootDir,
              dirname(normalize(libraryPath)),
              'template' + fileExtname.contentTemplate,
            ),
          ),
          `<import src="${globalTemplatePath}"/>` +
            render(record.contentTemplate),
        );
      }

      if (record.style) {
        emit.asset(
          toRollupFileName(join(rootDir, libraryPath + fileExtname.style)),
          record.style,
        );
      }

      if (!libraryEntries.has(id)) {
        libraryEntries.set(id, {
          className,
          importPath: entry.moduleId,
          libraryPath,
        });
        // emitFile({type:'chunk'}) 只能在 build 阶段钩子里调（transform 可以，
        // generateBundle 不行），所以发现即 emit。
        emit.chunk(
          toRollupFileName(join(rootDir, libraryPath + '.js')),
          LIBRARY_ENTRY_VIRTUAL + id,
        );
      }
    }

    if (scopeArr.length) {
      templateScope.setScopeLibraryUseComponents(LIBRARY_SCOPE_ID, scopeArr);
    }
  };

  return {
    name: 'mini-program:library-template',
    resolveId(id: string) {
      // 虚拟 library entry 模块
      if (id.startsWith(LIBRARY_ENTRY_VIRTUAL)) {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (!id.startsWith(LIBRARY_ENTRY_VIRTUAL)) {
        return null;
      }
      const meta = libraryEntries.get(id.slice(LIBRARY_ENTRY_VIRTUAL.length));
      if (!meta) {
        // 找不到 meta 说明这个 id 没被收集到，给空模块而不是报错，
        // 避免一个组件解析失败把整个 build 带崩
        return '';
      }
      return libraryEntryModuleSource(meta);
    },
    transform(code: string, id: string) {
      const file = stripModuleQuery(id);
      // 库产物是 fesm（.mjs）；个别打包形态会出 .js，一并接
      if (!file.endsWith('.mjs') && !file.endsWith('.js')) {
        return null;
      }
      const meta = readLibraryMetaForModule(file);
      if (!meta || !meta.entries.length) {
        return null;
      }

      /**
       * 键是**组件名**，不是文件路径。
       *
       * 不变式：任何库里的组件都必须有清单。所以
       *   本文件检测到的组件 == 清单覆盖的组件 == emit 出去的组件
       * 三者不等就是库构建的 bug，必须响，不能 fallback。
       *
       * 之前这里是 `meta.entry ? [meta.entry] : meta.entries`：碰一个跟组件
       * 无关的文件（worker / 工具 JS）会把整包组件重 emit 一遍，而真正有
       * 组件却没进清单的文件反而静默跳过。
       */
      const detected = detectComponentNames(code);
      if (!detected.length) {
        // 没有组件的文件（worker / schematics / 工具 JS）直接走，零成本
        return null;
      }

      const byEntry = new Map<LibraryMetaEntry, string[]>();
      const missing: string[] = [];
      for (const name of detected) {
        const owner = meta.entries.find((e) =>
          Object.prototype.hasOwnProperty.call(e.components ?? {}, name),
        );
        if (!owner) {
          missing.push(name);
          continue;
        }
        const list = byEntry.get(owner) ?? [];
        list.push(name);
        byEntry.set(owner, list);
      }

      if (missing.length) {
        // 不是 warn，是 error：这些组件不会有任何 wxml，上线就是白屏。
        this.error(
          `[library-template] ${file} 里检测到组件 ${missing.join(', ')}，` +
            `但它们不在 ${LIBRARY_META_FILE_NAME} 里（包 ${meta.pkgRoot}）。` +
            `该库必须用当前版本工具链重新构建。`,
        );
      }

      const emit: EmitFns = {
        asset: (fileName, source) => {
          if (!fileName || fileName.startsWith('..')) {
            this.warn(`跳过无法归一化的库产物路径: ${fileName}`);
            return;
          }
          // 空内容不 emit：模板编译失败的组件以前会产出空 wxml，
          // 现在至少少一个迷惑人的空文件
          if (!source) {
            return;
          }
          if (emittedFiles.has(fileName)) {
            return;
          }
          emittedFiles.add(fileName);
          this.emitFile({ type: 'asset', fileName, source });
        },
        chunk: (fileName, moduleId) =>
          this.emitFile({ type: 'chunk', fileName, id: moduleId }),
      };

      for (const [entry, names] of byEntry) {
        assertTemplatePayload(entry);
        emitGlobalTemplates(entry, emit);
        emitComponents(entry, names, emit);
      }
      // 只读不改动模块代码
      return null;
    },
  };
}
