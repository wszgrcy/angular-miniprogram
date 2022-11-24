import type { BuilderContext } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { Path, getSystemPath, normalize, resolve } from '@angular-devkit/core';
import * as glob from 'glob';
import * as path from 'path';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Injectable } from 'static-injector';
import * as webpack from 'webpack';
import { BuildPlatform } from '../../platform/platform';
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
  }
  apply(compiler: webpack.Compiler) {
    let rootCompilation: boolean = false;
    compiler.hooks.beforeCompile.tapPromise(
      'DynamicWatchEntryPlugin',
      async (compilationParams) => {
        if (rootCompilation) {
          return;
        }

        this.entryPattern$.next({
          pageList: await this.generateModuleInfo(
            this.options.pages || [],
            'page'
          ),
          componentList: await this.generateModuleInfo(
            this.options.components || [],
            'component'
          ),
        });
      }
    );
    compiler.hooks.thisCompilation.tap(
      'DynamicWatchEntryPlugin',
      (compilation) => {
        rootCompilation = true;
        if (this.first) {
          this.first = false;
          const patternList = normalizeAssetPatterns(
            [...(this.options.pages || []), ...(this.options.components || [])],
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
    // 因为监听更新的时候beforeCompile会拦截所有的,所以这么实现(因为还有一次性构建不触发watchRun,所以不能代替)
    compiler.hooks.watchRun.tap('DynamicWatchEntryPlugin', async () => {
      rootCompilation = false;
    });
    // 入口移动到这里是因为ng新增了一个插件也同时修改了入口,
    const originEntryConfig = compiler.options.entry;
    compiler.options.entry = async () => {
      await this.entryPattern$.pipe(filter(Boolean), take(1)).toPromise();
      const entryPattern = this.entryPattern$.value!;

      const list = [...entryPattern.pageList, ...entryPattern.componentList];
      const result = (await (typeof originEntryConfig === 'function'
        ? originEntryConfig()
        : originEntryConfig))!;
      if (result['app']) {
        throw new Error(
          '资源文件不能指定为app文件名或bundleName,请重新修改(不影响导出)'
        );
      }
      return {
        ...result,
        ...list.reduce((pre, cur) => {
          pre[cur.entryName] = { import: [cur.src] };
          return pre;
        }, {} as Record<string, Exclude<webpack.EntryNormalized, Function>[string]>),
      };
    };
  }
  private async generateModuleInfo(
    list: AssetPattern[],
    type: 'page' | 'component'
  ) {
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
          object.outputFiles!.config =
            object.outputFiles!.path + this.buildPlatform.fileExtname.config;
          object.type = type;
          return object as PagePattern;
        })
      );
    }
    return moduleList;
  }
}
