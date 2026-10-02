#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * 微信小程序里跑 vitest 的一键执行器。
 *
 * 连接方向是**设备主动连出**：小程序端 `wx.connectSocket` 连到宿主的 WS 端口
 * （见 src/builder/vitest/runtime/transport.ts），宿主只负责监听。
 * 所以不需要自动化端口、不需要 launcher，把项目打开就够了。
 *
 * 流程：
 *   1. 保证 node_modules/angular-miniprogram 链到 dist
 *   2. ng run app:test  把 spec 编进小程序产物
 *   3. 后台起 vitest（它内部起 WS server），等它打印监听就绪
 *   4. 用开发者工具打开产物目录，设备连回来开始跑
 *   5. 透传 vitest 的输出与退出码
 *
 * 用法：
 *   node script/wechat-vitest.cjs \
 *     --project <测试工程目录> --dist <产物目录> \
 *     [--config vitest.config.mts] [--target app:test] \
 *     [--port 17900] [--cli <cli.bat>] [--timeout 180] [--skip-build]
 */

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const out = {
    port: 17900,
    timeout: 300,
    cli: process.env.WX_DEVTOOLS_CLI || '',
    config: 'vitest.config.mts',
    target: 'app:test',
    skipBuild: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--project':
        out.project = next();
        break;
      case '--dist':
        out.dist = next();
        break;
      case '--config':
        out.config = next();
        break;
      case '--target':
        out.target = next();
        break;
      case '--port':
        out.port = Number(next());
        break;
      case '--cli':
        out.cli = next();
        break;
      case '--timeout':
        out.timeout = Number(next());
        break;
      case '--skip-build':
        out.skipBuild = true;
        break;
      case '-h':
      case '--help':
        out.help = true;
        break;
      default:
        throw new Error(`未知参数: ${a}`);
    }
  }
  if (!out.cli && !out.help) out.cli = defaultCliPath();
  return out;
}

function defaultCliPath() {
  const win = 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat';
  if (fs.existsSync(win)) return win;
  const mac = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
  if (fs.existsSync(mac)) return mac;
  throw new Error(
    '找不到微信开发者工具 CLI，请用 --cli 或环境变量 WX_DEVTOOLS_CLI 指定',
  );
}

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host: '127.0.0.1' });
    sock.setTimeout(500);
    sock.once('connect', () => {
      sock.destroy();
      resolve(true);
    });
    sock.once('timeout', () => {
      sock.destroy();
      resolve(false);
    });
    sock.once('error', () => resolve(false));
  });
}

function cliRun(opt, actionArgs) {
  const cmd = [`"${opt.cli}"`, '--lang', 'zh', ...actionArgs].join(' ');
  try {
    const r = spawnSync(cmd, {
      encoding: 'utf8',
      timeout: 90_000,
      shell: true,
    });
    return String(r.stdout || '') + String(r.stderr || '');
  } catch (e) {
    return '';
  }
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    p.on('error', reject);
    p.on('exit', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (opt.help || !opt.project || !opt.dist) {
    console.log(
      [
        '用法: node script/wechat-vitest.cjs \\',
        '  --project <测试工程目录> \\',
        '  --dist <测试产物目录> \\',
        '  [--config vitest.config.mts] [--target app:test] \\',
        '  [--port 17900] [--cli <开发者工具 cli 路径>] [--timeout 300] \\',
        '  [--skip-build]   产物已是最新时跳过 ng run',
        '',
        '前提：开发者工具已启动且登录（CLI 拉不起登录态），服务端口已开启。',
        '设备端是主动连出 ws://127.0.0.1:<port>，不需要自动化端口。',
      ].join('\n'),
    );
    process.exit(opt.help ? 0 : 2);
  }

  const projectDir = path.resolve(opt.project);
  const distDir = path.resolve(opt.dist);
  if (!fs.existsSync(projectDir))
    throw new Error(`项目目录不存在: ${projectDir}`);

  // builder 是按包名 angular-miniprogram:vitest 解析的，没链上直接起不来
  spawnSync(process.execPath, [path.join(__dirname, 'link-self.cjs')], {
    stdio: 'inherit',
  });

  if (opt.skipBuild) {
    console.log('[vitest] --skip-build，跳过构建');
  } else {
    console.log(`[vitest] ng run ${opt.target}（cwd=${projectDir}）`);
    const code = await run('npx', ['ng', 'run', opt.target], projectDir);
    if (code !== 0) throw new Error(`构建失败，退出码 ${code}`);
  }
  if (!fs.existsSync(path.join(distDir, 'app.json'))) {
    throw new Error(
      `${distDir} 下没有 app.json —— 构建没产出，看上面 ng run 的报错`,
    );
  }

  if (await portInUse(opt.port)) {
    throw new Error(
      `端口 ${opt.port} 已被占用。多半是上一轮 vitest 没退干净；` +
        '关掉它，或换个 --port（注意 angular.json 里 test-vitest.options.port 要一起改）。',
    );
  }

  console.log(`[vitest] 起 vitest run（cwd=${projectDir}）`);
  const vitest = spawn('npx', ['vitest', 'run', '--config', opt.config], {
    cwd: projectDir,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  // 必须等 WS 真的监听上再开项目：设备是连出的一方，宿主没绑上端口时
  // connectSocket 直接失败，表现是「打开了但零推进」。
  let log = '';
  const ready = new Promise((resolve, reject) => {
    const onData = (buf) => {
      const s = buf.toString();
      log += s;
      process.stdout.write(s);
      if (log.includes('等设备连入')) resolve();
    };
    vitest.stdout.on('data', onData);
    vitest.stderr.on('data', onData);
    vitest.once('exit', (code) =>
      reject(new Error(`vitest 提前退出，code=${code}\n${log.slice(-2000)}`)),
    );
    setTimeout(
      () => reject(new Error(`等 WS 监听超时\n${log.slice(-2000)}`)),
      60_000,
    );
  });

  try {
    await ready;
  } catch (e) {
    vitest.kill('SIGKILL');
    throw e;
  }

  console.log(`[devtools] open --project ${distDir}`);
  const opened = cliRun(opt, ['open', '--project', `"${distDir}"`]);
  if (opened.trim()) console.log(opened.trim());

  console.log(
    `[vitest] 等设备连入 ws://127.0.0.1:${opt.port}（${opt.timeout}s 内）`,
  );
  const exitPromise = new Promise((resolve) =>
    vitest.once('exit', (code) => resolve(code ?? 1)),
  );
  const watchdog = sleep(opt.timeout * 1000).then(() => 'timeout');
  const result = await Promise.race([exitPromise, watchdog]);
  if (result === 'timeout') {
    vitest.kill('SIGKILL');
    throw new Error(
      `${opt.timeout}s 内没跑完。常见原因：开发者工具没打开该目录 / ` +
        '设备连不上宿主（urlCheck 要关）/ 产物里的 MP_VITEST_PORT 和 --port 不一致。',
    );
  }
  process.exit(result);
}

main().catch((e) => {
  console.error(`[wechat-vitest] 失败: ${e && e.message}`);
  process.exit(1);
});
