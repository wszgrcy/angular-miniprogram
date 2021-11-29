/* eslint-disable @typescript-eslint/no-explicit-any */
import { join, normalize } from '@angular-devkit/core';
import { Injectable } from 'static-injector';
import * as webpack from 'webpack';
import { LIBRARY_OUTPUT_PATH, LibrarySymbol } from '../const';
import { BuildPlatform } from '../platform/platform';
import type { LibraryComponentEntryMeta, LibraryLoaderContext } from '../type';

const CUSTOM_URI = 'dynamic';
const CUSTOM_URI_REG = /^dynamic:(.*)\.ts$/;
@Injectable()
export class DynamicLibraryComponentEntryPlugin {
  private libraryComponentMap = new Map<string, LibraryComponentEntryMeta>();
  constructor(private buildPlatform: BuildPlatform) {}
  apply(compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap(
      'DynamicLibraryEntryPlugin',
      (compilation) => {
        (compilation as any)[LibrarySymbol] =
          (compilation as any)[LibrarySymbol] || {};

        (compilation as any)[LibrarySymbol].buildPlatform = this.buildPlatform;
      }
    );
    compiler.hooks.finishMake.tapAsync(
      'DynamicLibraryEntryPlugin',
      (compilation, callback) => {
        const libraryLoaderContext: LibraryLoaderContext = (compilation as any)[
          LibrarySymbol
        ];
        if (compilation.name?.startsWith('angular-compiler:')) {
          callback(undefined);
          return;
        }
        if (!libraryLoaderContext) {
          callback(undefined);
          return;
        }
        if (
          !libraryLoaderContext.libraryMetaList &&
          !this.libraryComponentMap.size
        ) {
          callback(undefined);
          return;
        }
        if (libraryLoaderContext.libraryMetaList) {
          libraryLoaderContext.libraryMetaList.forEach((item) => {
            this.libraryComponentMap.set(item.id, item);
          });
        }
        const hooks = webpack.NormalModule.getCompilationHooks(compilation);
        hooks.readResource
          .for(CUSTOM_URI)
          .tapAsync(
            'DynamicLibraryEntryPlugin',
            (loaderContext: any, callback) => {
              const resourcePath: string = loaderContext.resourcePath;
              const id = resourcePath.match(CUSTOM_URI_REG)![1];
              const libraryMeta = this.libraryComponentMap.get(id);

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
        this.libraryComponentMap.forEach((meta) => {
          const entry = join(normalize(LIBRARY_OUTPUT_PATH), meta.libraryPath);
          const dep = webpack.EntryPlugin.createDependency(
            `${CUSTOM_URI}:${meta.id}.ts`,
            entry
          );
          compilation.addEntry(compiler.context, dep, entry, (err, result) => {
            j++;
            if (j === this.libraryComponentMap.size) {
              callback(undefined);
            }
          });
        });
      }
    );
  }
}
