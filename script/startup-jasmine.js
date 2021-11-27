const { register } = require('ts-node');
const { createTransformer } = require('static-injector/transform');
const Jasmine = require('jasmine');
const path = require('path');
const fs = require('fs');
const inputPath = '../tsconfig.spec.json';
const filePath = path.resolve(__dirname, inputPath);
const tsConfigBuffer = fs.readFileSync(filePath);

register({
  compilerOptions: JSON.parse(tsConfigBuffer.toString()).compilerOptions,
  transformers: (program) => {
    const transformer = createTransformer(program);
    return {
      before: [transformer],
    };
  },
});
var jasmine = new Jasmine();
args = process.argv.slice(2) || [];
jasmine.loadConfigFile(path.resolve(__dirname, '../jasmine.json'));
jasmine.execute(undefined, args[0] || undefined);
