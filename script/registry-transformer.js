let { register } = require('ts-node');
let path = require('path');
let { createTransformer } = require('static-injector/transform');
module.exports = function registerTsNode() {
  register({
    project: path.resolve(__dirname, '../tsconfig.spec.json'),
    transformers: (program) => {
      const transformer = createTransformer(program);
      return {
        before: [transformer],
      };
    },
  });
};
