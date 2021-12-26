import type { BuilderContext } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { Path, getSystemPath, normalize, resolve } from '@angular-devkit/core';
import * as glob from 'glob';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from 'static-injector';
import * as webpack from 'webpack';
import { BuildPlatform } from '../platform/platform';
import type { PagePattern } from '../type';

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
  absoluteProjectRoot!: Path;
  absoluteProjectSourceRoot!: Path;
  constructor(
    private options: {
      pages: AssetPattern[];
      components: AssetPattern[];
      workspaceRoot: Path;
      context: BuilderContext;
      config: webpack.Configuration;
    },
    private buildPlatform: BuildPlatform
  ) {}
  async init() {
    const projectName =
      this.options.context.target && this.options.context.target.project;
    if (!projectName) {
      throw new Error('The builder requires a target.');
    }
    const projectMetadata = await this.options.context.getProjectMetadata(
      projectName
    );
    this.absoluteProjectRoot = normalize(
      getSystemPath(
        resolve(
          this.options.workspaceRoot,
          normalize((projectMetadata.root as string) || '')
        )
      )
    );
    const relativeSourceRoot = projectMetadata.sourceRoot as string | undefined;
    const absoluteSourceRootPath =
      typeof relativeSourceRoot === 'string'
        ? resolve(this.options.workspaceRoot, normalize(relativeSourceRoot))
        : undefined;
    if (relativeSourceRoot) {
      this.absoluteProjectSourceRoot = normalize(
        getSystemPath(absoluteSourceRootPath!)
      )!;
    }

    const originEntryConfig = this.options.config.entry as webpack.EntryObject;
    this.options.config.entry = async () => {
      const entryPattern = this.entryPattern$.value;
      if (!entryPattern) {
        throw new Error('未匹配入口');
      }
      const list = [...entryPattern.pageList, ...entryPattern.componentList];
      if (originEntryConfig['app']) {
        throw new Error(
          '资源文件不能指定为app文件名或bundleName,请重新修改(不影响导出)'
        );
      }
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
            this.absoluteProjectRoot,
            this.absoluteProjectSourceRoot
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
      this.absoluteProjectRoot,
      this.absoluteProjectSourceRoot
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            outputFiles: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inputFiles: {} as any,
          };
          object.inputFiles!.config = object.src!.replace(
            /\.ts$/,
            this.buildPlatform.fileExtname.config!
          );
          const outputFileName =
            object.fileName!.replace(/\.ts$/, '').replace(/\./g, '-') + '.ts';
          object.outputFiles!.path = path
            .join(pattern.output, outputFileName)
            .replace(/\.ts$/, '');
          object.outputFiles!.logic =
            object.outputFiles!.path + this.buildPlatform.fileExtname.logic;
          object.outputFiles!.style =
            object.outputFiles!.path + this.buildPlatform.fileExtname.style;
          object.outputFiles!.content =
            object.outputFiles!.path + this.buildPlatform.fileExtname.content;
          // todo 准备废弃导出模板设置
          object.outputFiles!.contentTemplate = path.join(
            path.dirname(object.outputFiles!.logic),
            `template${this.buildPlatform.fileExtname.contentTemplate}`
          );
          object.outputFiles!.config =
            object.outputFiles!.path + this.buildPlatform.fileExtname.config;
          return object as PagePattern;
        })
      );
    }
    return moduleList;
  }
}
