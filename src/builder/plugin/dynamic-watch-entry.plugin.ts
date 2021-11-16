import { BuilderContext } from '@angular-devkit/architect';
import { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';
import { Path } from '@angular-devkit/core';
import * as glob from 'glob';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from 'static-injector';
import * as webpack from 'webpack';
import { BuildPlatform } from '../platform/platform';
import { PagePattern } from '../type';

function globAsync(pattern: string, options: glob.IOptions) {
  return new Promise<string[]>((resolve, reject) =>
    glob.default(pattern, options, (e, m) => (e ? reject(e) : resolve(m)))
  );
}
@Injectable()
export class DynamicWatchEntryPlugin {
  pageList!: PagePattern[];
  componentList!: PagePattern[];
  entryPattern$ = new BehaviorSubject<
    | {
        pageList: PagePattern[];
        componentList: PagePattern[];
      }
    | undefined
  >(undefined);
  private first = true;
  constructor(
    private options: {
      pages: AssetPattern[];
      components: AssetPattern[];
      workspaceRoot: Path;
      absoluteProjectRoot: Path;
      absoluteProjectSourceRoot: Path;
      context: BuilderContext;
      config: webpack.Configuration;
    },
    private buildPlatform: BuildPlatform
  ) {
    this.init();
  }
  init() {
    const originEntryConfig = this.options.config.entry as webpack.EntryObject;
    this.options.config.entry = async () => {
      const entryPattern = this.entryPattern$.value;
      if (!entryPattern) {
        throw new Error('未匹配入口');
      }
      const list = [...entryPattern.pageList, ...entryPattern.componentList];
      return {
        ...originEntryConfig,
        ...list.reduce((pre, cur) => {
          pre[cur.entryName] = [cur.src];
          return pre;
        }, {} as webpack.EntryObject),
      };
    };
  }
  apply(compiler: webpack.Compiler) {
    compiler.hooks.beforeCompile.tapPromise(
      'DynamicWatchEntryPlugin',
      async (compilation) => {
        this.entryPattern$.next({
          pageList: await this.generateModuleInfo(this.options.pages),
          componentList: await this.generateModuleInfo(this.options.components),
        });
      }
    );
    compiler.hooks.thisCompilation.tap(
      'DynamicWatchEntryPlugin',
      (compilation) => {
        if (this.first) {
          this.first = false;
          const patternList = normalizeAssetPatterns(
            [...this.options.pages, ...this.options.components],
            this.options.workspaceRoot,
            this.options.absoluteProjectRoot,
            this.options.absoluteProjectSourceRoot
          );
          for (const pattern of patternList) {
            const cwd = path.resolve(
              this.options.context.workspaceRoot,
              pattern.input
            );
            compilation.fileDependencies.add(cwd);
          }
        }
      }
    );
  }
  private async generateModuleInfo(list: AssetPattern[]) {
    const patternList = normalizeAssetPatterns(
      list,
      this.options.workspaceRoot,
      this.options.absoluteProjectRoot,
      this.options.absoluteProjectSourceRoot
    );
    const moduleList: PagePattern[] = [];
    for (const pattern of patternList) {
      const cwd = path.resolve(
        this.options.context.workspaceRoot,
        pattern.input
      );
      /** 当前匹配匹配到的文件 */
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
            outputFiles: {} as any,
          };
          object.outputFiles!.logic = path
            .join(pattern.output, object.fileName!)
            .replace(/\.ts$/g, '.js');
          object.outputFiles!.style = object.outputFiles!.logic.replace(
            /\.js$/g,
            this.buildPlatform.fileExtname.style
          );
          object.outputFiles!.content = object.outputFiles!.logic.replace(
            /\.js$/g,
            this.buildPlatform.fileExtname.content
          );
          object.outputFiles!.contentTemplate = path.join(
            path.dirname(object.outputFiles!.logic),
            `template${this.buildPlatform.fileExtname.contentTemplate}`
          );
          return object as PagePattern;
        })
      );
    }
    return moduleList;
  }
}
