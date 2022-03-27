require('ts-node').register({
  /* options */
  scope: true,
  cwd: __dirname,
});
let obj = require('./launcher');
obj = { ...obj, ...require('./karma') };
module.exports = obj;
