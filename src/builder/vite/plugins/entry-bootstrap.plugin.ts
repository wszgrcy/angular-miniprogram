import * as fs from 'fs';
import * as path from 'path';
import type { Plugin } from 'vite';
import {
  MP_ENTRY_BOOTSTRAP,
  detectEntryComponentFromSource,
} from '../../shared/entry-component';
import type { PagePattern } from '../../shared/type';
import { toPosix } from '../../util/path';

/**
 * 虚拟入口模块前缀（`\0` 是 rollup 的虚拟模块约定）。
 *
 * 和库构建的 `\0mp-library-entry:` 是同一招：库使用者从来不写
 * `componentRegistry`，产物里那一行是构建器生成的。app 入口同理。
 */
const MP_ENTRY_VIRTUAL = '\0mp-entry:';

/**
 * 自动组件在虚拟 id 里拼类名的分隔符。
 *
 * 同一个源文件可以贡献多个 `@Component`，而 id 必须一个产物一个：共用
 * `src` 会让两个入口在 rollup 里塌成一个模块，第二个产物只剩一句 require，
 * 组件注册直接丢。`#` 在 Windows 文件名里非法，拿它切分不会和路径本身撞。
 */
const MP_ENTRY_CLASS_SEP = '#mp-component:';

/**
 * 文件路径 → 模块说明符。
 *
 * 用 `toPosix`（只翻分隔符），**不能**走 `toPosixPath`：它还会剥前导 `/`，
 * 而这里的绝对路径一旦少了开头的 `/`，生成出来的 `import 'workspace/x/y.ts'`
 * 就被当成裸模块名，解析不到。
 */
const toModulePath = toPosix;

/** 入口源文件（+ 自动组件的类名）→ 虚拟入口模块 id */
export function mpEntryVirtualId(
  src: string,
  componentClassName?: string,
): string {
  return `${MP_ENTRY_VIRTUAL}${toModulePath(path.resolve(src))}${
    componentClassName ? `${MP_ENTRY_CLASS_SEP}${componentClassName}` : ''
  }`;
}

/**
 * 虚拟入口模块 id → 它包装的入口源文件路径；非虚拟 id 原样返回。
 *
 * 任何「按源路径前缀判定归属」的逻辑（分包归属等）都得先脱壳，
 * 否则入口模块会被当成主包外的匿名模块。自动组件拼在后面的类名也一并
 * 脱掉：它不是路径的一部分。
 */
export function unwrapEntryVirtualId(moduleId: string): string {
  const body = moduleId.startsWith(MP_ENTRY_VIRTUAL)
    ? moduleId.slice(MP_ENTRY_VIRTUAL.length)
    : moduleId;
  const sep = body.indexOf(MP_ENTRY_CLASS_SEP);
  return sep < 0 ? body : body.slice(0, sep);
}

export interface EntryBootstrapPluginOptions {
  entries: PagePattern[];
}

/**
 * 生成的入口模块源码。
 *
 * 用户入口只负责「我是哪个组件」：
 *
 *   export { RootPage as default } from './root.component';
 *
 * 这里按入口来源补上小程序侧的注册：
 *
 *   import * as amp from 'angular-miniprogram';
 *   import __mpComponent from '<entry>';
 *   amp.bootstrapPage(__mpComponent);
 *
 * 用 default import 而不是重新解析组件类名：入口里 `export default` 写成
 * 什么形态（标识符 / re-export / 表达式）都不用管，绑上就行。
 *
 * 自动组件没有入口文件，也就没有 default 可认，改成按类名具名 import。
 * 类名是分析层从 `@Component` 声明直接拿的，不存在别名问题。
 */
function entryModuleSource(entry: PagePattern): string {
  const modulePath = JSON.stringify(toModulePath(path.resolve(entry.src)));
  const componentImport = entry.componentClassName
    ? `import { ${entry.componentClassName} as __mpComponent } from ${modulePath};\n`
    : `import __mpComponent from ${modulePath};\n`;
  return (
    `import * as amp from 'angular-miniprogram';\n` +
    componentImport +
    `amp.${MP_ENTRY_BOOTSTRAP[entry.type]}(__mpComponent);\n`
  );
}

/**
 * 入口注册函数（`Page()` / `Component()` 那一层）全部由本插件注入。
 *
 * 为什么必须在「入口模块」这一层做，而不是在组件源文件里：小程序的组件身份
 * 由**文件路径**决定，`Component()` / `Page()` 必须在「那个路径的 js 被求值」
 * 时同步调用一次。组件源文件常被 code-split 进共享 chunk，在那儿调用毫无意义。
 */
export function entryBootstrapPlugin(
  options: EntryBootstrapPluginOptions,
): Plugin {
  const entries = new Map(
    options.entries.map((item) => [
      mpEntryVirtualId(item.src, item.componentClassName),
      item,
    ]),
  );
  return {
    name: 'mini-program:entry-bootstrap',
    // resolveId 必须抢在 vite 自己的解析器前面，否则 `\0` 开头的 id
    // 会被当成普通裸模块去 node_modules 里找
    enforce: 'pre',
    resolveId(id: string) {
      return entries.has(id) ? id : null;
    },
    load(id: string) {
      const entry = entries.get(id);
      if (!entry) {
        return null;
      }
      const code = fs.readFileSync(entry.src, 'utf8');
      if (
        !entry.componentClassName &&
        !detectEntryComponentFromSource(code, entry.src)
      ) {
        this.error(
          `${entry.src} 没声明入口组件：` +
            `需要 \`export default 组件类\`（或 \`export { 组件类 as default } from './x'\`）`,
        );
      }
      return entryModuleSource(entry);
    },
  };
}
