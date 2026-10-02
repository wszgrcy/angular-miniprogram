import * as fs from 'fs';
import * as path from 'path';

/**
 * 本仓库的类型环境里 `require` 被收窄成了不带 `resolve` / `main` 的形状，
 * 只有 `NodeRequire` 是全量，这里显式取一次。
 */
const nodeRequire = require as unknown as NodeRequire;

/**
 * 拼装发布用的 `dist/lib/config/schema.json`。
 *
 * 基底直接读 devDependencies 里的 `@angular/cli/lib/config/schema.json`
 * （已发布的成品，含 CLI 全部 builder 定义），把本包三个 builder 以 CLI
 * 同款结构（target.oneOf 分支 + 顶层 definitions）注入进去，让 `angular.json`
 * 的 `$schema` 指向本包时也能拿到补全 / 校验。
 *
 * 基底不入库、不缓存：@angular/cli 版本由 package.json 钉住，
 * 升 CLI 时改依赖版本即可，产物自动跟着走。
 */

const PACKAGE_NAME = 'angular-miniprogram';

const BUILDERS: { name: string; schema: string }[] = [
  { name: 'application', schema: '../src/builder/vite/schema.json' },
  { name: 'library', schema: '../src/builder/library/schema.json' },
  { name: 'vitest', schema: '../src/builder/vitest/vite/schema.json' },
];

// 与 CLI 生成器一致：内联进 workspace schema 时丢弃这些键，
// 否则编辑 angular.json 时会被 builder 的必填项卡住。
const STRIP_KEYS = new Set([
  '$schema',
  '$id',
  'id',
  'required',
  'x-prompt',
  'x-user-analytics',
]);

const DEFAULT_CONFIG_DESCRIPTION =
  'A default named configuration to use when a target configuration is not provided.';

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function definitionKey(builderName: string) {
  return (
    PACKAGE_NAME.split(/[-_]/).map(capitalize).join('') +
    'Builders' +
    capitalize(builderName) +
    'Schema'
  );
}

function inlineSchema(value: any, key: string): any {
  if (Array.isArray(value)) {
    return value.map((item) => inlineSchema(item, key));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const result: Record<string, any> = {};
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (STRIP_KEYS.has(entryKey)) {
      continue;
    }
    if (entryKey === '$ref' && typeof entryValue === 'string') {
      result[entryKey] = entryValue.startsWith('#/definitions/')
        ? entryValue.replace(
            '#/definitions/',
            `#/definitions/${key}/definitions/`,
          )
        : entryValue;
      continue;
    }
    result[entryKey] = inlineSchema(entryValue, key);
  }
  return result;
}

function targetBranch(builderId: string, ref: string) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      builder: { const: builderId },
      defaultConfiguration: {
        type: 'string',
        description: DEFAULT_CONFIG_DESCRIPTION,
      },
      options: { $ref: ref },
      configurations: {
        type: 'object',
        additionalProperties: { $ref: ref },
      },
    },
  };
}

function assertRefsResolve(schema: any) {
  const missing: string[] = [];
  const walk = (node: any) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== 'object') {
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (
        key === '$ref' &&
        typeof value === 'string' &&
        value.startsWith('#/')
      ) {
        let current: any = schema;
        for (const part of value.slice(2).split('/')) {
          current = current?.[part];
        }
        if (current === undefined) {
          missing.push(value);
        }
      } else {
        walk(value);
      }
    }
  };
  walk(schema);
  if (missing.length) {
    throw new Error('存在无法解析的 $ref: ' + [...new Set(missing)].join(', '));
  }
}

function readBaseSchema(): any {
  let basePath: string;
  try {
    basePath = nodeRequire.resolve('@angular/cli/lib/config/schema.json');
  } catch {
    throw new Error(
      '读不到 @angular/cli/lib/config/schema.json，请确认 @angular/cli 已安装（devDependencies）',
    );
  }
  return JSON.parse(fs.readFileSync(basePath, 'utf-8'));
}

export function buildSchema(): any {
  const schema = readBaseSchema();
  const target = schema?.definitions?.project?.definitions?.target;
  if (!target || !Array.isArray(target.oneOf)) {
    throw new Error(
      '基底 schema 缺少 definitions.project.definitions.target.oneOf',
    );
  }
  const builderIds = BUILDERS.map((b) => `${PACKAGE_NAME}:${b.name}`);

  schema.$id = `${PACKAGE_NAME}://config/schema.json`;
  schema.title = 'Angular MiniProgram CLI Workspace Configuration';

  // 幂等：重跑不会重复插入分支 / 定义
  target.oneOf = target.oneOf.filter(
    (branch: any) => !builderIds.includes(branch?.properties?.builder?.const),
  );

  const generic = target.oneOf.find((branch: any) =>
    String(branch?.$comment ?? '').startsWith(
      'Extendable target with custom builder',
    ),
  );
  if (!generic) {
    throw new Error('基底 schema 中找不到 custom builder 兜底分支');
  }
  const notEnum: string[] = (generic.properties.builder.not.enum ??= []);
  for (const id of builderIds) {
    // 兜底分支要排除本包 builder，否则 oneOf 会命中两条而校验失败
    if (!notEnum.includes(id)) {
      notEnum.push(id);
    }
  }

  for (const builder of BUILDERS) {
    const schemaPath = path.resolve(__dirname, builder.schema);
    const builderSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    const key = definitionKey(builder.name);
    schema.definitions[key] = inlineSchema(builderSchema, key);
    target.oneOf.push(
      targetBranch(`${PACKAGE_NAME}:${builder.name}`, `#/definitions/${key}`),
    );
  }

  assertRefsResolve(schema);

  return schema;
}

export const DEFAULT_OUTPUT = 'dist/lib/config/schema.json';

/**
 * 把 schema 登记到发布包 package.json 的 exports。
 * 在库构建之后跑，避开 ng-packagr 把 exports 子路径当二级 entry point 探测。
 */
function registerExport(outPath: string) {
  const pkgPath = path.resolve(process.cwd(), 'dist/package.json');
  if (!fs.existsSync(pkgPath)) {
    console.warn('[build:schema] 未找到 dist/package.json，跳过 exports 登记');
    return;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const rawRel = path
    .relative(path.dirname(pkgPath), outPath)
    .split(path.sep)
    .join('/');
  if (rawRel.startsWith('..')) {
    return;
  }
  const rel = './' + rawRel;
  pkg.exports ??= {};
  if (pkg.exports[rel] === undefined) {
    pkg.exports[rel] = { default: rel };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, undefined, 2));
    console.log(`[build:schema] exports 登记: ${rel}`);
  }
}

function generate(outPath = path.resolve(process.cwd(), DEFAULT_OUTPUT)) {
  const schema = buildSchema();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(schema, undefined, 2));
  registerExport(outPath);
  console.log(`[build:schema] 输出: ${outPath}`);
}

if (nodeRequire.main === module) {
  try {
    generate(process.argv[2] ? path.resolve(process.argv[2]) : undefined);
  } catch (error) {
    console.error('[build:schema] 生成失败：' + (error as Error).message);
    process.exitCode = 1;
  }
}
