const miniProgram = function (
  this: any,
  baseBrowserDecorator: any,
  config: any
) {
  baseBrowserDecorator(this);
  const self = this;
  this.name = 'miniprogram';
  this._start = function (url: string) {
    self.window = true;
  };
  this.on('kill', function (done: any) {
    self.emit('done');
    process.nextTick(done);
  });
};

miniProgram.$inject = ['baseBrowserDecorator', 'config.jsdomLauncher'];

module.exports = {
  'launcher:miniprogram': ['type', miniProgram],
};
