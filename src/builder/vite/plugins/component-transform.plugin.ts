import type { Plugin } from 'vite';
import { changeComponent } from '../../component-template-inject/change-component';

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
 */
export function miniProgramComponentTransformPlugin(): Plugin {
  return {
    name: 'mini-program:component-transform',
    // 明确排在 angular 插件之后（analog 主插件没有 enforce，属于 normal 组，
    // post 组一定在它后面）
    enforce: 'post',
    transform(code: string, id: string) {
      // 只处理项目内的 ts 产物；node_modules 里的库组件走 library 那条线
      if (!id.endsWith('.ts') || id.includes('node_modules')) {
        return null;
      }
      if (!code.includes('ɵɵdefineComponent')) {
        return null;
      }
      const changed = changeComponent(code);
      if (!changed || changed.content === code) {
        return null;
      }
      return { code: changed.content, map: null };
    },
  };
}
