import type { BuilderContext } from '@angular-devkit/architect';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';
import { execute } from '../src/builder/library/builder';
import {
  APP_ROOT,
  INSTALLED_LIBRARY,
  LIBRARY_BUILD_OPTIONS,
  LIBRARY_OUTPUT,
  LIBRARY_PROJECT_NAME,
} from './library-fixture';

/**
 * worker 起跑前的一次性准备。
 *
 * ## 为什么要有这个文件
 *
 * `library-meta-sidecar.spec.ts` / `library-multiplatform.spec.ts` 构建 app 时
 * 要消费 `node_modules/test-library`。这份产物以前由
 * `library/library.spec.ts` 构建完顺手拷进模板目录，于是三个文件之间有了隐式
 * 先后依赖，整套测试只能单进程串行。挪到这里之后文件之间不再有先后关系，
 * spec 才能并发。
 *
 * ## 走的是真正的 builder，不是 ng-packagr
 *
 * 这里调的是出厂的 `angular-miniprogram:library` builder（`execute`），
 * 不是底层的 `ngPackagrFactory`。architect harness 本来也是直接调 `execute`
 * （`BuilderHarness` 里 `this.builderHandler(data, context)`，并没有经过
 * `createBuilder`），所以这条路径就是被测路径本身 —— 构建只跑一次，
 * 同时还是 `library.spec.ts` 断言的那份制品。
 *
 * 构建失败直接抛，带 ng-packagr 的原始错误：夹具都没出来，跑下去全是
 * 无意义的连带失败，不如在这里停住。
 */

/**
 * `execute()` 只读 `workspaceRoot` / `target.project` / `getProjectMetadata`
 * 这三样，其余成员用不上，整体 cast 过去。
 *
 * `cli.cache.enabled: false` 与 harness 的 `DEFAULT_PROJECT_METADATA` 对齐：
 * 不让 ng-packagr 往模板目录里写 `.angular/cache`（既没被 gitignore，
 * 又会把上一轮的编译缓存留给下一次运行）。
 */
const context = {
  workspaceRoot: APP_ROOT,
  currentDirectory: APP_ROOT,
  target: { project: LIBRARY_PROJECT_NAME, target: 'build' },
  getProjectMetadata: async () => ({
    root: 'projects/test-library',
    sourceRoot: 'projects/test-library/src',
    cli: { cache: { enabled: false } },
  }),
} as unknown as BuilderContext;

export default async function setup(): Promise<void> {
  // 构建去重缓存只在单次运行内有效，上一轮残留直接抹掉。
  // 必须在 worker 起跑前做：放到 worker 里抹就会删掉别的 worker 正在读写的那份。
  fs.rmSync(path.resolve(__dirname, '.shared-build'), {
    recursive: true,
    force: true,
  });

  const output = await lastValueFrom(
    execute({ ...LIBRARY_BUILD_OPTIONS }, context),
  );
  if (!output.success) {
    const error = (output as { error?: string }).error;
    throw new Error(
      `[globalSetup] test-library 构建失败，后续所有读库产物的 spec 都会连带失败：${
        error ?? 'builder 未给出原因'
      }`,
    );
  }

  fs.rmSync(INSTALLED_LIBRARY, { recursive: true, force: true });
  fs.mkdirSync(INSTALLED_LIBRARY, { recursive: true });
  fs.cpSync(LIBRARY_OUTPUT, INSTALLED_LIBRARY, { recursive: true });
}
