import { buildSchema } from '../../script/build-cli-schema';

const BUILDERS = ['application', 'library', 'vitest'];

interface TargetBranch {
  $comment?: string;
  properties?: {
    builder?: { const?: string; not?: { enum?: string[] } };
    options?: { $ref?: string };
    configurations?: { additionalProperties?: { $ref?: string } };
  };
}

function definitionName(builder: string) {
  return (
    'AngularMiniprogramBuilders' +
    builder.charAt(0).toUpperCase() +
    builder.slice(1) +
    'Schema'
  );
}

/**
 * 发布包里的 `lib/config/schema.json` 由 script/build-cli-schema.ts 生成：基底直读
 * `@angular/cli/lib/config/schema.json`，再挂上本包三个 builder。这里钉死「结构没被改坏」——
 * 尤其是 target.oneOf 与兜底分支的互斥关系，一旦漏改 not.enum，oneOf 会同时命中两条导致校验失败。
 */
describe('cli workspace schema：本包 builder 注入', () => {
  const schema = buildSchema();
  const target = schema.definitions.project.definitions.target;
  const branches: TargetBranch[] = target.oneOf;

  it('改写 $id / title，避免与 @angular/cli 的 $id 冲突', () => {
    expect(schema.$id).toBe('angular-miniprogram://config/schema.json');
    expect(schema.title).toContain('MiniProgram');
  });

  for (const builder of BUILDERS) {
    const id = `angular-miniprogram:${builder}`;
    const definition = definitionName(builder);

    it(`${id} 有独立的 target 分支`, () => {
      const branch = branches.find(
        (item) => item?.properties?.builder?.const === id,
      );
      expect(branch).toBeTruthy();
      expect(branch.properties.options.$ref).toBe(
        `#/definitions/${definition}`,
      );
      expect(branch.properties.configurations.additionalProperties.$ref).toBe(
        `#/definitions/${definition}`,
      );
    });

    it(`${id} 的定义已内联且改写了指向自身 definitions 的 $ref`, () => {
      const inlined = schema.definitions[definition];
      expect(inlined).toBeTruthy();
      expect(inlined.$schema).toBeUndefined();
      expect(inlined.required).toBeUndefined();
      const json = JSON.stringify(inlined);
      // 内联后所有内部 $ref 必须命名空间化到自身 definitions 下，否则多个 builder 的同名 definition 会串在一起
      expect(json).not.toMatch(/"#\/definitions\/(?!AngularMiniprogram)/);
      for (const local of Object.keys(inlined.definitions ?? {})) {
        expect(json).toContain(
          `"#/definitions/${definition}/definitions/${local}"`,
        );
      }
    });

    it(`${id} 被 custom builder 兜底分支排除，避免 oneOf 命中两条`, () => {
      const generic = branches.find((item) =>
        String(item?.$comment ?? '').startsWith(
          'Extendable target with custom builder',
        ),
      );
      expect(generic.properties.builder.not.enum).toContain(id);
    });
  }

  it('本包 builder 的 options 属性来自各自的 schema.json', () => {
    const app = schema.definitions[definitionName('application')];
    for (const key of ['outputPath', 'main', 'tsConfig', 'platform']) {
      expect(app.properties[key]).toBeTruthy();
    }
    const library = schema.definitions[definitionName('library')];
    expect(library.properties.project).toBeTruthy();
    const vitest = schema.definitions[definitionName('vitest')];
    for (const key of ['main', 'tsConfig', 'outputPath', 'port']) {
      expect(vitest.properties[key]).toBeTruthy();
    }
  });
});
