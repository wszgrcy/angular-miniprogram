#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * 微信小程序 karma 测试的一键执行器。
 *
 * 背景：karma 的 launcher 是占位实现，不会自己拉起微信开发者工具，
 * 而开发者工具 CLI 又要求真实 AppID。所以完整链路必须有人把两边
 * 串起来——这个脚本就是那个「串」的角色。
 *
 * 它做的事：
 *   1. 清掉占着 karma 端口的残留进程
 *      （端口漂了的话产物里烧的还是旧端口，客户端永远连不上）
 *   2. 后台起 `ng test`，等 karma server ready
 *   3. 用开发者工具 CLI 打开测试产物并开自动化端口
 *   4. 轮询日志抓 `Executed X of Y`，判成败
 *   5. 收尾杀进程，按结果给退出码（可直接进 CI）
 *
 * 用法：
 *   node script/wechat-karma.mjs \
 *     --project <被测项目目录> \
 *     --dist    <测试产物目录> \
 *     --appid   <真实小程序 AppID> \
 *     [--cli    <微信开发者工具 cli.bat 路径>] \
 *     [--karma-port 9876] [--auto-port 9420] [--timeout 180]
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// ---------------------------------------------------------------- 参数

function parseArgs(argv) {
  const out = {
    karmaPort: 9876,
    autoPort: 9420,
    idePort: 0,
    timeout: 45,
    cli: process.env.WX_DEVTOOLS_CLI || defaultCliPath(),
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
      case '--appid':
        out.appid = next();
        break;
      case '--cli':
        out.cli = next();
        break;
      case '--karma-port':
        out.karmaPort = Number(next());
        break;
      case '--auto-port':
        out.autoPort = Number(next());
        break;
      case '--ide-port':
        out.idePort = Number(next());
        break;
      case '--ng-target':
        out.ngTarget = next();
        break;
      case '--timeout':
        out.timeout = Number(next());
        break;
      case '-h':
      case '--help':
        out.help = true;
        break;
      default:
        throw new Error(`未知参数: ${a}`);
    }
  }
  return out;
}

function defaultCliPath() {
  const win = 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat';
  if (fs.existsSync(win)) {
    return win;
  }
  const mac = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
  if (fs.existsSync(mac)) {
    return mac;
  }
  throw new Error(
    '找不到微信开发者工具 CLI，请用 --cli 或环境变量 WX_DEVTOOLS_CLI 指定',
  );
}

// ---------------------------------------------------------------- 工具

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.once('error', () => resolve(false));
    s.setTimeout(800, () => {
      s.destroy();
      resolve(false);
    });
  });
}

/**
 * Windows 上按端口找 PID 杀残留。
 *
 * 不能只杀 ng：karma server 是 ng 起的子进程，ng 死了它可能还活着，
 * 下次跑就端口漂移。必须按端口清干净。
 */
async function freePort(port) {
  if (!(await portInUse(port))) {
    return;
  }
  console.log(`[karma] 端口 ${port} 被占用，清理中…`);
  const { execSync } = require('node:child_process');
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano -p tcp`, { encoding: 'utf8' });
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
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } catch {
          /* 已退出 */
        }
      }
    } else {
      const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' });
      for (const pid of out.split('\n').filter(Boolean)) {
        try {
          process.kill(Number(pid), 'SIGKILL');
        } catch {
          /* 已退出 */
        }
      }
    }
  } catch {
    /* 没找到也正常 */
  }
  // 等 OS 真正释放
  for (let i = 0; i < 20 && (await portInUse(port)); i++) {
    await sleep(500);
  }
}

function tail(text, n) {
  return text.split('\n').slice(-n).join('\n');
}

function fmtMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

/**
 * 运行时致命错误特征。
 *
 * 实测过对比（同一套工具、两份日志）：
 *   通过日志：TypeError 0 / 小程序 ERROR 0 / Cannot read 0 / afterAll 0
 *   失败日志：TypeError 24 / 小程序 ERROR 12 / Cannot read 24 / afterAll 12
 * 分离得很干净，所以当硬失败信号是安定的。
 *
 * 故意**不含** `DeprecationWarning` 和 `[EVAL]`：那俩是构建警告，
 * 通过的日志里也会出现（分别 2 条 / 1 条），当失败会误杀。
 */
const RUNTIME_ERROR_RE =
  /(小程序 ERROR|An error was thrown in afterAll|TypeError:|ReferenceError:|RangeError:|Cannot read properties|Cannot find module|is not a function|is not defined)/;

/** 抓日志里第一条命中错误的行（去掉 ANSI 转义）。 */
function pickLine(log, re) {
  const clean = log.replace(/\x1b\[[0-9;]*m/g, '');
  for (const line of clean.split('\n')) {
    if (re.test(line)) {
      return line.trim().slice(0, 200);
    }
  }
  return null;
}

/** 最人一条 karma 汇总行 `Executed N of M (K FAILED)`。 */
function lastSummary(log) {
  const all = [
    ...log
      .replace(/\x1b\[[0-9;]*m/g, '')
      .matchAll(/Executed (\d+) of (null|\d+)(?: \((\d+) FAILED\))?/g),
  ];
  return all.length ? all[all.length - 1] : null;
}

/** 最人一条汇总行的原文，拿不到就返回空串。 */
function lastSummaryLine(log) {
  const clean = log.replace(/\x1b\[[0-9;]*m/g, '');
  const lines = clean.split('\n').filter((l) => /Executed \d+/.test(l));
  return lines.length ? lines[lines.length - 1].trim().slice(0, 200) : '';
}

/**
 * 解析 karma 汇总行，判断它是不是「已收尾」的终态。
 *
 * 权威格式（karma/lib/reporters/base.js renderBrowser）：
 *
 *   <browser>: Executed <N> of <total>[ (K FAILED)][ (skipped S)]
 *              [ SUCCESS | ERROR | DISCONNECTED] (<totalTime> / <netTime>)
 *
 * 关键在第一个括号里的 **totalTime 是服务端自己的耗时**：
 *   跑动中恒为 `0 secs`，只有收到 complete 调 totalTimeEnd() 后才非零。
 *
 * 实测对比：
 *   Executed 12 of null SUCCESS (0 secs / 15.949 secs)        ← 还在跑
 *   Executed 13 of null SUCCESS (0 secs / 17.293 secs)        ← 还在跑
 *   Executed 13 of null SUCCESS (15.985 secs / 17.293 secs)  ← 收尾了
 *
 * 所以「第一个括号非零」就是板上钉钉的跑完，不用猜静默窗口。
 * （上一版用 1200ms 静默判结束，而实测每个 spec 就要 ~1.2s，
 * 直接在 spec 之间误触发，把只跑了 3/13 报成 PASS。）
 */
function parseSummary(line) {
  const clean = line.replace(/\x1b\[[0-9;]*m/g, '');
  const m = /Executed (\d+) of (null|\d+)/.exec(clean);
  if (!m) {
    return null;
  }
  const failedM = /\((\d+) FAILED\)/.exec(clean);
  const state = /\bERROR\b/.test(clean)
    ? 'ERROR'
    : /\bDISCONNECTED\b/.test(clean)
      ? 'DISCONNECTED'
      : /\bSUCCESS\b/.test(clean)
        ? 'SUCCESS'
        : null;
  const t = /\(([\d.]+) secs \/ ([\d.]+) secs\)/.exec(clean);
  const serverSecs = t ? Number(t[1]) : null;
  return {
    executed: Number(m[1]),
    total: m[2] === 'null' ? null : Number(m[2]),
    failed: failedM ? Number(failedM[1]) : 0,
    state,
    serverSecs,
    finalized: serverSecs !== null && serverSecs > 0,
  };
}

/**
 * 取日志里最可靠的汇总行。
 *
 * 优先返回**已收尾**（finalized）的那条，而不是单纯最后一行——
 * 因为脚本自己也会打 `[PASS] Executed 13 of null SUCCESS` 这种
 * 没有耗时括号的行，拿「最后一行」会被它污染成 finalized=false。
 * 实跑中我们在自己那行出现前就返回了，但依赖这个时序太脆。
 */
function lastParsedSummary(log) {
  const clean = log.replace(/\x1b\[[0-9;]*m/g, '');
  const lines = clean.split('\n').filter((l) => /Executed \d+/.test(l));
  let last = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const s = parseSummary(lines[i]);
    if (!s) {
      continue;
    }
    if (s.finalized) {
      return s;
    }
    if (!last) {
      last = s;
    }
  }
  return last;
}

/**
 * 收集可能占着自动化会话的项目目录。
 *
 * 自动化产物目录由 karma builder 的 outputPath 决定，形状不统一：
 *   template： <项目>/dist/karma/first
 *   库 fixture： <项目>/test/hello-world-app/dist/karma/app
 * 注意 `<库>/dist/karma/*` 下面其实是**构建产物**（client/plugin/vite），
 * 不是自动化项目录，扫的时候不能把它们当成候选当真去关。
 *
 * 所以扫这几层，只收真实存在的目录（X / Y 代表任意一层目录名）：
 *   <项目>/dist/karma/<t>
 *   <项目>/X/dist/karma/<t>
 *   <兄弟项目>/dist/karma/<t>
 *   <兄弟项目>/Y/dist/karma/<t>
 */
function collectAutomationDists(projectDir, distDir) {
  const found = new Set();
  const SKIP = new Set([
    'node_modules',
    '.git',
    '.angular',
    'coverage',
    '__pycache__',
  ]);

  /** 一个目录是不是自动化产物（小程序工程必有 app.json）。 */
  const isAutomationDist = (dir) => {
    try {
      return fs.statSync(path.join(dir, 'app.json')).isFile();
    } catch {
      return false;
    }
  };

  /** 限深递归找 `**\/dist/karma/<带 app.json 的目录>`。 */
  const walk = (root, depth) => {
    if (depth < 0) {
      return;
    }
    const karmaDir = path.join(root, 'dist', 'karma');
    try {
      for (const e of fs.readdirSync(karmaDir, { withFileTypes: true })) {
        if (e.isDirectory() && isAutomationDist(path.join(karmaDir, e.name))) {
          found.add(path.join(karmaDir, e.name));
        }
      }
    } catch {
      /* 没有这个目录，正常 */
    }
    let entries;
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith('.')) {
        continue;
      }
      // 不往 dist 里钻：dist 内部只认上面那层 dist/karma
      if (e.name === 'dist') {
        continue;
      }
      walk(path.join(root, e.name), depth - 1);
    }
  };

  // 深度 4 足够盖到 <repo>/test/<app>/dist/karma/<t> 这种嵌套
  walk(path.resolve(projectDir), 4);

  /**
   * 「兄弟仓库」该从哪层算。
   *
   * 不能直接用 dirname(projectDir)：库 fixture 的 projectDir 是
   * `<repo>/test/hello-world-app`，它的直接父目录是 `<repo>/test`，
   * 而 template 是 `<repo>` 的兄弟、不是 `<repo>/test` 的兄弟，
   * 这样算永远扫不到。所以先向上找到仓库根（带 .git 的那层），
   * 再用仓库根的父目录当兄弟层。几层祖先都当候选，能盖全。
   */
  const siblingsRoots = new Set();
  let cur = path.resolve(projectDir);
  for (let i = 0; i < 6; i++) {
    const parent = path.dirname(cur);
    if (parent === cur) {
      break;
    }
    siblingsRoots.add(parent);
    // 找到仓库根就停：再往上的兄弟层没意义
    try {
      if (fs.existsSync(path.join(cur, '.git'))) {
        break;
      }
    } catch {
      /* 忽略 */
    }
    cur = parent;
  }

  for (const s of siblingsRoots) {
    try {
      for (const e of fs.readdirSync(s, { withFileTypes: true })) {
        if (e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith('.')) {
          walk(path.join(s, e.name), 4);
        }
      }
    } catch {
      /* 读不了就算了 */
    }
  }

  if (distDir) {
    found.add(path.resolve(distDir));
  }
  return [...found].filter((d) => fs.existsSync(d));
}

/**
 * 带反馈的等待——取代「闭眼 sleep」和「哑轮询」。
 *
 * 和裸等的区别：
 *   - 轮询间隔短（200ms），条件一满足立刻走，不白等
 *   - 每 heartbeatMs 打一行「在等什么 · 已经多久 · 现在观测到什么」，
 *     等的时候看得见在推进，不是对着黑屏猜
 *   - 超时不只说「超时」，把当时观测到的状态 + 排查方向一起给出
 *
 * check() 返回：
 *   { done: true,  info }   完成，info 是一句话状态
 *   { done: false, waiting } 未完成，waiting 是一句话描述现在卡在哪
 */
async function waitUntil(label, opts) {
  const { check, timeoutMs, heartbeatMs = 3000, hint = '' } = opts;
  const started = Date.now();
  let lastBeat = 0;
  let lastWaiting = '';
  for (;;) {
    let obs;
    try {
      obs = await check();
    } catch (e) {
      obs = { done: false, waiting: `check 抛错: ${e.message}` };
    }
    const now = Date.now();
    if (obs && obs.done) {
      console.log(
        `  ✓ ${label}  ${fmtMs(now - started)}` +
          (obs.info ? `  · ${obs.info}` : ''),
      );
      return true;
    }
    const waiting = (obs && obs.waiting) || '尚未就绪';
    if (waiting !== lastWaiting) {
      // 状态一变就报，不用等心跳——这样卡在哪个新阶段能立刻看到
      lastWaiting = waiting;
      console.log(`  · ${label}  ${fmtMs(now - started)}  · ${waiting}`);
      lastBeat = now;
    } else if (now - lastBeat >= heartbeatMs) {
      lastBeat = now;
      console.log(`  · ${label}  已等 ${fmtMs(now - started)}  · ${waiting}`);
    }
    if (now - started >= timeoutMs) {
      console.error(`  ✗ ${label}  ${fmtMs(now - started)} 超时`);
      console.error(`      当时状态: ${waiting}`);
      if (hint) {
        console.error(`      排查: ${hint}`);
      }
      return false;
    }
    await sleep(200);
  }
}

/**
 * 失败时把整条链路的状态一次打出来，免得对着一个「FAIL」猜。
 */
function reportFailure(phase, facts) {
  console.error('');
  console.error('──────── 失败诊断 ────────');
  console.error(`  卡在阶段: ${phase}`);
  for (const [k, v] of Object.entries(facts)) {
    console.error(`  ${k}: ${v}`);
  }
  console.error('──────────────────────────');
}

// ---------------------------------------------------------------- 主流程

/**
 * 跑一次 cli 并把输出里的 `{"login":...}` 抓出来。
 *
 * 拿不到 JSON 返回 null（连不上 / 服务端口没开 / 工具没跑）。
 */
function cliLogin(opt) {
  const out = cliRun(opt, ['islogin']);
  const m = /\{[^{}]*"login"[^{}]*\}/.exec(out);
  return m ? JSON.parse(m[0]) : null;
}

/**
 * 跑一次 cli，返回 stdout（失败不抛，返回空串）。
 *
 * 必须 shell:true —— Node 18+ 不能直接 exec .bat/.cmd，会直接抛
 * EINVAL（-4071）。shell 模式下路径得自己加引号，否则
 * `C:\Program Files (x86)\...` 会被拆成 `C:\Program`。
 *
 * 用 spawnSync + 单条命串（而不是传 args 数组），避开
 * “Passing args to a child process with shell option true” 弃用警告。
 * 这里拼的都是自己控制的固定串 + 数字，无注入面。
 */
function cliRun(opt, actionArgs) {
  const args = ['--lang', 'zh'];
  if (opt.idePort) {
    args.push('--port', String(opt.idePort));
  }
  args.push(...actionArgs);
  try {
    const cmd = [`"${opt.cli}"`, ...args].join(' ');
    const r = spawnSync(cmd, {
      encoding: 'utf8',
      timeout: 90_000,
      shell: true,
    });
    return String(r.stdout || '');
  } catch (e) {
    return '';
  }
}

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (opt.help || !opt.project || !opt.dist) {
    console.log(
      [
        '用法: node script/wechat-karma.cjs \\',
        '  --project <被测项目目录> \\',
        '  --dist <测试产物目录> \\',
        '  [--appid <真实小程序 AppID>]  不传则从产物 project.config.json 读',
        '  [--cli <开发者工具 cli 路径>] [--karma-port 9876] [--auto-port 9420] [--timeout 180]',
        '  [--ide-port <IDE 服务端口>]  不传则读 .ide 文件里记录的值',
        '  [--ng-target <项目名>]  ng test 的目标（angular.json 没设 defaultProject 时必需，如 first）',
        '',
        '注意：游客 appid（touristappid）也能跑测试，实测 13/13 SUCCESS。',
      ].join('\n'),
    );
    process.exit(opt.help ? 0 : 2);
  }

  const projectDir = path.resolve(opt.project);
  const distDir = path.resolve(opt.dist);
  if (!fs.existsSync(projectDir))
    throw new Error(`项目目录不存在: ${projectDir}`);
  /**
   * **不能**在这里检查 distDir 存在。
   *
   * 产物是下面 `ng test` 现编的（见后面「产物是 ng test 现编的」那段轮询），
   * 提前要求它存在 = 干净检出永远跑不了，只能先手动 mkdir 骗过去。
   * 真出问题时由后面的 waitUntil(app.json) 报，那里才能带上 ng test 的上下文。
   */

  // 没传 --appid 就从 project.config.json 里读，省得重复指定。
  // 产物此时还不存在，所以先看产物、再看源文件，最后兜游客 appid
  // （脚本 help 里写了：touristappid 实测能跑完全部用例）。
  if (!opt.appid) {
    const candidates = [
      path.join(distDir, 'project.config.json'),
      path.join(projectDir, 'src', 'project.config.json'),
    ];
    for (const pc of candidates) {
      if (!fs.existsSync(pc)) continue;
      try {
        opt.appid = JSON.parse(fs.readFileSync(pc, 'utf8')).appid;
      } catch {
        continue;
      }
      if (opt.appid) {
        console.log(
          `[karma] 从 ${path.relative(process.cwd(), pc) || pc} 读到 appid=${opt.appid}`,
        );
        break;
      }
    }
  }
  if (!opt.appid) {
    opt.appid = 'touristappid';
    console.log('[karma] 没找到 appid，用游客 appid 兜底');
  }

  // ---- 0. 预检登录态
  /**
   * 必须在起 karma 之前查。
   *
   * 未登录时 `cli auto` 会**假成功**：照样回 `✔ auto`，但小程序永远
   * 不连 karma，于是整轮白等到超时，错误信息里完全看不到登录线索。
   * 提前查一次，把「等 3 分钟不知道为啥」变成「1 秒告诉你去登录」。
   *
   * 实测：CLI 自己拉起的 IDE 实例是登出状态，**同一个 profile 也不带
   * 登录态**，等多久都不会恢复。所以必须手动开 IDE 并扫码登录。
   */
  const login = cliLogin(opt);
  if (login === null) {
    throw new Error(
      '连不上开发者工具的服务端口。\n' +
        '  • 确认微信开发者工具已启动\n' +
        '  • 确认 设置 → 安全设置 → 服务端口 已开启\n' +
        '  • 端口对不上时用 --ide-port <端口> 指定（CLI 默认读 .ide 文件里记的值）',
    );
  }
  if (login.login !== true) {
    throw new Error(
      '开发者工具未登录。\n' +
        'CLI 拉起的 IDE 实例是登出状态（实测同 profile 也不带登录态，等待也不会恢复），\n' +
        '必须手动打开微信开发者工具并扫码登录后再跑。',
    );
  }
  console.log('[precheck] 登录态 OK');

  // ---- 0.5 先关掉所有可能占着自动化会话的项目窗口
  /**
   * 这是之前反复失败的**真正原因**，跟 appid 是游客还是真实无关。
   *
   * A/B 实测（同一套代码、同一个机器）：
   *   先 cli close  → Executed 13 of null SUCCESS（连复两次）
   *   不 close 直接跑 → Disconnected ... transport close → Executed 0
   *
   * 机制：DevTools 的自动化会话同一时刻只能有一个。上一轮跑完脚本
   * 只杀了 node/karma，**项窗口还开在 IDE 里**；新一轮 `cli auto`
   * 去抢会话，旧连接被强制 close，karma 那边刚连上就断。
   *
   * 只关自己的 dist 还不够——会话是整个 DevTools 实例全局唯一的，
   * **别的项目**的窗口开着照样会抢。实测（库 fixture 与 template 互为邻居）：
   *   template 窗口没关 → 跑库 fixture → Executed 0
   *   关掉 template 窗口 → 跑库 fixture → Executed 13 SUCCESS
   * CLI 没有「列出已打开项目」的命令，只能按路径 close，所以只能把
   * 候选目录扫出来逐个关。项目没开时 close 会报错，忽略即可。
   */
  const automationDists = collectAutomationDists(projectDir, distDir);
  console.log(
    `[precheck] 关闭可能残留的项目窗口（${automationDists.length} 个候选）` +
      (automationDists.length ? '\n  ' + automationDists.join('\n  ') : ''),
  );
  for (const d of automationDists) {
    cliRun(opt, ['close', '--project', `"${d}"`]);
  }
  // 关完不是睡 8s 了事——真正的信号是**自动化端口释放**。
  // 上一轮的项窗口还占着 9420，本轮 auto 就会被抢。
  // 所以直接盯着端口，一释放就走，通常 1~2 秒，不用白等。
  const released = await waitUntil('等自动化会话释放', {
    timeoutMs: 20_000,
    heartbeatMs: 1500,
    hint:
      `端口 ${opt.autoPort} 一直占着 = 有项目窗口没关掉。` +
      '在开发者工具里把它关掉，或换个 --auto-port。',
    check: async () => {
      const busy = await portInUse(opt.autoPort);
      return busy
        ? { done: false, waiting: `端口 ${opt.autoPort} 仍被占` }
        : { done: true, info: `端口 ${opt.autoPort} 已释放` };
    },
  });
  if (!released) {
    // 继续往下跑只会得到「连上但零推进」这种误导结论——因为那个
    // “Connected” 其实是旧窗口的客户端，本轮 auto 根本没绑上端口。
    // 必须在这里断掉，把真正的原因（会话没释放）说清楚。
    ng.kill('SIGKILL');
    reportFailure('自动化会话没释放', {
      卡住端口: opt.autoPort,
      已尝试关闭: automationDists.length + ' 个候选目录（见上方列表）',
      为什么不能继续:
        '端口没释放就 auto，本轮根本绑不上；日志里那个 "Connected" 是' +
        '上一个窗口的客户端，拿它等结果只会误报「零推进」。',
      怎么办:
        '开发者工具里把占着的项目窗口关掉；实在关不掉就 --auto-port 换一个端口',
    });
    process.exit(1);
  }

  await freePort(opt.karmaPort);

  // ---- 1. 起 karma server
  console.log(`[karma] ng test（cwd=${projectDir}）`);
  const ng = spawn(
    'npx',
    ['ng', 'test', ...(opt.ngTarget ? [opt.ngTarget] : [])],
    {
      cwd: projectDir,
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0' },
    },
  );

  let log = '';
  const onData = (buf) => {
    const s = buf.toString();
    log += s;
    process.stdout.write(s);
  };
  ng.stdout.on('data', onData);
  ng.stderr.on('data', onData);

  const serverReady = await waitUntil('karma server 启动', {
    timeoutMs: 90_000,
    heartbeatMs: 2000,
    hint:
      'ng test 起来但没报到 “server started”，看上面它的报错。常见：' +
      'builder 依赖缺（Cannot find module）、tsconfig 错、端口被占。',
    check: () => {
      if (/Karma v[\d.]+ server started/.test(log)) {
        return { done: true, info: 'server 已监听' };
      }
      // ng 提前死了就别等——错误已经在日志里，多等一秒都是浪费
      if (ng.exitCode !== null) {
        console.error(tail(log, 25));
        return {
          done: true,
          info: `ng 已退出(code=${ng.exitCode})，未起来`,
        };
      }
      const lastLine = tail(log, 1).trim() || '无输出';
      return { done: false, waiting: lastLine.slice(0, 120) };
    },
  });
  if (!serverReady || ng.exitCode !== null) {
    ng.kill('SIGKILL');
    reportFailure('karma server 启动', {
      原因:
        ng.exitCode !== null
          ? `ng test 直接退出，code=${ng.exitCode}`
          : '90s 内没听到 server started',
      最后日志: tail(log, 15),
    });
    process.exit(1);
  }

  // 产物是 ng test 现编的，server ready 不代表文件写完了。
  // 不睡固定时长，直接盯 app.json 出现且大小稳定。
  await waitUntil('等产物写完', {
    timeoutMs: 60_000,
    heartbeatMs: 2000,
    hint: `${distDir} 下迟迟没有 app.json = 构建没产出，看上面 ng test 的报错。`,
    check: () => {
      const appJson = path.join(distDir, 'app.json');
      if (!fs.existsSync(appJson)) {
        return {
          done: false,
          waiting: `还没生成 ${path.basename(distDir)}/app.json`,
        };
      }
      const size = fs.statSync(appJson).size;
      if (size <= 0) {
        return { done: false, waiting: 'app.json 大小为 0，还在写' };
      }
      return { done: true, info: `app.json ${size} 字节` };
    },
  });

  // ---- 2. 拉起开发者工具
  console.log(
    `[devtools] auto --project ${distDir} --auto-port ${opt.autoPort}`,
  );
  const dev = spawn(
    // shell:true 下必须自己加引号，否则 `C:\Program Files (x86)\...`
    // 会被拆成 `C:\Program` 直接报「不是内部或外部命令」
    `"${opt.cli}"`,
    [
      '--lang',
      'zh',
      ...(opt.idePort ? ['--port', String(opt.idePort)] : []),
      'auto',
      '--project',
      `"${distDir}"`,
      '--auto-port',
      String(opt.autoPort),
    ],
    { shell: true, env: process.env },
  );
  dev.stdout.on('data', (b) => process.stdout.write(b));
  dev.stderr.on('data', (b) => process.stdout.write(b));

  // ---- 3. 判定：看日志已经说了什么，而不是等了多久
  //
  // 测试本身没有耗时任务（13 个 spec 实跑十几秒）。所以判定不该靠
  // 「等够多久」，而该靠「日志里已经出现了什么」。每 100ms 扫一遍，
  // 出现即走：
  //
  //   ① 明确失败优先——运行时报错、FAILED、afterAll 报错。
  //      旧版最大的坑就在这：日志里早就糊满
  //      `TypeError: Cannot read properties of undefined`
  //      却规规矩矩只认 Executed 模式，把眼前的错误当没看见，
  //      最后靠超时收尾、报成「零推进」，把明确错误说成谜案。
  //   ② 跑满即通过——Executed N of M 且 N>=M。
  //   ③ 跑过且静默——有推进且短暂无新增，视为跑完。
  //   ④ 什么都没出现——短窗口直接判「没跑起来」，附最后日志。
  const startedAt = Date.now();
  const noSpecMs = 8000; // 连上后这么久一条 spec 都没跑 = 没起来

  const verdict = await (async () => {
    let lastExecuted = -1;
    let prevLen = log.length;
    let lastChangeTs = Date.now();
    let connectedTs = null;

    for (;;) {
      // ① 错误优先：日志里已经有异常，立刻定死，不再等
      const errLine = pickLine(log, RUNTIME_ERROR_RE);
      if (errLine) {
        return { ok: false, why: '运行时报错', detail: errLine };
      }

      if (connectedTs === null && /Connected on socket/.test(log)) {
        connectedTs = Date.now();
        console.log(`  ✓ 小程序连上 karma  ${fmtMs(connectedTs - startedAt)}`);
      }

      const m = lastSummary(log);
      const executed = m ? Number(m[1]) : 0;
      const total = m && m[2] !== 'null' ? Number(m[2]) : null;
      const failed = m ? Number(m[3] || 0) : 0;
      const s = lastParsedSummary(log);

      // ①b 汇总行里带 FAILED
      if (failed > 0) {
        return {
          ok: false,
          why: `${failed} 个 spec 失败`,
          executed,
          total,
          detail: lastSummaryLine(log),
        };
      }

      // ② 跑满即通过。放在收尾检查**之前**：`executed = success + failed`，
      //    跑满就说明所有 spec 都记账了（含失败的），不必再等服务端
      //    写 complete 后的那行汇总，能早一截定下来。
      if (total !== null && executed >= total) {
        return { ok: failed === 0, why: 'executed >= total', executed, total };
      }

      // ②b 收尾定性：服务端 totalTime 非零 = 已收到 complete。
      //
      // ⚠️ 但「收尾」绝不等于「跑完」！实测踩过：
      //   小程序: Executed 1 of 2 SUCCESS (0.002 secs / 0.023 secs)
      // 第二个 spec 根本没执行，karma 照样收尾并挂着 SUCCESS，
      // 当时就被判成了 PASS——这是假绿，比红更危险。
      // 所以收尾时必须同时核对跑满；没跑满就是不完整运行，算失败。
      if (s && s.finalized) {
        if (s.total !== null && s.executed < s.total) {
          return {
            ok: false,
            why:
              `收尾了但只跑了 ${s.executed}/${s.total}，` +
              `有 ${s.total - s.executed} 个 spec 根本没执行到`,
            executed: s.executed,
            total: s.total,
            detail: lastSummaryLine(log),
          };
        }
        const ok = s.state === 'SUCCESS' && s.failed === 0;
        return {
          ok,
          why:
            `终态 ${s.state}（服务端耗时 ${s.serverSecs}s` +
            (s.failed ? `，失败 ${s.failed}` : '') +
            '）',
          executed: s.executed,
          total: s.total,
          detail: lastSummaryLine(log),
        };
      }

      // 跟踪推进（executed 变了、或日志有新增内容都算）
      if (executed !== lastExecuted) {
        lastExecuted = executed;
        lastChangeTs = Date.now();
      } else if (log.length !== prevLen) {
        prevLen = log.length;
        lastChangeTs = Date.now();
      }

      // ④ 连上了但一条 spec 都没跑
      if (
        connectedTs !== null &&
        executed === 0 &&
        Date.now() - connectedTs > noSpecMs
      ) {
        return {
          ok: false,
          why: `连上后 ${noSpecMs}ms 内没有任何 spec 执行`,
          executed: 0,
          total: null,
          detail: lastSummaryLine(log),
        };
      }

      // ng 自己退了（singleRun 跑完会退）
      if (ng.exitCode !== null) {
        return {
          ok: executed > 0 && failed === 0,
          why: `ng 退出(code=${ng.exitCode})`,
          executed,
          total,
          detail: lastSummaryLine(log),
        };
      }

      if (Date.now() - startedAt > opt.timeout * 1000) {
        return null;
      }
      await sleep(100);
    }
  })();

  // ---- 4. 收尾
  ng.kill('SIGKILL');
  dev.kill('SIGKILL');
  try {
    require('node:child_process').execSync(
      'taskkill /IM "wechatdevtools.exe" /F',
      { stdio: 'ignore' },
    );
  } catch {
    /* 非 win 或已退 */
  }

  if (!verdict) {
    reportFailure('等结果', {
      超时上限: `${opt.timeout}s`,
      实际等待: fmtMs(Date.now() - startedAt),
      最后日志: tail(log, 6),
      排查:
        '既没报错也没跑完。看日志里最后一个 Executed 卡在哪个 spec，' +
        '以及有没有 karma noActivity 反复重连。',
    });
    process.exit(1);
  }
  if (!verdict.ok) {
    reportFailure('测试未通过', {
      判定: verdict.why,
      执行: `${verdict.executed ?? 0} / ${verdict.total === null || verdict.total === undefined ? '未知' : verdict.total}`,
      耗时: fmtMs(Date.now() - startedAt),
      关键日志: verdict.detail || tail(log, 6),
    });
    process.exit(1);
  }
  console.log(
    `\n[PASS] Executed ${verdict.executed} of ${verdict.total} SUCCESS` +
      `  （${fmtMs(Date.now() - startedAt)}，判定：${verdict.why}）`,
  );
  process.exit(0);
}

async function waitFor(pred, timeoutMs, what) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (pred()) return true;
    await sleep(500);
  }
  console.error(`[timeout] ${what} 超时`);
  return false;
}

main().catch((e) => {
  console.error('[wechat-karma] 失败:', e.message || e);
  process.exit(1);
});
