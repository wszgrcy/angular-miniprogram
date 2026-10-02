#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * 把 dist 以包名链进 node_modules。
 *
 * 测试工程里两处按**包名**解析本仓库：
 *   - angular.json 的 builder：`angular-miniprogram:karma` / `:application` / `:vitest`
 *   - karma.conf.js 的 `require('angular-miniprogram/karma/plugin')`
 * 这要求 `angular-miniprogram` 能当包名解析到，而仓库根并没有被自链接进
 * node_modules（没有 workspaces，也没有 file: 自引用），所以干净环境里
 * `ng run app:test` 必然报 `Could not find the 'angular-miniprogram:karma'
 * builder's node package`。
 *
 * 链接指向 **dist** 而不是仓库根：发布产物的根就是 dist（dist/package.json
 * 里 name 就是 angular-miniprogram，`builders` 和 exports 映射也在那）。
 * 指仓库根的话根 package.json 没有 exports，`angular-miniprogram/karma/plugin`
 * 这类子路径一个都解析不到。
 *
 * Windows 上用 junction，普通权限就能建。
 */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const dist = path.join(repoRoot, 'dist');
const distPkg = path.join(dist, 'package.json');
const link = path.join(repoRoot, 'node_modules', 'angular-miniprogram');

function main() {
  if (!fs.existsSync(distPkg)) {
    console.log(
      '[link-self] dist/package.json 不存在，跳过（先跑 npm run build）',
    );
    return;
  }
  if (!fs.existsSync(path.join(repoRoot, 'node_modules'))) {
    console.log('[link-self] node_modules 不存在，跳过（先跑 npm i）');
    return;
  }

  let st = null;
  try {
    st = fs.lstatSync(link);
  } catch {
    /* 还没建 */
  }
  if (st) {
    const real = fs.realpathSync(link);
    if (real === fs.realpathSync(dist)) {
      console.log(
        '[link-self] 已就绪：node_modules/angular-miniprogram -> ../dist',
      );
      return;
    }
    // 指错了地方（比如手写过指仓库根）——留着只会让子路径解析继续失败，删掉重建。
    fs.rmSync(link, { recursive: true, force: true });
  }

  fs.symlinkSync(dist, link, 'junction');
  console.log('[link-self] 建好：node_modules/angular-miniprogram -> ../dist');
}

try {
  main();
} catch (e) {
  console.error(`[link-self] 失败: ${e && e.message}`);
  process.exit(1);
}
