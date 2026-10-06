import type { Plugin } from 'vite';
import { changeComponent } from '../../component-template-inject/change-component';
import { isMpLibraryFile } from '../../library/library-meta-reader';
import { stripModuleQuery } from '../../util';

/**
 * 在 Vite 的 transform 阶段给 AOT 编译后的组件注入 propertyChange。
 *
 * 关键前提（已实测）：Vite/Rollup 的 transform 是**链式**的，每个插件的输出
 * 喂给下一个插件。所以只要本插件排在 @analogjs/vite-plugin-angular **后面**，
 * 拿到的就是带 ɵɵdefineComponent / rf & 1 / rf & 2 的 AOT 产物，
 * 而不是原始 TS。
 *
 * 而且这里是 per-module、bundle 之前的阶段，注入的
 * `import * as amp from 'angular-miniprogram'` 仍是合法 ESM，
 * Rollup 打包时会正常解析进 bundle——不需要给 runtime 挂全局。
 *
 * 对应 webpack 时代的 loader/component-template.loader.ts。
 *
 * ## 处理两类文件
 *
 * 1. **应用自己的 `.ts`** —— AOT 之后注入，和以前一样。
 * 2. **mp 库的 fesm 产物（node_modules 里的 `.mjs`）** —— 库构建现在只出
 *    `mp-library-meta.json`，JS 产物是 vanilla 的，运行时 hook 由这里补。
 *
 *    判定用 `isMpLibraryFile`（包根有没有 `mp-library-meta.json`），
 *    **不能**按「所有 node_modules」粗筛：`@angular/common` 的 fesm 里同样有
 *    `ɵɵdefineComponent`（NgIf / NgFor），注进去等于给每个 `*ngIf` 加一次
 *    setData。
 *
 * ## 为什么没有「已注入则跳过」的幂等保护
 *
 * 结构上重复注入到不了：能走到注入这一行，`isMpLibraryFile` 必须为 true
 * → 包根必须有 **v2** sidecar（v1 在 `readLibraryMetaFile` 的版本检查里
 * 就被判 undefined）→ 而 v2 sidecar 只有当前构建器会产，当前构建器
 * **不注入**。所以能到这里文件不可能已经带着注入调用。
 *
 * 而且那种保护有害：它是整文件级的正则判定，注释和字符串字面量都会命中
 * （`// 见 amp.propertyChange(view)` 就能让整个文件不注入）。它防的问题不
 * 存在，却能制造「一个文件里所有组件静默少注入、零报错」这个真问题。
 *
 * 真出现重复注入了，那是模块图 / 构建链路本身出了 bug，应该查源头，
 * 不是在这里把它挡掉。
 */
export function miniProgramComponentTransformPlugin(): Plugin {
  return {
    name: 'mini-program:component-transform',
    // 明确排在 angular 插件之后（analog 主插件没有 enforce，属于 normal 组，
    // post 组一定在它后面）
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
       * `changeComponent` 在没有组件时直接返回 `undefined`，所以这里同时
       * 就是「本文件真的有组件」的闸门：worker / schematics / 工具 JS 这类
       * 不含组件的文件（哪怕包根有 sidecar）在这里就走了，不会多注任何东西。
       *
       * 注意不要在这里再加一层 `detectComponentNames` —— 那会把同一份代码
       * 再 AST 解析一遍，`changed.componentNames` 就是现成的检测结果。
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
