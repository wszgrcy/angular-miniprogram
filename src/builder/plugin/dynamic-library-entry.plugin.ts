import { join, normalize } from '@angular-devkit/core';
import * as webpack from 'webpack';
import { LibrarySymbol, LIBRARY_OUTPUT_PATH } from '../const';
import { LibraryLoaderContext } from '../type';

const CUSTOM_URI = 'dynamic';
const CUSTOM_URI_REG = /^dynamic:(.*)\.ts$/;
export class DynamicLibraryEntryPlugin {
  apply(compiler: webpack.Compiler) {
    compiler.hooks.finishMake.tapAsync(
      'DynamicLibraryEntryPlugin',
      (compilation, callback) => {
        const libraryLoaderContext: LibraryLoaderContext = (compilation as any)[
          LibrarySymbol
        ];
        if (!libraryLoaderContext) {
          callback(undefined);
          return;
        }
        const hooks = webpack.NormalModule.getCompilationHooks(compilation);
        hooks.readResource
          .for(CUSTOM_URI)
          .tapAsync(
            'DynamicLibraryEntryPlugin',
            (loaderContext: any, callback) => {
              const resourcePath: string = loaderContext.resourcePath;
              const id = resourcePath.match(CUSTOM_URI_REG)![1];
              const libraryMeta = libraryLoaderContext.libraryMetaList.find(
                (item) => item.id === id
              );
              callback(
                undefined,
                `
            import * as amp from 'angular-miniprogram';
            import * as library from '${libraryMeta?.contextPath}';
            amp.componentRegistry(library.${libraryMeta?.className});
            `
              );
              return;
            }
          );
        let j = 0;
        for (let i = 0; i < libraryLoaderContext.libraryMetaList.length; i++) {
          const meta = libraryLoaderContext.libraryMetaList[i];

          const entry = join(
            normalize(LIBRARY_OUTPUT_PATH),
            meta.baseDir,
            meta.logicName
          );
          const dep = webpack.EntryPlugin.createDependency(
            `${CUSTOM_URI}:${meta.id}.ts`,
            entry
          );
          compilation.addEntry(compiler.context, dep, entry, (err, result) => {
            j++;
            if (j === libraryLoaderContext.libraryMetaList.length) {
              callback(undefined);
            }
          });
        }
      }
    );
  }
}
