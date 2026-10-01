const miniProgram = function (
  this: any,
  baseBrowserDecorator: any,
  config: any,
) {
  baseBrowserDecorator(this);
  const self = this;
  this.name = 'miniprogram';
  this._start = function (url: string) {};
  /**
   * `'done'` **必须发**，但**不能在 kill handler 的同步栈里发**。
   *
   * 为什么必须发：karma `lib/launcher.js` 的并发 job 队列只由
   * `'done'` / `browser_process_failure` 释放槽位，而这两个事件都只在
   * `BaseLauncher._done()` 里发 —— `_done()` 又只被 `launchers/process.js`
   * （自己 spawn 浏览器进程那种）调用。本 launcher 是纯 base + 空 `_start`，
   * 永远走不到 `_done()`，所以这里不发就再没人发，job 永不结束、队列卡死。
   *
   * 为什么不能同步发：`restart()` 里 `killingPromise = this.emitAsync('kill')`
   * 是同步进到本 handler 的，同步 emit('done') 会直接重入 RetryLauncher，
   * 而 karma `retry.js` 是 `this.restart(); this._retryLimit--;`（自减在
   * restart 之后），重入时计数根本减不到 —— 同一毫秒无限重试直到把栈撑爆。
   *
   * 挪到 nextTick：此时 `emitAsync('kill')` 已返回，不在同步栈里，
   * `_retryLimit--` 能正常执行，重试次数才会真的收敛。
   */
  this.on('kill', function (done: any) {
    process.nextTick(() => {
      self.emit('done');
      done();
    });
  });
};

miniProgram.$inject = ['baseBrowserDecorator', 'config.jsdomLauncher'];

export default {
  'launcher:miniprogram': ['type', miniProgram],
};
