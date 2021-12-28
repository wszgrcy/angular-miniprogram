/* eslint-disable @typescript-eslint/no-explicit-any */
import { join, normalize } from '@angular-devkit/core';
import path from 'path';
import { Injectable } from 'static-injector';
import * as webpack from 'webpack';
import { LIBRARY_OUTPUT_ROOTDIR, LibrarySymbol } from '../const';
import { BuildPlatform } from '../platform/platform';
import type { LibraryComponentEntryMeta, LibraryLoaderContext } from '../type';

const CUSTOM_URI = 'dynamic';
const CUSTOM_URI_REG = /^dynamic:\/\/__license(?:\/|\\)(.*)\.ts$/;
@Injectable()
export class DynamicLibraryComponentEntryPlugin {
  private libraryComponentMap = new Map<string, LibraryComponentEntryMeta>();
  constructor(private buildPlatform: BuildPlatform) {}
  apply(compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap(
      'DynamicLibraryEntryPlugin',
      (thisCompilation) => {
        (thisCompilation as any)[LibrarySymbol] = (thisCompilation as any)[
          LibrarySymbol
        ] || { buildPlatform: this.buildPlatform };
        const hooks = webpack.NormalModule.getCompilationHooks(thisCompilation);
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
        compiler.hooks.finishMake.tapAsync(
          'DynamicLibraryEntryPlugin',
          (compilation, callback) => {
            const libraryLoaderContext: LibraryLoaderContext = (
              compilation as any
            )[LibrarySymbol];
            if (compilation !== thisCompilation) {
              callback(undefined);
              return;
            }
            if (libraryLoaderContext.libraryMetaList) {
              libraryLoaderContext.libraryMetaList.forEach((item) => {
                this.libraryComponentMap.set(item.id, item);
              });
            }

            if (this.libraryComponentMap.size === 0) {
              callback(undefined);
              return;
            }
            let j = 0;
            this.libraryComponentMap.forEach((meta) => {
              const entry = join(
                normalize(LIBRARY_OUTPUT_ROOTDIR),
                meta.libraryPath
              );
              const dep = webpack.EntryPlugin.createDependency(
                `${CUSTOM_URI}://${path.join('__license', meta.id)}.ts`,
                entry
              );
              compilation.addEntry(
                compiler.context,
                dep,
                entry,
                (err, result) => {
                  j++;
                  if (j === this.libraryComponentMap.size) {
                    callback(undefined);
                  }
                }
              );
            });
          }
        );
      }
    );
  }
}
