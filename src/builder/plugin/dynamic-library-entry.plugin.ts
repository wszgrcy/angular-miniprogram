import { join, normalize } from '@angular-devkit/core';
import * as webpack from 'webpack';
import { LibrarySymbol } from '../const';
import { LibraryLoaderContext } from '../type';
const CUSTOM_URI = 'dynamic';
export class DynamicLibraryEntryPlugin {
  apply(compiler: webpack.Compiler) {
    compiler.hooks.finishMake.tapAsync('sdfsf', (compilation, callback) => {
      let libraryLoaderContext: LibraryLoaderContext = (compilation as any)[
        LibrarySymbol
      ];
      let j = 0;
      for (let i = 0; i < libraryLoaderContext.libraryMetaList.length; i++) {
        const meta = libraryLoaderContext.libraryMetaList[i];
        const hooks = webpack.NormalModule.getCompilationHooks(compilation);
        // todo 引入mjs 导出 加上组件的注册
        hooks.readResource
          .for(CUSTOM_URI)
          .tapAsync(
            'DynamicLibraryEntryPlugin',
            (loaderContext: any, callback) => {
              const { resourcePath } = loaderContext;
              callback(undefined, `require('./src/index.js');`);
              return;
            }
          );
        let entry = join(normalize('library'), meta.baseDir);
        let dep = webpack.EntryPlugin.createDependency(
          `${CUSTOM_URI}:${meta.componentName}`,
          entry
        );
        compilation.addEntry(compiler.context, dep, entry, (err, result) => {
          j++;
          if (j === libraryLoaderContext.libraryMetaList.length) {
            callback(undefined);
          }
        });
      }
    });
  }
}
