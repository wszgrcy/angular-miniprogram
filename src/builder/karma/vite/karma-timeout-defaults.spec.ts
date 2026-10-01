/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * karma 超时的「谁优先」。
 *
 * `captureTimeout` / `browserNoActivityTimeout` 是 karma 的原生配置，
 * **karma.conf.js 说了算**；库只在它没设时，对**已解析**的配置就地补
 * 兜底值，不往 angular.json 里镜像 karma 的选项。
 */
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { applyKarmaTimeoutFallbacks } from './index';

const FALLBACK_CAPTURE = 30_000;
const FALLBACK_NO_ACTIVITY = 180_000;
// karma 自带默认，是「没设」的判定基准
const KARMA_DEFAULT_CAPTURE = 60_000;
const KARMA_DEFAULT_NO_ACTIVITY = 30_000;

describe('applyKarmaTimeoutFallbacks（对已解析的 config 就地补）', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-karma-timeout-'));
  });

  afterEach(() => fs.removeSync(tmp));

  /** 走真实 parseConfig，返回解析结果（未补兜底） */
  async function parse(body: string) {
    const file = path.join(tmp, 'karma.conf.js');
    fs.writeFileSync(file, `module.exports = (config) => {\n${body}\n};\n`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const karma = require('karma');
    return karma.config.parseConfig(
      file,
      {},
      {
        promiseConfig: true,
        throwErrors: true,
      },
    );
  }

  async function parseAndFallback(body: string) {
    const cfg = await parse(body);
    applyKarmaTimeoutFallbacks(cfg);
    return {
      capture: cfg.captureTimeout as number,
      noActivity: cfg.browserNoActivityTimeout as number,
    };
  }

  it('基准：不补就是 karma 自带默认', async () => {
    const cfg = await parse('  config.set({ port: 9876 });');
    expect(cfg.captureTimeout).toBe(KARMA_DEFAULT_CAPTURE);
    expect(cfg.browserNoActivityTimeout).toBe(KARMA_DEFAULT_NO_ACTIVITY);
  });

  it('conf 没设 → 补上库兜底值', async () => {
    const r = await parseAndFallback('  config.set({ port: 9876 });');
    expect(r.capture).toBe(FALLBACK_CAPTURE);
    expect(r.noActivity).toBe(FALLBACK_NO_ACTIVITY);
  });

  it('conf 设了 → 原样不动，以 conf 为准', async () => {
    const r = await parseAndFallback(
      '  config.set({ captureTimeout: 45000, browserNoActivityTimeout: 240000 });',
    );
    expect(r.capture).toBe(45_000);
    expect(r.noActivity).toBe(240_000);
  });

  it('只设一个 → 那个不动，另一个补兜底', async () => {
    const r = await parseAndFallback(
      '  config.set({ captureTimeout: 12345 });',
    );
    expect(r.capture).toBe(12_345);
    expect(r.noActivity).toBe(FALLBACK_NO_ACTIVITY);
  });

  it('直写风格 config.x = 也算设过', async () => {
    const r = await parseAndFallback('  config.captureTimeout = 7777;');
    expect(r.capture).toBe(7_777);
    expect(r.noActivity).toBe(FALLBACK_NO_ACTIVITY);
  });

  it('只动这两个字段，别的不碰', async () => {
    const cfg = await parse(
      '  config.set({ port: 9999, reporters: ["dots"], colors: false });',
    );
    applyKarmaTimeoutFallbacks(cfg);
    expect(cfg.port).toBe(9_999);
    expect(cfg.reporters).toEqual(['dots']);
    expect(cfg.colors).toBeFalse();
  });

  it('重复调用是幂等的（已补过不会再改）', async () => {
    const cfg = await parse('  config.set({ port: 9876 });');
    applyKarmaTimeoutFallbacks(cfg);
    const first = cfg.captureTimeout;
    applyKarmaTimeoutFallbacks(cfg);
    expect(cfg.captureTimeout).toBe(first);
    expect(first).toBe(FALLBACK_CAPTURE);
  });
});
