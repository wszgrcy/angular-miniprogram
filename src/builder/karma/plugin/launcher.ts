const miniProgram = function (
  this: any,
  baseBrowserDecorator: any,
  config: any
) {
  baseBrowserDecorator(this);
  const self = this;
  this.name = 'miniprogram';
  this._start = function (url: string) {};
  this.on('kill', function (done: any) {
    self.emit('done');
    process.nextTick(done);
  });
};

miniProgram.$inject = ['baseBrowserDecorator', 'config.jsdomLauncher'];

export default {
  'launcher:miniprogram': ['type', miniProgram],
};
