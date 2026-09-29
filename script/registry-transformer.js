let { register } = require('ts-node');
let path = require('path');

// static-injector 7 不再需要 TypeScript transformer：
// DI 全部走运行时的 inject()，这里只保留 ts-node 注册。
module.exports = function registerTsNode() {
  register({
    project: path.resolve(__dirname, '../tsconfig.spec.json'),
  });
};
