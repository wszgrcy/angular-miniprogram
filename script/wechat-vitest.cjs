#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * 微信小程序里跑 vitest 的一键执行器。
 *
 * 连接方向是**设备主动连出**：小程序端 `wx.connectSocket` 连到宿主的 WS 端口
 * （见 src/builder/vitest/runtime/transport.ts），宿主只负责监听。
 * 不需要 launcher，也不需要自动化客户端；把项目打开就够了——但“打开”得
 * 用 `cli auto`，`cli open` 对游客 appid 直接报 code 10（详见下面开项目那段）。
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
 *     [--port 17900] [--cli <cli.bat>] [--auto-port 9420] \
 *     [--connect-timeout 20] [--timeout 120] [--skip-build]
 */

const { spawn, spawnSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * shell:true 下的保守加引号：路径里有空格或 shell 元字符时包双引号。
 */
function quote(value) {
  return /[\s^&|<>"']/.test(value) ? `"${value}"` : value;
}

/**
 * 「小程序真的连上了」的判定。
 *
 * 光看 vitest 开跑不行——得在开项目后第一时间拿到这个信号，否则只能拿
 * 整轮超时去赌。就认 session 打的那一行，vitest 自己的汇总行不算：
 * 「no tests」也能打出 Test Files，拿它当连上信号会把超时误报成连入。
 */
const DEVICE_CONNECTED_RE = /\[mp-vitest\] 设备已连接/;

function parseArgs(argv) {
  const out = {
    port: 17900,
    /** 自动化端口，只给 `cli auto` 用，vitest 自己不连它 */
    autoPort: 9420,
    /** 等小程序把 WS 连回来的时间——连不上就是没打开/端口不对，早断早说 */
    connectTimeout: 20,
    /** 连上之后整轮跑完的上限 */
    timeout: 120,
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
      case '--connect-timeout':
        out.connectTimeout = Number(next());
        break;
      case '--auto-port':
        out.autoPort = Number(next());
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

/**
 * 把占着某个端口的进程清掉（Windows）。
 *
 * 为什么不能只靠 child.kill()：vitest 是 `npx vitest` 套起来的，shell 包装
 * 进程死了但孙进程（真的 vitest，真的在监听 17900）还活着，下一轮就
 * 「端口被占」。必须按端口清干净。
 */
async function freePort(port) {
  if (!(await portInUse(port))) return;
  console.log(`[vitest] 端口 ${port} 被占，清理残留进程…`);
  try {
    if (process.platform === 'win32') {
      const out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
      const pids = new Set();
      for (const line of out.split('\n')) {
        if (
          line.includes('LISTENING') &&
          new RegExp(`:${port}\\s`).test(line)
        ) {
          const pid = line.trim().split(/\s+/).pop();
          if (pid && /^\d+$/.test(pid)) pids.add(pid);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        } catch {
          /* 已退出 */
        }
      }
    } else {
      const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' });
      for (const pid of out.split('\n').filter(Boolean)) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        } catch {
          /* 已退出 */
        }
      }
    }
  } catch {
    /* 探不到就交给后面的监听失败报错 */
  }
  await sleep(500);
}

/**
 * 干掉 vitest 子进程树。
 *
 * child.kill() 只杀 shell 包装层，孙进程（真的 vitest）会漏下来占端口。
 */
function killTree(child) {
  if (!child || child.killed) return;
  try {
    if (process.platform === 'win32') {
      spawnSync(`taskkill /PID ${child.pid} /T /F`, {
        encoding: 'utf8',
        shell: true,
        stdio: 'ignore',
      });
    } else {
      child.kill('SIGKILL');
    }
  } catch {
    /* 已退出 */
  }
}

/**
 * 跑一次 cli，返回 stdout+stderr（失败不抛）。
 *
 * 必须 shell:true —— Node 18+ 不能直接 exec .bat，会 EINVAL。
 * shell 模式下路径得自己加引号，否则 `C:\Program Files (x86)\...`
 * 会被拆成 `C:\Program`。
 */
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

/**
 * cli 的失败长什么样：spinner 打 `✖ 准备中`，错误走 `[error] {...}`。
 * 成功是 `✔ ...`。失败必须当场断，否则只能干等连入超时。
 */
function cliFailed(out) {
  return /\[error\]/.test(out) || /✖/.test(out);
}

/** 取 cli 输出里最能说明问题的一行（错误体优先）。 */
function cliReason(out) {
  const lines = out
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const err = lines.find((l) => /\[error\]|Error:|code:/.test(l));
  return err || lines[lines.length - 1] || '(cli 无输出)';
}

/**
 * 跑 `cli islogin`，拿不到 JSON 返回 null（工具没起 / 服务端口没开）。
 */
function cliLogin(opt) {
  const out = cliRun(opt, ['islogin']);
  const m = /\{[^{}]*"login"[^{}]*\}/.exec(out);
  return m ? JSON.parse(m[0]) : null;
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
        '  [--port 17900] [--cli <开发者工具 cli 路径>] [--auto-port 9420] \\',
        '  [--connect-timeout 20] [--timeout 120] \\',
        '  [--skip-build]   产物已是最新时跳过 ng run',
        '',
        '前提：开发者工具已启动，服务端口已开启（真实 AppID 还需要已登录）。',
        '设备端是主动连出 ws://127.0.0.1:<port>；--auto-port 只是 `cli auto`',
        '开项目用的，vitest 自己不连它。',
        '',
        '为什么用 `cli auto` 不用 `cli open`：open 会过 IDE 里的 appid 校验，',
        '游客号（touristappid）直接报「不存在此 AppID (code 10)」；auto 不走',
        '那条校验，游客号能直接开。',
      ].join('\n'),
    );
    process.exit(opt.help ? 0 : 2);
  }

  const projectDir = path.resolve(opt.project);
  const distDir = path.resolve(opt.dist);
  if (!fs.existsSync(projectDir))
    throw new Error(`项目目录不存在: ${projectDir}`);

  /**
   * ---- 0. 登录态/服务端口预检
   *
   * 放在构建前面：工具连不上时一秒就报错，而不是等完四十秒构建再挂。
   * 顺带把 IDE 拉起来（CLI 自己会拉），后面 auto 就不用把冷启动
   * 算到连入超时里。未登录不硬断：游客 appid 本来就不需要登录。
   */
  const login = cliLogin(opt);
  if (login === null) {
    throw new Error(
      '连不上开发者工具的服务端口（cli islogin 拿不到结果）。\n' +
        '  • 确认微信开发者工具已启动\n' +
        '  • 确认 设置 → 安全设置 → 服务端口 已开启\n' +
        '  • CLI 路径不对时用 --cli <cli.bat> 或环境变量 WX_DEVTOOLS_CLI',
    );
  }
  if (login.login === true) {
    console.log('[precheck] 登录态 OK');
  } else {
    console.log(
      '[precheck] 未登录：游客 appid（touristappid）照样能跑，' +
        '真实 AppID 会挂。',
    );
  }

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

  /**
   * 上一轮残留的 vitest 会把 17900 占着（产物里烧的就是这个端口，
   * 设备连的是旧服务，本轮永远零推进）。先按端口清干净，清不掉再说。
   */
  await freePort(opt.port);
  if (await portInUse(opt.port)) {
    throw new Error(
      `端口 ${opt.port} 清不掉，还被别的进程占着。手动找到它并关掉，` +
        '或换个 --port（注意 angular.json 里 test.options.port 要一起改）。',
    );
  }

  /**
   * 先关掉同路径的旧窗口，再等自动化端口释放。
   *
   * `cli auto` 自己也会关旧窗口，但它只等 1.5s 就重开——上一轮模拟器还没
   * 退干净时新窗口会卡在 appLaunch（WeappLog 里就是 `routeTo appLaunch
   * timeout`，表现是「auto 成功了但设备永远不连」）。karma 时代踩过同一个
   * 坑，当时的解法就是 close + 等端口释放。
   */
  if (await portInUse(opt.autoPort)) {
    console.log(`[devtools] close --project ${distDir}（清掉上一轮的窗口）`);
    cliRun(opt, ['close', '--project', `"${distDir}"`]);
    const freed = await waitPortFree(opt.autoPort, 20_000);
    if (!freed) {
      console.log(
        `[devtools] 自动化端口 ${opt.autoPort} 20s 没释放，继续试 auto ` +
          '（真开不出来就是会话被占，手动关掉开发者工具里的项目窗口）',
      );
    }
  }

  console.log(`[vitest] 起 vitest run（cwd=${projectDir}）`);
  // 合成一条命令串走 shell：spawn 带 args + shell:true 会吃 DEP0190，
  // 路径里有空格还会被拆坏。
  const vitest = spawn(`npx vitest run --config ${quote(opt.config)}`, {
    cwd: projectDir,
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      // 把本脚本的「等设备连入」上限透给测试工程的 vitest 配置，两边
      // 共用一个数。不然这边 --connect-timeout 60、那边 30s 先到期，
      // 报错还落在 session 里。
      MP_VITEST_CONNECT_TIMEOUT: String(Math.round(opt.connectTimeout * 1000)),
      // 同理透端口：没这个透传时，--port 只改了脚本自己的日志，宿主
      // 实际还在听 vitest.config.mts 里写死的端口，指错了也“莫名成功”。
      MP_VITEST_PORT: String(opt.port),
    },
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
    killTree(vitest);
    throw e;
  }

  const exited = new Promise((resolve) =>
    vitest.once('exit', (code) => resolve(code ?? 1)),
  );

  /**
   * ---- 开项目：用 auto，不用 open
   *
   * `cli open` 会走 IDE 里的 formatProject，那里对空/游客 appid 直接
   * throw CLI_INVALID_APPID（就是「不存在此 AppID (code 10)」），而仓库
   * 里提交的就是 touristappid。`cli auto` 走的是另一条路径，不校 appid，
   * 所以 karma 时代游客号能跑——这里得跟它一致。
   */
  console.log(
    `[devtools] auto --project ${distDir} --auto-port ${opt.autoPort}`,
  );
  const opened = cliRun(opt, [
    'auto',
    '--project',
    `"${distDir}"`,
    '--auto-port',
    String(opt.autoPort),
  ]);
  if (opened.trim()) console.log(opened.trim());
  /**
   * CLI 失败不能往下走。不查这一条的话，open 挂了（appid / 登录 / 会话）
   * 只能干等到连入超时，错误信息里完全看不到真正的原因。
   */
  if (cliFailed(opened)) {
    killTree(vitest);
    throw new Error(
      `开发者工具没能打开项目：${cliReason(opened)}\n` +
        '  • 报「不存在此 AppID」→ 产物 project.config.json 里的 appid 不可用\n' +
        '  • 报「需要重新登录」→ 手动打开工具扫码登录，或改回 touristappid\n' +
        `  • 报会话/端口占用 → 关掉已开的项目窗口，或换个 --auto-port`,
    );
  }

  console.log(
    `[vitest] 等设备连入 ws://127.0.0.1:${opt.port}` +
      `（${opt.connectTimeout}s 内连不上就当失败）`,
  );
  /**
   * 连入阶段只给 connectTimeout（默认 20s）。
   *
   * 项目已经打开了，正常几秒内就连回来；迟迟不连就是根本连不上（没打开 /
   * urlCheck 没关 / 产物里的 MP_VITEST_PORT 和 --port 不一致），多等只是白等。
   */
  const first = await Promise.race([
    waitUntil(() => DEVICE_CONNECTED_RE.test(log), 200).then(() => 'connected'),
    exited.then((code) => ({ code })),
    sleep(opt.connectTimeout * 1000).then(() => 'timeout'),
  ]);
  if (first === 'timeout') {
    killTree(vitest);
    throw new Error(
      `${opt.connectTimeout}s 内小程序没连上来。常见原因：\n` +
        '  • 开发者工具没把项目开在 ' +
        distDir +
        '\n' +
        '  • project.config.json 里 setting.urlCheck 不是 false（ws://127.0.0.1 被拦）\n' +
        `  • 产物里的 MP_VITEST_PORT 和 --port ${opt.port} 不一致`,
    );
  }
  if (typeof first === 'object') process.exit(first.code);

  console.log(`[vitest] 设备已连入，开始跑（整轮 ${opt.timeout}s 上限）`);
  const result = await Promise.race([
    exited,
    sleep(opt.timeout * 1000).then(() => 'timeout'),
  ]);
  if (result === 'timeout') {
    killTree(vitest);
    throw new Error(
      `连上了但 ${opt.timeout}s 内没跑完。看上面的输出卡在哪一个 spec；` +
        '确实需要更久就调大 --timeout。',
    );
  }
  process.exit(result);
}

/**
 * 轮询到条件成立。没成立就每 intervalMs 重试，一直等。
 */
async function waitUntil(pred, intervalMs) {
  for (;;) {
    if (pred()) return;
    await sleep(intervalMs);
  }
}

/** 等端口空出来（窗口关闭是异步的，close 回来不等于端口已释放）。 */
async function waitPortFree(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (!(await portInUse(port))) return true;
    if (Date.now() > deadline) return false;
    await sleep(500);
  }
}

main().catch((e) => {
  console.error(`[wechat-vitest] 失败: ${e && e.message}`);
  process.exit(1);
});
