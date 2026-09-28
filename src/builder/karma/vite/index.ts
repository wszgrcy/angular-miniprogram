import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { createBuilder } from '@angular-devkit/architect';
import type { AssetPattern } from '@angular-devkit/build-angular';
import { getSystemPath } from '@angular-devkit/core';
import * as path from 'path';
import { Observable } from 'rxjs';
import type { InlineConfig } from 'vite';
import {
  clearLibraryMetaMisses,
  formatLibraryMetaSummary,
} from '../../library/library-meta-diagnostics';
import { LibraryTemplateScopeService } from '../../shared/library-template-scope.service';
import {
  buildPlatformDefine,
  buildViteAlias,
  getBuildPlatform,
} from '../../vite';
import {
  generateEntryPatterns,
  resolveProjectRoots,
  toRollupInput,
} from '../../vite/entry-patterns';
import { platformConditionDefine } from '../../vite/platform-flags';
import { miniProgramComponentTransformPlugin } from '../../vite/plugins/component-transform.plugin';
import { libraryTemplatePlugin } from '../../vite/plugins/library-template.plugin';
import { miniProgramAssetsPlugin } from '../../vite/plugins/mini-program-assets.plugin';
import { platformFileResolvePlugin } from '../../vite/plugins/platform-file-resolve.plugin';
import { requireContextShimPlugin } from '../../vite/plugins/require-context-shim.plugin';
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
  /**
   * 小程序里回连 karma 服务的宿主地址，默认 127.0.0.1。
   *
   * 微信模拟器里 `localhost` 常常解不了（DNS 不走系统解析），
   * 写 localhost 的表现是客户端一直连不上、karma 卡在
   * "Starting browser miniprogram" 直到超时。
   * 真机调试时要改成开发机的局域网 IP。
   */
  clientHost?: string;
  /** spec 文件 glob */
  include?: string[];
  /** spec 文件排除 glob */
  exclude?: string[];
  /** karma 引导入口（test.ts），import karma client 并调 startupTest() */
  main?: string;
  /**
   * 强制单例的包，直接透传给 Vite 的 `resolve.dedupe`。
   *
   * 默认空。只有 `file:` / `npm link` 接入本库时才需要：link 的
   * 那份副本自带 node_modules，里面还有一份 @angular/core，不去重
   * 就会被打成两份，运行时表现为 `No provider for xxx`。
   */
  dedupe?: string[];
}

/**
 * 组装测试构建的 Vite 配置。
 *
 * 和 application-vite 基本一样，差别在 define：
 *   - 测试链路要额外把 jasmine 全局（describe/it/expect/spyOn…）
 *     映射到小程序运行时全局
 *   - 还要注入 KARMA_PORT / KARMA_CLIENT_CONFIG 给 karma client
 */
/**
 * 测试产物目录。
 *
 * 没给 `outputPath` 时落到 `dist/karma/<project>`，**绝不能**落到裸 `dist`：
 * 那里通常是应用 / library 的产物目录（本模板里 `dist/first` 就是
 * 应用编译要用的），而 vite 的 `emptyOutDir: true` 会把它整个清掉，
 * 表现是「跑一次测试，应用就编不出来了」。
 */
function resolveKarmaOutputPath(
  karmaOptions: KarmaViteBuilderOptions,
  context: BuilderContext,
): string {
  const fallback = path.join(
    'dist',
    'karma',
    context.target?.project || 'project',
  );
  return path.resolve(
    context.workspaceRoot,
    karmaOptions.outputPath || fallback,
  );
}

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
  //
  // cwd 取**当前项目的 sourceRoot**，不是写死的 <workspaceRoot>/src：
  // library 工程的 spec 在 projects/xxx/src 下，写死 src 会一个都找不到，
  // 表现是「测试绿着跑完但一条用例都没执行」。
  const { absoluteProjectRoot, absoluteProjectSourceRoot } =
    await resolveProjectRoots({
      workspaceRoot: context.workspaceRoot,
      context,
    });
  // `ng test` 会给 `--include` 填个空数组（不是 undefined），
  // `?? 默认值` 根本不会生效，结果是「0 个 spec、全绿」。
  // 空数组一律当「没传」处理。
  const specInclude = karmaOptions.include?.length
    ? karmaOptions.include
    : ['**/*.spec.ts', '**/*.test.ts'];
  const specFiles = await globSpecFiles({
    cwd: getSystemPath(absoluteProjectSourceRoot),
    include: specInclude,
    exclude: karmaOptions.exclude ?? [],
  });
  context.logger.info(
    `karma: 在 ${getSystemPath(absoluteProjectSourceRoot)} 发现 ${
      specFiles.length
    } 个 spec：${specFiles.map((f) => f.rel).join(', ') || '(无)'}`,
  );

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
      ...platformConditionDefine(karmaOptions.platform),
      ...jasmineGlobalDefine(buildPlatform),
      ...karmaClientDefine({
        clientConfig: karmaOptions.client ?? { captureConsole: true },
        port: karmaOptions.port ?? 9876,
        host: karmaOptions.clientHost ?? '127.0.0.1',
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
          context.workspaceRoot,
        ),
      ],
      // 单例包由消费者在 angular.json 里显式声明（`dedupe` 选项），
      // 默认空。link 接入时才需要。
      dedupe: karmaOptions.dedupe ?? [],
    },
    plugins: [
      platformFileResolvePlugin({ platform: karmaOptions.platform }),
      // webpack 专有的 require.context 要换成同步 require 映射，否则
      // test.ts 顶层直接报 TypeError，startupTest() 永远轮不到执行。
      // 清单直接复用上面 globSpecFiles 的结果，与 entry 保持同一真相。
      requireContextShimPlugin(
        specFiles.map((f) => ({
          // webpack 的 context key 是相对 context dir 的，带扩展名
          key: `./${f.rel}.ts`,
          // 上面 entry 用的 key 是 specs/<rel>，产物就是 specs/<rel>.js
          file: `specs/${f.rel}.js`,
        })),
      ),
      ...angular({
        tsconfig: derivedTs.path,
        workspaceRoot: context.workspaceRoot,
        fastCompile: false,
        experimental: { useAngularCompilationAPI: true },
      }),
      libraryTemplatePlugin({ buildPlatform, templateScope }),
      miniProgramComponentTransformPlugin(),
      // 小程序不是只有 JS：wxml / wxss / json / app.js / app.wxss 全部由
      // 这个插件产出。之前 karma 链路没挂它，产出的测试工程只有 .js，
      // 开发者工具打开后根本跑不起来（没页面、没 app.js）。
      miniProgramAssetsPlugin({
        tsConfig: karmaOptions.tsConfig,
        workspaceRoot: context.workspaceRoot,
        buildPlatform,
        entryPatterns: allEntries,
        context,
        watch: !!karmaOptions.watch,
        templateScope,
        assets: karmaOptions.assets,
        styles: karmaOptions.styles,
        absoluteProjectRoot,
        absoluteProjectSourceRoot,
        // 测试链路的 app 引导入口叫 test.js，不是 main.js
        bootstrapChunk: 'test.js',
      }),
    ],
    build: {
      outDir: resolveKarmaOutputPath(karmaOptions, context),
      emptyOutDir: true,
      sourcemap: !!karmaOptions.sourceMap,
      minify: false,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          // 全局 polyfill 入口，必须排在 require 列表最前面，
          // 保证 AbortController 等在任何业务 chunk 之前装好
          // （与 application 链路一致，详见 vite/index.ts）。
          polyfills: path.resolve(
            __dirname,
            '../../platform/template/polyfill-entry.js',
          ),
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
          // 小程序运行时只认 CommonJS。不显式声明的话 Vite 默认出 ESM，
          // 产物里全是 `import ...`，开发者工具直接加载不了。
          format: 'cjs',
          exports: 'auto',
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
  context: BuilderContext,
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

        clearLibraryMetaMisses();
        await vite.build(config);
        // 与 application-vite builder 对齐：把「哪些指令没拿到库元数据」报出来
        const metaSummary = formatLibraryMetaSummary();
        if (metaSummary) {
          context.logger.warn(`[library-meta] ${metaSummary}`);
        }

        const karma = await import('karma');
        const karmaOptions: Record<string, unknown> = {
          singleRun: options.watch ? false : true,
        };
        /**
         * 把端口作为 override 传下去，让 server 绑的端口和编译期 define
         * 进产物的 `KARMA_PORT` 是**同一个来源**。
         *
         * 不传的话，server 用的是 karma.conf.js 里的 `port`，而产物用的是
         * `karmaOptions.port ?? 9876`——两个独立源头。现在两边都是 9876 只是
         * 碰巧（schema 里原本连 `port` 字段都没有），一旦谁改了就不一致：
         * 产物去连 9911、server 还在 9876，表现为客户端永远连不上。
         *
         * `karma.config.parseConfig(file, cliOptions, ...)` 的第二参就是用来
         * 覆盖配置文件里的值的，优先级高于 karma.conf.js。
         */
        if (options.port) {
          karmaOptions.port = options.port;
        }
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
          { promiseConfig: true, throwErrors: true },
        );

        const server = new karma.Server(
          karmaConfig as never,
          (exitCode: number) => {
            if (!closed) {
              observer.next({ success: exitCode === 0 });
              observer.complete();
            }
          },
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
    context: BuilderContext,
  ) => Observable<BuilderOutput>,
);
