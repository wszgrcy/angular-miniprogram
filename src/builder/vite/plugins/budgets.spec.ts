import { BudgetType } from '@angular/build/private';
import type { OutputBundle } from 'rollup';
import { budgetsPlugin, collectBudgetStats } from './budgets.plugin';

function fakeBundle(): OutputBundle {
  return {
    'main.js': {
      type: 'chunk',
      fileName: 'main.js',
      name: 'main',
      code: 'a'.repeat(3000),
      isEntry: true,
    },
    'pages/index/index-entry.js': {
      type: 'chunk',
      fileName: 'pages/index/index-entry.js',
      name: 'pages/index/index-entry',
      code: 'b'.repeat(1500),
      isEntry: true,
    },
    'shared-abc.js': {
      type: 'chunk',
      fileName: 'shared-abc.js',
      name: 'shared',
      code: 'c'.repeat(900),
      isEntry: false,
    },
    'app.wxss': {
      type: 'asset',
      fileName: 'app.wxss',
      name: 'app.wxss',
      source: '.a{}',
    },
  } as unknown as OutputBundle;
}

/** 只用到 generateBundle + this.emitFile，插件上下文按用到的形状桩掉。 */
async function generateBundle(
  options: Parameters<typeof budgetsPlugin>[0],
  bundle = fakeBundle(),
): Promise<{ emitted: { fileName: string; source: string }[] }> {
  const emitted: { fileName: string; source: string }[] = [];
  const plugin = budgetsPlugin(options) as unknown as {
    generateBundle(
      this: { emitFile(file: { fileName: string; source: string }): void },
      outputOptions: unknown,
      bundle: OutputBundle,
    ): Promise<void>;
  };
  await plugin.generateBundle.call(
    { emitFile: (file) => emitted.push(file) },
    {},
    bundle,
  );
  return { emitted };
}

function collectingLogger(): { logger: never; warnings: string[] } {
  const warnings: string[] = [];
  return {
    warnings,
    logger: { warn: (message: string) => warnings.push(message) } as never,
  };
}

describe('collectBudgetStats', () => {
  it('每个产物都进 assets，chunk 用文件名指回去（缺一个就报 Could not find asset）', () => {
    const stats = collectBudgetStats(fakeBundle());
    expect(stats.assets?.map((a) => a.name)).toEqual([
      'main.js',
      'pages/index/index-entry.js',
      'shared-abc.js',
      'app.wxss',
    ]);
    expect(stats.assets?.[0].size).toBe(3000);
    // 资源是字符串，按 utf8 字节数算
    expect(stats.assets?.[3].size).toBe(4);
    // 非入口 chunk 不算 initial
    expect(stats.chunks?.map((c) => c.initial)).toEqual([true, true, false]);
  });
});

describe('budgetsPlugin', () => {
  it('超 error 阈值直接让构建失败', async () => {
    await expect(
      generateBundle({
        budgets: [{ type: BudgetType.Any, maximumError: '2kb' }],
        logger: collectingLogger().logger,
      }),
    ).rejects.toThrow(/budgets/);
  });

  it('warning 阈值只告警不失败', async () => {
    const { logger, warnings } = collectingLogger();
    await generateBundle({
      budgets: [{ type: BudgetType.Any, maximumWarning: '2kb' }],
      logger,
    });
    expect(warnings.join('\n')).toContain('exceeded maximum budget');
  });

  it('没超就一声不吭', async () => {
    const { logger, warnings } = collectingLogger();
    await generateBundle({
      budgets: [{ type: BudgetType.Any, maximumError: '1mb' }],
      logger,
    });
    expect(warnings).toEqual([]);
  });

  it('statsJson 产出 stats.json，且它自己不参与体积核算', async () => {
    const { emitted } = await generateBundle({
      statsJson: true,
      logger: collectingLogger().logger,
    });
    expect(emitted.map((e) => e.fileName)).toEqual(['stats.json']);
    const stats = JSON.parse(emitted[0].source);
    expect(stats.assets.length).toBe(4);
    expect(stats.assets.some((a: { name: string }) => a.name === 'stats.json')).toBe(
      false,
    );
  });
});
