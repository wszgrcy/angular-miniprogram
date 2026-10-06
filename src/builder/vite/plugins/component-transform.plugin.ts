import type { Plugin } from 'vite';
import { changeComponent } from '../../component-template-inject/change-component';
import { isMpLibraryFile } from '../../library/library-meta-reader';
import { stripModuleQuery } from '../../util';

/**
 * 在 Vite 的 transform 阶段给 AOT 编译后的组件注入 propertyChange。
 *
 * Vite/Rollup 的 transform 是链式的，本插件排在 analog 插件后面，拿到的是带
 * `ɵɵdefineComponent` 的 AOT 产物。这里是 per-module、bundle 之前的阶段，注入的
 * import 仍是合法 ESM，不需要给 runtime 挂全局。
 *
 * 处理两类文件：
 * 1. 应用自己的 `.ts`；
 * 2. mp 库的 fesm 产物（node_modules 里的 `.mjs`），库 JS 产物是 vanilla 的，运行时 hook 由这里补。
 *    判定用 `isMpLibraryFile`，不能按「所有 node_modules」粗筛：`@angular/common` 的 fesm
 *    里同样有 `ɵɵdefineComponent`，注进去等于给每个 `*ngIf` 加一次 setData。
 *
 * 不需要「已注入则跳过」的幂等保护：能到这里说明包根带着当前构建器产的 sidecar，
 * 而当前构建器不注入。那种保护是整文件级的正则判定，注释和字符串都会命中，
 * 防的问题不存在却能制造静默少注入。
 */
export function miniProgramComponentTransformPlugin(): Plugin {
  return {
    name: 'mini-program:component-transform',
    // 明确排在 angular 插件之后（analog 主插件没有 enforce，属于 normal 组，post 组一定在它后面）
    enforce: 'post',
    transform(code: string, id: string) {
      // 廉价前置过滤：没有组件就别 parse
      if (!code.includes('ɵɵdefineComponent')) {
        return null;
      }
      const file = stripModuleQuery(id);
      const isAppSource = file.endsWith('.ts') && !id.includes('node_modules');
      const isMpLibrary =
        (file.endsWith('.mjs') || file.endsWith('.js')) &&
        isMpLibraryFile(file);
      if (!isAppSource && !isMpLibrary) {
        return null;
      }
      const changed = changeComponent(code);
      /**
       * `changeComponent` 在没有组件时返回 `undefined`，这里同时是「本文件真的有组件」的闸门。
       * 不要再加一层 `detectComponentNames`：`changed.componentNames` 就是现成的检测结果。
       */
      if (!changed || !changed.componentNames.length) {
        return null;
      }
      if (changed.content === code) {
        return null;
      }
      return { code: changed.content, map: null };
    },
  };
}
