/**
 * 从小程序的配置形状（valibot）生成 JSON Schema。
 *
 * 形状只写一份（src/builder/vite/config-schema.ts），构建期校验与编辑器补全
 * 用的是同一个来源。生成物落在 `src/builder/schemas/`——那个目录会被
 * `copy:assets` 整体拷进发布包，用户装完就能在 node_modules 里指给编辑器。
 *
 * 用法：npm run gen:config-schema
 */
import { toJsonSchema } from '@valibot/to-json-schema';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  mpAppConfigSchema,
  mpProjectConfigSchema,
} from '../src/builder/vite/config-schema';

const outDir = path.resolve(__dirname, '../src/builder/schemas');
const checkOnly = process.argv.includes('--check');

const targets = [
  {
    file: 'app-config.schema.json',
    schema: mpAppConfigSchema,
    title: '小程序 app 配置（app.json）',
  },
  {
    file: 'project-config.schema.json',
    schema: mpProjectConfigSchema,
    title: '小程序 project 配置（project.config.json）',
  },
];

fs.mkdirSync(outDir, { recursive: true });
let stale = false;

for (const target of targets) {
  const json = toJsonSchema(target.schema, {
    target: 'draft-7',
    errorMode: 'warn',
  }) as Record<string, unknown>;
  const text =
    JSON.stringify(
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: target.title,
        ...json,
      },
      null,
      2,
    ) + '\n';
  const file = path.join(outDir, target.file);
  if (checkOnly) {
    const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '';
    if (existing !== text) {
      stale = true;
      console.error(
        `src/builder/schemas/${target.file} 与形状不一致，请运行 npm run gen:config-schema`,
      );
    }
    continue;
  }
  fs.writeFileSync(file, text);
  console.log(`生成 src/builder/schemas/${target.file} (${text.length} bytes)`);
}

if (stale) {
  process.exit(1);
}
