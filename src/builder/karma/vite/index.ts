import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import * as path from 'path';
import { Observable } from 'rxjs';
import type { InlineConfig } from 'vite';
import { LibraryTemplateScopeService } from '../../shared/library-template-scope.service';
import {
  buildPlatformDefine,
  buildViteAlias,
  getBuildPlatform,
} from '../../vite';
import {
  generateEntryPatterns,
  toRollupInput,
} from '../../vite/entry-patterns';
import { miniProgramComponentTransformPlugin } from '../../vite/plugins/component-transform.plugin';
import { libraryTemplatePlugin } from '../../vite/plugins/library-template.plugin';
import { jasmineGlobalDefine, karmaClientDefine } from '../jasmine-define';
import { writeDerivedTsConfig } from './derived-tsconfig';
import { setViteKarmaFrameworkHooks } from './karma-framework';
import { globSpecFiles } from './spec-discovery';

export interface KarmaViteBuilderOptions {
  karmaConfig: string;
  tsConfig: string;
  outputPath: string;
  pages: AssetPattern[];
  components: AssetPattern[];
  platform: import('../../platform/platform').PlatformType;
  assets?: AssetPattern[];
  styles?: (string | { input: string })[];
  sourceMap?: boolean;
  watch?: boolean;
  browsers?: string;
  reporters?: string[];
  /** karma client 配置，对应 karma.conf.js 的 client 段 */
  client?: Record<string, unknown>;
  /** karma 服务端口 */
  port?: number;
  /** spec 文件 glob */
  include?: string[];
  /** spec 文件排除 glob */
  exclude?: string[];
  /** karma 引导入口（test.ts），import karma client 并调 startupTest() */
  main?: string;
}

/**
 * 组装测试构建的 Vite 配置。
 *
 * 和 application-vite 基本一样，差别在 define：
 *   - 测试链路要额外把 jasmine 全局（describe/it/expect/spyOn…）
 *     映射到小程序运行时全局
 *   - 还要注入 KARMA_PORT / KARMA_CLIENT_CONFIG 给 karma client
 */
export async function createKarmaViteConfig(options: {
  karmaOptions: KarmaViteBuilderOptions;
  context: BuilderContext;
  buildPlatform: import('../../platform/platform').BuildPlatform;
}): Promise<InlineConfig> {
  const { karmaOptions, context, buildPlatform } = options;
  const entryPatterns = await generateEntryPatterns({
    pages: karmaOptions.pages || [],
    components: karmaOptions.components || [],
    workspaceRoot: context.workspaceRoot,
    context,
    buildPlatform,
  });
  const allEntries = [
    ...entryPatterns.pageList,
    ...entryPatterns.componentList,
  ];

  // spec 文件不被任何 entry import，webpack 侧靠 FindTestsPlugin 单独发现
  // 并加为 entry。Vite 这边必须自己 glob 出来，否则 bundle 里根本没有
  // describe / it，jasmine 全局替换也就无从生效。
  const specFiles = await globSpecFiles({
    cwd: path.resolve(context.workspaceRoot, 'src'),
    include: karmaOptions.include ?? ['**/*.spec.ts', '**/*.test.ts'],
    exclude: karmaOptions.exclude ?? [],
  });

  const angularPluginModule: unknown = await import(
    '@analogjs/vite-plugin-angular'
  );
  const angular = (
    typeof angularPluginModule === 'function'
      ? angularPluginModule
      : (angularPluginModule as { default: unknown }).default
  ) as (opts: unknown) => import('vite').Plugin[];

  const templateScope = new LibraryTemplateScopeService();

  // 把 typeRoots 钉到 workspace 的 node_modules/@types，
  // 否则临时 host 目录下找不到 @types/jasmine
  const derivedTs = writeDerivedTsConfig({
    baseTsConfig: karmaOptions.tsConfig,
    workspaceRoot: context.workspaceRoot,
  });

  return {
    root: context.workspaceRoot,
    configFile: false,
    mode: 'development',
    logLevel: 'warn',
    define: {
      ...buildPlatformDefine(buildPlatform, false),
      ...jasmineGlobalDefine(buildPlatform),
      ...karmaClientDefine({
        clientConfig: karmaOptions.client ?? { captureConsole: true },
        port: karmaOptions.port ?? 9876,
      }),
    },
    resolve: {
      alias: [
        // spec 里有 `src/spec-component/...` 这种从项目根算起的写法，
        // 靠 tsconfig 的 baseUrl 解析。Vite / Rolldown 不读 baseUrl，
        // 这里补一条 src/ -> <项目根>/src/ 的 alias。
        // 必须排在 tsconfig paths 之前，且只补路径前缀，不影响
        // angular-miniprogram 那类已有映射。
        {
          find: /^src\//,
          replacement: path.resolve(context.workspaceRoot, 'src') + '/',
        },
        ...buildViteAlias(
          buildPlatform,
          karmaOptions.tsConfig,
          context.workspaceRoot
        ),
      ],
    },
    plugins: [
      ...angular({
        tsconfig: derivedTs.path,
        workspaceRoot: context.workspaceRoot,
        fastCompile: false,
        experimental: { useAngularCompilationAPI: true },
      }),
      libraryTemplatePlugin({ buildPlatform, templateScope }),
      miniProgramComponentTransformPlugin(),
    ],
    build: {
      outDir: karmaOptions.outputPath,
      emptyOutDir: true,
      sourcemap: !!karmaOptions.sourceMap,
      minify: false,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          ...toRollupInput(allEntries),
          // karma 的引导入口（test.ts）：它 import karma client 并调
          // startupTest()。不把它加为 entry 的话 client 根本不进 bundle，
          // KARMA_PORT / KARMA_CLIENT_CONFIG 也就没地方被替换。
          ...(karmaOptions.main
            ? {
                test: path.resolve(context.workspaceRoot, karmaOptions.main),
              }
            : {}),
          // spec 用 specs/<相对路径> 做 entry key，和页面 entry 分命名空间避免撞名
          ...specFiles.reduce<Record<string, string>>((pre, f) => {
            pre[`specs/${f.rel}`] = f.abs;
            return pre;
          }, {}),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
  };
}

/**
 * Vite 版 karma builder。
 *
 * 和 webpack 版的关键差别：**打包不经过 karma**。
 *
 *   vite.build() 产出 spec 小程序到磁盘
 *     → 起 karma server（只提供 socket + reporter）
 *     → 微信开发者工具从磁盘打开产物
 *     → client 连 socket，jasmine 在小程序运行时里跑
 *     → 结果回传 karma → reporter → BuilderOutput
 *
 * karma 的 launcher / reporter / socket 协议完全没动，
 * 换掉的只是「编译这一步用谁」。
 */
export function runKarmaViteBuilder(
  options: KarmaViteBuilderOptions,
  context: BuilderContext
): Observable<BuilderOutput> {
  return new Observable<BuilderOutput>((observer) => {
    let karmaServer: { stop(): Promise<void> } | undefined;
    let closed = false;

    // 把 karma 的结果转成 BuilderOutput
    setViteKarmaFrameworkHooks({
      onSuccess: () => {
        if (!closed) {
          observer.next({ success: true });
        }
      },
      onFailure: () => {
        if (!closed) {
          observer.next({ success: false });
        }
      },
    });

    void (async () => {
      try {
        const buildPlatform = getBuildPlatform(options.platform);
        const vite = await import('vite');

        const config = await createKarmaViteConfig({
          karmaOptions: options,
          context,
          buildPlatform,
        });

        await vite.build(config);

        const karma = await import('karma');
        const karmaOptions: Record<string, unknown> = {
          singleRun: options.watch ? false : true,
        };
        if (options.browsers) {
          karmaOptions.browsers = options.browsers.split(',');
        }
        if (options.reporters?.length) {
          karmaOptions.reporters = options.reporters
            .flatMap((r) => r.split(','))
            .filter(Boolean);
        }

        const karmaConfig = await karma.config.parseConfig(
          require('path').resolve(context.workspaceRoot, options.karmaConfig),
          karmaOptions,
          { promiseConfig: true, throwErrors: true }
        );

        const server = new karma.Server(
          karmaConfig as never,
          (exitCode: number) => {
            if (!closed) {
              observer.next({ success: exitCode === 0 });
              observer.complete();
            }
          }
        );
        karmaServer = server as unknown as { stop(): Promise<void> };
        await server.start();
      } catch (error) {
        context.logger.error(String((error as Error)?.message ?? error));
        if (!closed) {
          observer.next({ success: false });
          observer.complete();
        }
      }
    })();

    return () => {
      closed = true;
      void karmaServer?.stop();
    };
  });
}

export default createBuilder(
  runKarmaViteBuilder as unknown as (
    options: KarmaViteBuilderOptions,
    context: BuilderContext
  ) => Observable<BuilderOutput>
);
