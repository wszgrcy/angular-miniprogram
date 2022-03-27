require('ts-node').register({
  /* options */
  scope: true,
  cwd: __dirname,
});
let obj = require('./launcher');
obj = { ...obj.default, ...require('./karma').default };
module.exports = obj;
